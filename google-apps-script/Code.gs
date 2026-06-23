/* ===================================================================
   Karisakattupoove Trust — Events backend (Google Apps Script)
   Paste this into Extensions > Apps Script of your Google Sheet,
   set the three CONFIG values, then Deploy > New deployment > Web app
   (Execute as: Me, Who has access: Anyone). Copy the /exec URL into
   js/config.js (EVENTS_API).  Full steps in ADMIN-SETUP.md
   =================================================================== */

// ====== CONFIG — change these ======
var ADMIN_TOKEN  = 'Karisai@2026';            // private password — only needed to create EVENTS
var NOTIFY_EMAIL = 'karisakattupoovetn@gmail.com';  // who gets emailed on every submission
var SENDER_EMAIL = 'karisakattupoovetn@gmail.com';  // emails are sent FROM this address
                                                    // (must be a verified "Send mail as" alias
                                                    //  in the Google account running this script)
var SENDER_NAME  = 'Karisakattu Poove Trust';       // display name shown to recipients
var SHEET_NAME   = 'Events';                        // tab name for events
// ===================================

// Tabs + their columns
var TABS = {
  event:        { name: 'Events',        cols: ['Timestamp','Title','Date','Time','Location','Description','Status'] },
  volunteer:    { name: 'Volunteers',    cols: ['Timestamp','Name','Phone','Email','Location','Availability','Interests','Skills'] },
  contact:      { name: 'Enquiries',     cols: ['Timestamp','Name','Email','Phone','Subject','Message'] },
  registration: { name: 'Registrations', cols: ['Timestamp','Event','Name','Phone','Email','People'] },
  donation:     { name: 'Donations',     cols: ['Timestamp','Name','Email','Phone','Amount (INR)','Payment ID'] }
};

function doGet() {
  return json({ ok: true, events: getEvents() });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var type = (body.type || 'event');

    if (type === 'event') return handleEvent(body);
    if (type === 'volunteer') return handleVolunteer(body);
    if (type === 'contact') return handleContact(body);
    if (type === 'registration') return handleRegistration(body);
    if (type === 'donation') return handleDonation(body);
    return json({ ok: false, error: 'Unknown submission type.' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// ---- Events (admin only) — create / update / delete ----
function handleEvent(body) {
  if (body.token !== ADMIN_TOKEN) return json({ ok: false, error: 'Unauthorized — wrong admin token.' });
  var action = body.action || 'create';
  var sh = tab('event');

  if (action === 'delete') {
    var dRow = Number(body.row);
    if (!dRow || dRow < 2) return json({ ok: false, error: 'Missing or invalid row to delete.' });
    sh.deleteRow(dRow);
    return json({ ok: true });
  }

  if (action === 'update') {
    var uRow = Number(body.row);
    if (!uRow || uRow < 2) return json({ ok: false, error: 'Missing or invalid row to update.' });
    if (!body.title || !body.date) return json({ ok: false, error: 'Title and date are required.' });
    // columns B..G (leave column A timestamp untouched)
    sh.getRange(uRow, 2, 1, 6).setValues([[body.title, body.date, body.time || '', body.location || '', body.description || '', body.status || 'upcoming']]);
    return json({ ok: true });
  }

  // create
  if (!body.title || !body.date) return json({ ok: false, error: 'Title and date are required.' });
  sh.appendRow([new Date(), body.title, body.date, body.time || '', body.location || '', body.description || '', body.status || 'upcoming']);
  notify('🌱 New event: ' + body.title,
    '<b>Date:</b> ' + body.date + ' ' + (body.time || '') + '<br><b>Location:</b> ' + (body.location || '-') + '<br><br>' + (body.description || ''));
  return json({ ok: true });
}

// ---- Volunteer registrations (public) ----
function handleVolunteer(body) {
  if (!body.name || !body.phone) return json({ ok: false, error: 'Name and phone are required.' });
  tab('volunteer').appendRow([new Date(), body.name, body.phone, body.email || '', body.location || '', body.availability || '', body.interests || '', body.skills || '']);
  notify('🙌 New volunteer: ' + body.name,
    '<b>Phone:</b> ' + body.phone + '<br><b>Email:</b> ' + (body.email || '-') + '<br><b>Location:</b> ' + (body.location || '-') +
    '<br><b>Availability:</b> ' + (body.availability || '-') + '<br><b>Interests:</b> ' + (body.interests || '-') + '<br><b>Skills:</b> ' + (body.skills || '-'));
  return json({ ok: true });
}

// ---- Contact enquiries (public) ----
function handleContact(body) {
  if (!body.name || !body.message) return json({ ok: false, error: 'Name and message are required.' });
  tab('contact').appendRow([new Date(), body.name, body.email || '', body.phone || '', body.subject || '', body.message]);
  notify('✉️ New enquiry: ' + body.name,
    '<b>Email:</b> ' + (body.email || '-') + '<br><b>Phone:</b> ' + (body.phone || '-') + '<br><b>Subject:</b> ' + (body.subject || '-') + '<br><br>' + body.message);
  return json({ ok: true });
}

// ---- Event registrations (public) ----
function handleRegistration(body) {
  if (!body.name || !body.phone) return json({ ok: false, error: 'Name and phone are required.' });
  tab('registration').appendRow([new Date(), body.event || '', body.name, body.phone, body.email || '', body.people || '']);
  notify('📝 New event registration: ' + body.name,
    '<b>Event:</b> ' + (body.event || '-') + '<br><b>Name:</b> ' + body.name + '<br><b>Phone:</b> ' + body.phone +
    '<br><b>Email:</b> ' + (body.email || '-') + '<br><b>People coming:</b> ' + (body.people || '-'));
  return json({ ok: true });
}

// ---- Donations (public) — log to sheet, email receipt to donor, notify admin ----
function handleDonation(body) {
  if (!body.name || !body.email) return json({ ok: false, error: 'Name and email are required.' });
  var amount = Number(body.amount) || 0;
  var payId  = body.payment_id || '';

  tab('donation').appendRow([new Date(), body.name, body.email, body.phone || '', amount, payId]);

  // Notify the trust
  notify('💚 New donation: INR ' + amount + ' from ' + body.name,
    '<b>Name:</b> ' + body.name + '<br><b>Email:</b> ' + body.email +
    '<br><b>Phone:</b> ' + (body.phone || '-') +
    '<br><b>Amount:</b> INR ' + amount + '<br><b>Payment ID:</b> ' + (payId || '-'));

  // Email an acknowledgement / receipt to the donor
  try {
    var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy');
    sendMail({
      to: body.email,
      subject: 'Thank you for your donation — Karisakattu Poove Trust',
      htmlBody: donationReceiptHtml(body.name, amount, payId, dateStr)
    });
  } catch (e) { /* sheet write already succeeded */ }

  return json({ ok: true });
}

// Format a number with Indian digit grouping, e.g. 150000 -> "1,50,000".
function formatINR(n) {
  var s = String(Math.round(Number(n) || 0));
  var last3 = s.slice(-3);
  var rest = s.slice(0, -3);
  if (rest) last3 = ',' + last3;
  rest = rest.replace(/\B(?=(\d\d)+(?!\d))/g, ',');
  return rest + last3;
}

// Branded, email-client-safe HTML receipt (table-based layout, inline styles).
function donationReceiptHtml(name, amount, payId, dateStr) {
  var amt = '&#8377;' + formatINR(amount); // ₹ with Indian grouping
  return '' +
  '<div style="margin:0;padding:0;background:#f1f5f2">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f2;padding:24px 12px">' +
    '<tr><td align="center">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.06)">' +
        // Header band
        '<tr><td style="background:#2e7d32;background:linear-gradient(135deg,#2e7d32,#1b5e20);padding:32px 32px 26px;text-align:center">' +
          '<div style="font-size:40px;line-height:1">&#127793;</div>' +
          '<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:8px">Karisakattu Poove Trust</div>' +
          '<div style="color:#d7ecd8;font-size:13px;margin-top:4px;letter-spacing:.4px">DONATION RECEIPT</div>' +
        '</td></tr>' +
        // Greeting
        '<tr><td style="padding:30px 32px 6px">' +
          '<h1 style="margin:0 0 10px;color:#1b5e20;font-size:21px">Thank you, ' + name + '! &#127793;</h1>' +
          '<p style="margin:0;color:#444;font-size:15px;line-height:1.6">We have received your generous donation. Your support helps us plant trees, grow Miyawaki forests, conserve water and uplift communities across Hosur, Tamil Nadu.</p>' +
        '</td></tr>' +
        // Amount highlight
        '<tr><td style="padding:22px 32px 6px">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9f6ea;border:1px solid #cfe9d2;border-radius:12px">' +
            '<tr><td style="padding:18px 22px;text-align:center">' +
              '<div style="color:#4b7a4f;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Amount Donated</div>' +
              '<div style="color:#1b5e20;font-size:32px;font-weight:800;margin-top:4px">' + amt + '</div>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +
        // Details table
        '<tr><td style="padding:18px 32px 6px">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;border-collapse:collapse">' +
            '<tr><td style="padding:10px 0;color:#777;border-bottom:1px solid #eee">Payment Reference</td>' +
              '<td style="padding:10px 0;text-align:right;font-weight:600;border-bottom:1px solid #eee">' + (payId || '-') + '</td></tr>' +
            '<tr><td style="padding:10px 0;color:#777;border-bottom:1px solid #eee">Date</td>' +
              '<td style="padding:10px 0;text-align:right;font-weight:600;border-bottom:1px solid #eee">' + dateStr + '</td></tr>' +
            '<tr><td style="padding:10px 0;color:#777">Trust Reg. No.</td>' +
              '<td style="padding:10px 0;text-align:right;font-weight:600">74 / 2020</td></tr>' +
          '</table>' +
        '</td></tr>' +
        // 80G note
        '<tr><td style="padding:18px 32px 4px">' +
          '<p style="margin:0;background:#fff8e1;border:1px solid #ffe9a8;border-radius:10px;padding:13px 16px;color:#7a5b00;font-size:13px;line-height:1.6">' +
          '<b>80G tax receipt:</b> This email acknowledges your contribution. For a formal 80G receipt, simply reply with your full name and PAN.</p>' +
        '</td></tr>' +
        // Sign off
        '<tr><td style="padding:20px 32px 6px">' +
          '<p style="margin:0;color:#555;font-size:14px;line-height:1.6">With gratitude,<br><b style="color:#1b5e20">Karisakattu Poove Trust</b></p>' +
        '</td></tr>' +
        // Footer
        '<tr><td style="padding:22px 32px 30px;border-top:1px solid #eee;margin-top:10px">' +
          '<p style="margin:0;color:#8a8a8a;font-size:12px;line-height:1.7">' +
            'Hosur, Tamil Nadu &middot; Trust Reg. No. 74/2020<br>' +
            '&#9993; <a href="mailto:karisakattupoovetn@gmail.com" style="color:#2e7d32;text-decoration:none">karisakattupoovetn@gmail.com</a> &nbsp;&middot;&nbsp; ' +
            '&#9742; <a href="tel:+919629280506" style="color:#2e7d32;text-decoration:none">+91 96292 80506</a><br>' +
            '&#127760; <a href="https://karisakattupoovetrust.org" style="color:#2e7d32;text-decoration:none">karisakattupoovetrust.org</a>' +
          '</p>' +
        '</td></tr>' +
      '</table>' +
    '</td></tr>' +
  '</table>' +
  '</div>';
}

function notify(subject, html) {
  try {
    sendMail({ to: NOTIFY_EMAIL, subject: subject,
      htmlBody: html + '<hr><small>Logged in your Karisakattupoove Trust Google Sheet.</small>' });
  } catch (e) { /* sheet write already succeeded */ }
}

// Send email FROM the trust alias (SENDER_EMAIL). GmailApp.sendEmail lets us set
// the "from" to any verified "Send mail as" alias on this account. We only set it
// when the alias is actually verified; otherwise we fall back to the default
// address so a receipt always goes out instead of silently failing.
function sendMail(opts) {
  var from = '';
  try {
    var aliases = GmailApp.getAliases();
    if (aliases.indexOf(SENDER_EMAIL) !== -1) from = SENDER_EMAIL;
  } catch (e) { from = ''; }

  var options = { name: SENDER_NAME, htmlBody: opts.htmlBody };
  if (from) options.from = from;
  GmailApp.sendEmail(opts.to, opts.subject, '', options);
}

function tab(type) {
  var def = TABS[type];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(def.name);
  if (!sh) { sh = ss.insertSheet(def.name); sh.appendRow(def.cols); }
  return sh;
}

function getSheet() { return tab('event'); }

function getEvents() {
  var sh = getSheet();
  var range = sh.getDataRange();
  var values = range.getValues();
  var display = range.getDisplayValues(); // exactly what each cell shows in the sheet
  if (values.length < 2) return [];
  var out = [];
  // i is the 0-based index into `values`; sheet row number is i + 1
  // (values[0] = header row 1, values[1] = data row 2, ...).
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[1]) continue; // skip rows with no title
    out.push({
      row: i + 1,
      title: r[1],
      date: formatDate(r[2]),
      // use the displayed text for time so "6 AM" / "6:00 AM" stays readable
      time: display[i][3] || formatTime(r[3]),
      location: r[4],
      description: r[5],
      status: r[6]
    });
  }
  return out;
}

function formatDate(d) {
  if (Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d)) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(d);
}

// Time may be stored as plain text ("6 AM") or auto-converted by Sheets into a
// date-time value — in which case format it back to a readable time like "6:00 AM".
function formatTime(t) {
  if (t == null || t === '') return '';
  if (Object.prototype.toString.call(t) === '[object Date]' && !isNaN(t)) {
    return Utilities.formatDate(t, Session.getScriptTimeZone(), 'h:mm a');
  }
  return String(t);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
