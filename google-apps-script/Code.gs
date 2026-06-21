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
var SHEET_NAME   = 'Events';                        // tab name for events
// ===================================

// Tabs + their columns
var TABS = {
  event:        { name: 'Events',        cols: ['Timestamp','Title','Date','Time','Location','Description','Status'] },
  volunteer:    { name: 'Volunteers',    cols: ['Timestamp','Name','Phone','Email','Location','Availability','Interests','Skills'] },
  contact:      { name: 'Enquiries',     cols: ['Timestamp','Name','Email','Phone','Subject','Message'] },
  registration: { name: 'Registrations', cols: ['Timestamp','Event','Name','Phone','Email','People'] }
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

function notify(subject, html) {
  try {
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject,
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
