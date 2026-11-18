/* ===================================================================
   Karisakattu Poove Trust — TRANSPORT backend (Google Apps Script)
   Deploy as a SEPARATE web app from the Events script (its own Sheet).
   See TRANSPORT-SETUP.md.

   Sheets created automatically on first use:
     Transporters  — owner accounts (approved by trust admin)
     Drivers       — driver accounts (login used by the driver mobile app)
     Vehicles      — bus / lorry / any type, owned by a transporter
     Routes        — source, destination, stops (JSON)
     Trips         — trip summaries (start/end written by the driver app)
     Settings      — key/value: GPS send interval per vehicle type, etc.

   Live GPS positions do NOT go here (too many writes). They go to
   Firebase Realtime Database — see js/transport.js + TRANSPORT-SETUP.md.
   =================================================================== */

var ADMIN_TOKEN    = 'CHANGE-THIS-SECRET';            // trust admin (approves transporters)
var SESSION_SECRET = 'CHANGE-THIS-TOO-LONG-RANDOM';   // signs login tokens
var NOTIFY_EMAIL   = 'karisakattupoovetn@gmail.com';
var SESSION_DAYS   = 30;

var SHEETS = {
  Transporters: ['id','name','phone','company','passHash','status','createdAt'],
  Drivers:      ['id','ownerId','name','phone','passHash','status','createdAt'],
  Vehicles:     ['id','ownerId','type','regNo','name','routeId','driverId','isPublic','status','createdAt'],
  Routes:       ['id','ownerId','name','source','destination','stops','createdAt'],
  Trips:        ['id','ownerId','vehicleId','driverId','routeId','startedAt','endedAt','distanceKm','status'],
  Settings:     ['key','value','note']
};
var DEFAULT_SETTINGS = [
  ['interval_default', '5',   'GPS send interval in seconds for any type not listed below'],
  ['interval_bus',     '5',   'Seconds between GPS sends for buses'],
  ['interval_lorry',   '15',  'Seconds between GPS sends for lorries'],
  ['interval_test',    '1',   'Interval used when a driver starts a trip in TEST mode'],
  ['stale_after',      '120', 'Seconds without a GPS point before a vehicle shows as offline'],
  ['public_tracking',  'yes', 'yes/no — show public buses on the website tracker']
];

/* ---------------- entry points ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'settings':       return out({ ok: true, settings: getSettings() });
      case 'publicVehicles': return out({ ok: true, vehicles: publicVehicles(), settings: publicSettings() });
      case 'ping':           return out({ ok: true, time: new Date().toISOString() });
      default:               return out({ ok: true, service: 'kpt-transport' });
    }
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents || '{}'); } catch (x) { return out({ ok: false, error: 'bad json' }); }
  try {
    switch (d.action) {
      /* --- accounts --- */
      case 'register':       return out(registerTransporter(d));
      case 'login':          return out(login(d));          // role: owner | driver
      case 'me':             return out(me(d));
      /* --- owner data (token required) --- */
      case 'bootstrap':      return out(bootstrap(d));      // everything the dashboard needs in one call
      case 'saveVehicle':    return out(saveRow(d, 'Vehicles', vehicleFields));
      case 'deleteVehicle':  return out(deleteRow(d, 'Vehicles'));
      case 'saveDriver':     return out(saveDriver(d));
      case 'deleteDriver':   return out(deleteRow(d, 'Drivers'));
      case 'saveRoute':      return out(saveRow(d, 'Routes', routeFields));
      case 'deleteRoute':    return out(deleteRow(d, 'Routes'));
      /* --- driver app --- */
      case 'driverContext':  return out(driverContext(d)); // vehicle + route + interval for the logged-in driver
      case 'tripStart':      return out(tripStart(d));
      case 'tripEnd':        return out(tripEnd(d));
      /* --- trust admin --- */
      case 'adminList':      return out(adminList(d));
      case 'adminSetStatus': return out(adminSetStatus(d));
      case 'adminSettings':  return out(adminSettings(d));
      default:               return out({ ok: false, error: 'unknown action' });
    }
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

/* ---------------- accounts ---------------- */
function registerTransporter(d) {
  var name = clean(d.name), phone = normPhone(d.phone), company = clean(d.company), pass = String(d.password || '');
  if (!name || !phone) return { ok: false, error: 'Name and phone are required' };
  if (phone.length !== 10) return { ok: false, error: 'Enter a 10-digit mobile number' };
  if (pass.length < 6)  return { ok: false, error: 'Password must be at least 6 characters' };
  if (findBy('Transporters', 'phone', phone)) return { ok: false, error: 'This phone is already registered' };
  var id = uid('T');
  append('Transporters', { id: id, name: name, phone: phone, company: company, passHash: hash(pass), status: 'pending', createdAt: now() });
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'New transporter signup: ' + name,
      name + ' (' + company + ') registered with phone ' + phone + '.\nApprove them on the website: Transport > Owner login > Trust admin.');
  } catch (x) {}
  return { ok: true, id: id, status: 'pending' };
}

function login(d) {
  var phone = normPhone(d.phone), pass = String(d.password || ''), role = d.role === 'driver' ? 'driver' : 'owner';
  var sheet = role === 'driver' ? 'Drivers' : 'Transporters';
  var u = findBy(sheet, 'phone', phone);
  if (!u || u.passHash !== hash(pass)) return { ok: false, error: 'Wrong phone or password' };
  if (u.status === 'pending')  return { ok: false, error: 'Your account is waiting for approval by the trust' };
  if (u.status !== 'active')   return { ok: false, error: 'Account is ' + u.status };
  return { ok: true, token: makeToken(role, u.id), user: pub(u, role) };
}

function me(d) { var s = auth(d); if (!s.ok) return s; return { ok: true, user: pub(s.user, s.role) }; }

function pub(u, role) {
  return { id: u.id, name: u.name, phone: u.phone, company: u.company || '', role: role, ownerId: u.ownerId || u.id };
}

/* ---------------- owner dashboard ---------------- */
function bootstrap(d) {
  var s = auth(d, 'owner'); if (!s.ok) return s;
  var oid = s.user.id;
  return {
    ok: true,
    user: pub(s.user, 'owner'),
    vehicles: rows('Vehicles').filter(function (r) { return r.ownerId === oid && r.status !== 'deleted'; }),
    drivers:  rows('Drivers').filter(function (r) { return r.ownerId === oid && r.status !== 'deleted'; }).map(stripHash),
    routes:   rows('Routes').filter(function (r) { return r.ownerId === oid; }).map(parseStops),
    trips:    rows('Trips').filter(function (r) { return r.ownerId === oid; }).slice(-200).reverse(),
    settings: publicSettings()
  };
}

function vehicleFields(d, old) {
  var type = clean(d.type).toLowerCase() || 'bus';
  if (!clean(d.regNo)) throw 'Registration number is required';
  return {
    type: type, regNo: clean(d.regNo).toUpperCase(), name: clean(d.name) || clean(d.regNo).toUpperCase(),
    routeId: clean(d.routeId), driverId: clean(d.driverId),
    isPublic: (type === 'bus' && (d.isPublic === true || d.isPublic === 'yes')) ? 'yes' : 'no',
    status: old ? old.status : 'active'
  };
}
function routeFields(d) {
  if (!clean(d.source) || !clean(d.destination)) throw 'Source and destination are required';
  var stops = Array.isArray(d.stops) ? d.stops : [];
  stops = stops.map(function (s) { return { name: clean(s.name), lat: num(s.lat), lng: num(s.lng) }; }).filter(function (s) { return s.name; });
  return { name: clean(d.name) || (clean(d.source) + ' → ' + clean(d.destination)), source: clean(d.source), destination: clean(d.destination), stops: JSON.stringify(stops) };
}

function saveRow(d, sheet, fields) {
  var s = auth(d, 'owner'); if (!s.ok) return s;
  var oid = s.user.id;
  if (d.id) {
    var hit = locate(sheet, d.id);
    if (!hit || hit.row.ownerId !== oid) return { ok: false, error: 'Not found' };
    var upd = fields(d, hit.row); upd.id = d.id; upd.ownerId = oid; upd.createdAt = hit.row.createdAt;
    writeRow(sheet, hit.index, upd);
    return { ok: true, id: d.id };
  }
  var id = uid(sheet === 'Vehicles' ? 'V' : 'R');
  var rec = fields(d, null); rec.id = id; rec.ownerId = oid; rec.createdAt = now();
  append(sheet, rec);
  return { ok: true, id: id };
}

function saveDriver(d) {
  var s = auth(d, 'owner'); if (!s.ok) return s;
  var oid = s.user.id, phone = normPhone(d.phone), name = clean(d.name);
  if (!name || !phone) return { ok: false, error: 'Driver name and phone are required' };
  if (phone.length !== 10) return { ok: false, error: 'Enter a 10-digit mobile number' };
  var dup = findBy('Drivers', 'phone', phone);
  if (dup && dup.id !== d.id && dup.status !== 'deleted') return { ok: false, error: 'A driver with this phone already exists' };
  if (d.id) {
    var hit = locate('Drivers', d.id);
    if (!hit || hit.row.ownerId !== oid) return { ok: false, error: 'Not found' };
    var r = hit.row; r.name = name; r.phone = phone;
    if (d.password) { if (String(d.password).length < 4) return { ok: false, error: 'PIN/password too short' }; r.passHash = hash(d.password); }
    writeRow('Drivers', hit.index, r);
    return { ok: true, id: d.id };
  }
  if (!d.password || String(d.password).length < 4) return { ok: false, error: 'Set a PIN/password (4+ chars) for the driver app' };
  var id = uid('D');
  append('Drivers', { id: id, ownerId: oid, name: name, phone: phone, passHash: hash(d.password), status: 'active', createdAt: now() });
  return { ok: true, id: id };
}

function deleteRow(d, sheet) {
  var s = auth(d, 'owner'); if (!s.ok) return s;
  var hit = locate(sheet, d.id);
  if (!hit || hit.row.ownerId !== s.user.id) return { ok: false, error: 'Not found' };
  if (sheet === 'Routes') { sh(sheet).deleteRow(hit.index); }
  else { hit.row.status = 'deleted'; writeRow(sheet, hit.index, hit.row); }
  return { ok: true };
}

/* ---------------- public tracker ---------------- */
function publicVehicles() {
  if (getSettings().public_tracking === 'no') return [];
  var routes = {}; rows('Routes').forEach(function (r) { routes[r.id] = parseStops(r); });
  var owners = {}; rows('Transporters').forEach(function (t) { owners[t.id] = t; });
  return rows('Vehicles').filter(function (v) {
    return v.type === 'bus' && v.isPublic === 'yes' && v.status === 'active' && owners[v.ownerId] && owners[v.ownerId].status === 'active';
  }).map(function (v) {
    var r = routes[v.routeId] || {};
    return { id: v.id, name: v.name, regNo: v.regNo, operator: owners[v.ownerId].company || owners[v.ownerId].name,
             route: r.name || '', source: r.source || '', destination: r.destination || '', stops: r.stops || [] };
  });
}
function publicSettings() {
  var s = getSettings();
  return { stale_after: num(s.stale_after) || 120, public_tracking: s.public_tracking || 'yes',
           interval_bus: num(s.interval_bus) || 5, interval_lorry: num(s.interval_lorry) || 15, interval_default: num(s.interval_default) || 5 };
}

/* ---------------- driver app ---------------- */
function driverContext(d) {
  var s = auth(d, 'driver'); if (!s.ok) return s;
  var drv = s.user, settings = getSettings();
  var vehicles = rows('Vehicles').filter(function (v) { return v.driverId === drv.id && v.status === 'active'; });
  var routes = {}; rows('Routes').forEach(function (r) { routes[r.id] = parseStops(r); });
  var openTrip = rows('Trips').filter(function (t) { return t.driverId === drv.id && t.status === 'running'; }).pop() || null;
  return {
    ok: true, driver: pub(drv, 'driver'),
    vehicles: vehicles.map(function (v) {
      return { id: v.id, name: v.name, regNo: v.regNo, type: v.type, route: routes[v.routeId] || null,
               intervalSec: intervalFor(settings, v.type) };
    }),
    intervals: { test: num(settings.interval_test) || 1 },
    openTrip: openTrip
  };
}
function tripStart(d) {
  var s = auth(d, 'driver'); if (!s.ok) return s;
  var v = locate('Vehicles', d.vehicleId);
  if (!v || v.row.driverId !== s.user.id) return { ok: false, error: 'Vehicle not assigned to you' };
  // close any trip left running by this driver
  rows('Trips').forEach(function (t, i) {
    if (t.driverId === s.user.id && t.status === 'running') { t.status = 'ended'; t.endedAt = now(); writeRow('Trips', i + 2, t); }
  });
  var id = uid('TR');
  append('Trips', { id: id, ownerId: v.row.ownerId, vehicleId: v.row.id, driverId: s.user.id, routeId: v.row.routeId,
                    startedAt: now(), endedAt: '', distanceKm: '', status: 'running' });
  return { ok: true, tripId: id, intervalSec: intervalFor(getSettings(), v.row.type) };
}
function tripEnd(d) {
  var s = auth(d, 'driver'); if (!s.ok) return s;
  var hit = locate('Trips', d.tripId);
  if (!hit || hit.row.driverId !== s.user.id) return { ok: false, error: 'Trip not found' };
  hit.row.status = 'ended'; hit.row.endedAt = now(); hit.row.distanceKm = num(d.distanceKm) || '';
  writeRow('Trips', hit.index, hit.row);
  return { ok: true };
}
function intervalFor(settings, type) {
  return num(settings['interval_' + type]) || num(settings.interval_default) || 5;
}

/* ---------------- trust admin ---------------- */
function adminList(d) {
  if (d.token !== ADMIN_TOKEN) return { ok: false, error: 'Bad admin token' };
  var counts = {}; rows('Vehicles').forEach(function (v) { if (v.status === 'active') counts[v.ownerId] = (counts[v.ownerId] || 0) + 1; });
  return { ok: true, transporters: rows('Transporters').map(stripHash).map(function (t) { t.vehicles = counts[t.id] || 0; return t; }), settings: getSettings() };
}
function adminSetStatus(d) {
  if (d.token !== ADMIN_TOKEN) return { ok: false, error: 'Bad admin token' };
  var hit = locate('Transporters', d.id); if (!hit) return { ok: false, error: 'Not found' };
  if (['active', 'pending', 'blocked'].indexOf(d.status) < 0) return { ok: false, error: 'Bad status' };
  hit.row.status = d.status; writeRow('Transporters', hit.index, hit.row);
  return { ok: true };
}
function adminSettings(d) {
  if (d.token !== ADMIN_TOKEN) return { ok: false, error: 'Bad admin token' };
  var s = sh('Settings'), data = s.getDataRange().getValues();
  Object.keys(d.settings || {}).forEach(function (k) {
    for (var i = 1; i < data.length; i++) if (data[i][0] === k) { s.getRange(i + 1, 2).setValue(String(d.settings[k])); return; }
    s.appendRow([k, String(d.settings[k]), '']);
  });
  return { ok: true, settings: getSettings() };
}

/* ---------------- sessions ---------------- */
function makeToken(role, id) {
  var exp = Date.now() + SESSION_DAYS * 864e5;
  var body = Utilities.base64EncodeWebSafe(role + '|' + id + '|' + exp);
  return body + '.' + sign(body);
}
function auth(d, needRole) {
  var t = String(d.token || ''), i = t.indexOf('.');
  if (i < 0) return { ok: false, error: 'Please log in', auth: false };
  var body = t.slice(0, i), sig = t.slice(i + 1);
  if (sign(body) !== sig) return { ok: false, error: 'Session invalid, please log in again', auth: false };
  var parts = Utilities.newBlob(Utilities.base64DecodeWebSafe(body)).getDataAsString().split('|');
  var role = parts[0], id = parts[1], exp = Number(parts[2]);
  if (Date.now() > exp) return { ok: false, error: 'Session expired, please log in again', auth: false };
  if (needRole && role !== needRole) return { ok: false, error: 'Not allowed', auth: false };
  var u = findBy(role === 'driver' ? 'Drivers' : 'Transporters', 'id', id);
  if (!u || u.status !== 'active') return { ok: false, error: 'Account not active', auth: false };
  return { ok: true, role: role, user: u };
}
function sign(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, SESSION_SECRET));
}
function hash(p) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'kpt|' + p, Utilities.Charset.UTF_8));
}

/* ---------------- sheet helpers ---------------- */
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sh(name) {
  var s = ss().getSheetByName(name);
  if (!s) {
    s = ss().insertSheet(name);
    s.appendRow(SHEETS[name]); s.setFrozenRows(1);
    if (name === 'Settings') DEFAULT_SETTINGS.forEach(function (r) { s.appendRow(r); });
  }
  return s;
}
function toObj(name, arr) {
  var o = {};
  SHEETS[name].forEach(function (h, j) {
    var v = arr[j];
    o[h] = v == null ? '' : (v instanceof Date ? v.toISOString() : v);
  });
  return o;
}
function rows(name) {
  var data = sh(name).getDataRange().getValues(), out = [];
  for (var i = 1; i < data.length; i++) if (data[i][0]) out.push(toObj(name, data[i]));
  return out;
}
function locate(name, id) {
  if (!id) return null;
  var data = sh(name).getDataRange().getValues();
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === String(id)) return { index: i + 1, row: toObj(name, data[i]) };
  return null;
}
function findBy(name, field, value) {
  var all = rows(name);
  for (var i = 0; i < all.length; i++) if (String(all[i][field]) === String(value)) return all[i];
  return null;
}
function append(name, obj) { sh(name).appendRow(SHEETS[name].map(function (h) { return obj[h] == null ? '' : obj[h]; })); }
function writeRow(name, index, obj) {
  var head = SHEETS[name];
  sh(name).getRange(index, 1, 1, head.length).setValues([head.map(function (h) { return obj[h] == null ? '' : obj[h]; })]);
}
function getSettings() {
  var o = {}; rows('Settings').forEach(function (r) { o[r.key] = String(r.value); }); return o;
}
function stripHash(r) { var c = {}; for (var k in r) if (k !== 'passHash') c[k] = r[k]; return c; }
function parseStops(r) { try { r.stops = JSON.parse(r.stops || '[]'); } catch (x) { r.stops = []; } return r; }

/* ---------------- utils ---------------- */
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean(v) { return String(v == null ? '' : v).trim().slice(0, 200); }
function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function now() { return new Date().toISOString(); }
function uid(p) { return p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function normPhone(p) { var d = String(p || '').replace(/\D/g, ''); if (d.length > 10 && d.indexOf('91') === 0) d = d.slice(2); return d; }
