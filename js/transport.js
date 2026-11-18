/* ===================================================================
   Transport / live tracking — shared helpers
   Used by transport.html (public "Where is my bus") and
   transport-owner.html (transporter dashboard).

   Data lives in two places:
     • Google Sheet via Apps Script (TRANSPORT_API)  → accounts, vehicles,
       drivers, routes, trip summaries, settings (slow-changing data)
     • Firebase Realtime Database (FIREBASE)         → live GPS positions
       and trip breadcrumb trails (fast-changing data)

   Firebase layout (written by the driver app):
     live/{vehicleId}                     { lat, lng, speed, heading, ts, tripId, driverId, acc }
     trips/{vehicleId}/{tripId}/points/*  { lat, lng, ts, speed }
     trips/{vehicleId}/{tripId}/meta      { startedAt, endedAt, driverId, distanceKm }
   =================================================================== */
(function () {
  "use strict";
  var cfg = window.KPT_CONFIG || {};
  var API = cfg.TRANSPORT_API || "";
  var TOKEN_KEY = "kpt-transport-token";
  var db = null, dbTried = false;

  /* ---------------- API (Apps Script) ---------------- */
  function post(action, payload) {
    if (!API) return Promise.resolve({ ok: false, error: "Transport backend not configured (TRANSPORT_API in js/config.js)", notConfigured: true });
    var body = Object.assign({ action: action }, payload || {});
    if (!body.token && action !== "login" && action !== "register") body.token = getToken();
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "Network error — please try again" }; });
  }
  function get(action, params) {
    if (!API) return Promise.resolve({ ok: false, error: "Transport backend not configured", notConfigured: true });
    var q = Object.assign({ action: action }, params || {});
    var qs = Object.keys(q).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(q[k]); }).join("&");
    return fetch(API + "?" + qs).then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "Network error — please try again" }; });
  }

  /* ---------------- session ---------------- */
  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  /* ---------------- Firebase (live feed) ---------------- */
  function live() {
    if (db || dbTried) return db;
    dbTried = true;
    var fb = cfg.FIREBASE || {};
    if (!window.firebase || !fb.databaseURL) return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(fb);
      db = firebase.database();
    } catch (e) { db = null; }
    return db;
  }
  function liveReady() { return !!live(); }

  // Subscribe to live positions. ids = array of vehicle ids to watch (null = all).
  // cb(vehicleId, pos|null). Returns an unsubscribe function.
  function watchLive(ids, cb) {
    var d = live(); if (!d) return function () {};
    var refs = [];
    function on(ref, id) {
      var h = ref.on("value", function (snap) { cb(id || snap.key, snap.val()); });
      refs.push([ref, h]);
    }
    if (ids && ids.length) ids.forEach(function (id) { on(d.ref("live/" + id), id); });
    else {
      var ref = d.ref("live");
      var a = ref.on("child_added", function (s) { cb(s.key, s.val()); });
      var c = ref.on("child_changed", function (s) { cb(s.key, s.val()); });
      var r = ref.on("child_removed", function (s) { cb(s.key, null); });
      refs.push([ref, a, "child_added"], [ref, c, "child_changed"], [ref, r, "child_removed"]);
    }
    return function () { refs.forEach(function (x) { x[0].off(x[2] || "value", x[1]); }); };
  }

  // Load all points of a trip once. Resolves [{lat,lng,ts,speed}]
  function loadTrip(vehicleId, tripId) {
    var d = live(); if (!d) return Promise.resolve([]);
    return d.ref("trips/" + vehicleId + "/" + tripId + "/points").orderByChild("ts").once("value").then(function (snap) {
      var out = []; snap.forEach(function (c) { out.push(c.val()); }); return out;
    });
  }
  // Follow a running trip's points live. cb(point). Returns unsubscribe.
  function watchTrip(vehicleId, tripId, cb) {
    var d = live(); if (!d) return function () {};
    var ref = d.ref("trips/" + vehicleId + "/" + tripId + "/points").orderByChild("ts");
    var h = ref.on("child_added", function (s) { cb(s.val()); });
    return function () { ref.off("child_added", h); };
  }

  /* ---------------- Map (Leaflet + OpenStreetMap, free) ---------------- */
  function makeMap(el, opts) {
    opts = opts || {};
    var m = L.map(el, { zoomControl: true, attributionControl: true }).setView(opts.center || cfg.MAP_CENTER || [12.74, 77.83], opts.zoom || cfg.MAP_ZOOM || 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(m);
    return m;
  }
  var ICONS = { bus: "🚌", lorry: "🚚", truck: "🚚", van: "🚐", car: "🚗", auto: "🛺", bike: "🏍️" };
  function emoji(type) { return ICONS[String(type || "").toLowerCase()] || "🚐"; }
  function vehicleIcon(v, state) {
    var cls = "tr-marker tr-" + (state || "offline");
    var html = '<div class="' + cls + '"><span class="tr-marker-ico">' + emoji(v.type) + '</span><span class="tr-marker-lbl">' + esc(v.name || v.regNo || "") + "</span></div>";
    return L.divIcon({ html: html, className: "tr-marker-wrap", iconSize: null, iconAnchor: [18, 18] });
  }
  function stopIcon(n) {
    return L.divIcon({ html: '<div class="tr-stop">' + n + "</div>", className: "tr-stop-wrap", iconSize: [22, 22], iconAnchor: [11, 11] });
  }

  /* ---------------- geo / formatting ---------------- */
  function km(a, b) { // haversine, km
    if (!a || !b) return 0;
    var R = 6371, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function rad(x) { return x * Math.PI / 180; }
  function pathKm(points) { var t = 0; for (var i = 1; i < points.length; i++) t += km(points[i - 1], points[i]); return t; }

  // moving / stopped / offline based on age + speed
  function state(pos, staleSec) {
    if (!pos || !pos.ts) return "offline";
    var age = (Date.now() - Number(pos.ts)) / 1000;
    if (age > (staleSec || 120)) return "offline";
    return Number(pos.speed) > 3 ? "moving" : "stopped";
  }
  function ago(ts) {
    if (!ts) return "never";
    var s = Math.max(0, Math.round((Date.now() - Number(ts)) / 1000));
    if (s < 5) return "just now";
    if (s < 60) return s + "s ago";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    return new Date(Number(ts)).toLocaleString("en-IN");
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso); if (isNaN(d)) return String(iso);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }
  function dur(startIso, endIso) {
    var a = new Date(startIso), b = endIso ? new Date(endIso) : new Date();
    if (isNaN(a) || isNaN(b)) return "—";
    var m = Math.round((b - a) / 60000);
    return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + (m % 60) + " min";
  }
  // Rough ETA: straight-line × road factor, using current speed (min 20 km/h)
  function eta(pos, stop) {
    var dist = km(pos, stop) * 1.3;
    var sp = Math.max(20, Number(pos.speed) || 0);
    return { km: dist, min: Math.round(dist / sp * 60) };
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.KPTTransport = {
    configured: !!API, post: post, get: get,
    getToken: getToken, setToken: setToken,
    live: live, liveReady: liveReady, watchLive: watchLive, loadTrip: loadTrip, watchTrip: watchTrip,
    makeMap: makeMap, vehicleIcon: vehicleIcon, stopIcon: stopIcon, emoji: emoji,
    km: km, pathKm: pathKm, state: state, ago: ago, fmtDate: fmtDate, dur: dur, eta: eta, esc: esc
  };
})();
