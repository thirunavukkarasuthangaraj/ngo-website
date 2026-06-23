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
    MailApp.sendEmail({
      to: body.email,
      from: SENDER_EMAIL,
      name: SENDER_NAME,
      subject: 'Thank you for your donation — Karisakattu Poove Trust',
      htmlBody:
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#222">' +
          '<h2 style="color:#2e7d32;margin-bottom:4px">Thank you, ' + body.name + '! 🌱</h2>' +
          '<p>We have received your generous donation to <b>Karisakattu Poove Trust</b>. ' +
          'Your support helps us plant trees, grow Miyawaki forests, conserve water and uplift ' +
          'communities across Hosur, Tamil Nadu.</p>' +
          '<table style="border-collapse:collapse;margin:16px 0;font-size:15px">' +
            '<tr><td style="padding:6px 14px 6px 0;color:#666">Amount</td>' +
              '<td style="padding:6px 0"><b>INR ' + amount + '</b></td></tr>' +
            '<tr><td style="padding:6px 14px 6px 0;color:#666">Payment Reference</td>' +
              '<td style="padding:6px 0">' + (payId || '-') + '</td></tr>' +
            '<tr><td style="padding:6px 14px 6px 0;color:#666">Date</td>' +
              '<td style="padding:6px 0">' + dateStr + '</td></tr>' +
          '</table>' +
          '<p>This email is an acknowledgement of your contribution. For a formal 80G tax receipt, ' +
          'please reply with your full name and PAN.</p>' +
          '<p style="color:#555;margin-top:20px">With gratitude,<br><b>Karisakattu Poove Trust</b><br>' +
          'Trust Reg. No. 74/2020 &middot; Hosur, Tamil Nadu</p>' +
        '</div>'
    });
  } catch (e) { /* sheet write already succeeded */ }

  return json({ ok: true });
}

function notify(subject, html) {
  try {
    MailApp.sendEmail({ to: NOTIFY_EMAIL, from: SENDER_EMAIL, name: SENDER_NAME, subject: subject,
      htmlBody: html + '<hr><small>Logged in your Karisakattupoove Trust Google Sheet.</small>' });
  } catch (e) { /* sheet write already succeeded */ }
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
