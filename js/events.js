/* ===================================================================
   Events loader — pulls live events from the Google Sheet (via Apps
   Script web app) and renders them on the Events page.
   No static fallback: shows loading / empty / error states instead.
   =================================================================== */
(function () {
  "use strict";
  var cfg = window.KPT_CONFIG || {};
  var API = cfg.EVENTS_API;
  var upcomingBox = document.getElementById("upcomingEvents");
  var pastBox = document.getElementById("pastEvents");
  if (!upcomingBox) return;

  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function parseDate(s) {
    if (!s) return null;
    // accept yyyy-mm-dd or dd/mm/yyyy or dd-mm-yyyy
    var d;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) { d = new Date(s); }
    else {
      var m = String(s).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (m) d = new Date(+ (m[3].length === 2 ? "20" + m[3] : m[3]), +m[2] - 1, +m[1]);
    }
    return (d && !isNaN(d.getTime())) ? d : null;
  }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Google Sheets sometimes turns a typed time ("6 AM") into a date-time value,
  // which the API returns as an ISO string like 1899-12-29T18:38:50.000Z.
  // Show just a clean time in that case; otherwise show the text as entered.
  function fmtTime(t) {
    if (!t) return "";
    if (/^\d{4}-\d{2}-\d{2}T/.test(t)) {
      var d = new Date(t);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      }
    }
    return String(t);
  }

  function note(t) {
    return '<p style="color:var(--muted);grid-column:1 / -1;margin:8px 0">' + esc(t) + '</p>';
  }

  function card(ev) {
    var d = parseDate(ev.date);
    var day = d ? d.getDate() : "•";
    var mon = d ? MONTHS[d.getMonth()] : "";
    var meta = "";
    var t = fmtTime(ev.time);
    if (t) meta += '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> ' + esc(t) + '</span>';
    if (ev.location) meta += '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(ev.location) + '</span>';
    return '' +
      '<div class="event-card" data-reveal>' +
      '  <div class="event-date"><span class="d">' + day + '</span><span class="m">' + mon + '</span></div>' +
      '  <div class="event-info"><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.description) + '</p>' +
      (meta ? '<div class="meta">' + meta + '</div>' : '') + '</div>' +
      '  <button type="button" class="btn btn-primary js-register" data-event="' + esc(ev.title) + '">Register</button>' +
      '</div>';
  }

  // Big hero-style banner for the nearest upcoming event, with a live countdown.
  function featuredCard(ev) {
    var d = parseDate(ev.date);
    var day = d ? d.getDate() : "•";
    var mon = d ? MONTHS[d.getMonth()] : "";
    var yr = d ? d.getFullYear() : "";
    var meta = "";
    var t = fmtTime(ev.time);
    if (d) meta += '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg> ' + day + ' ' + mon + ' ' + yr + '</span>';
    if (t) meta += '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> ' + esc(t) + '</span>';
    if (ev.location) meta += '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(ev.location) + '</span>';
    var cd = d ? '' +
      '<div class="ef-countdown" data-countdown="' + d.getTime() + '" aria-label="Countdown to event">' +
      '  <div class="ef-cd-box"><span class="n" data-cd="d">--</span><span class="l">Days</span></div>' +
      '  <div class="ef-cd-box"><span class="n" data-cd="h">--</span><span class="l">Hours</span></div>' +
      '  <div class="ef-cd-box"><span class="n" data-cd="m">--</span><span class="l">Mins</span></div>' +
      '  <div class="ef-cd-box"><span class="n" data-cd="s">--</span><span class="l">Secs</span></div>' +
      '</div>' : '';
    return '' +
      '<div class="event-feature" data-reveal>' +
      '  <div class="ef-art" aria-hidden="true"><span class="ef-tree">🌳</span></div>' +
      '  <div class="ef-body">' +
      '    <div class="ef-top"><span class="ef-badge">★ Featured Event</span>' +
      '      <span class="ef-date"><span class="d">' + day + '</span><span class="m">' + mon + '</span></span></div>' +
      '    <h3>' + esc(ev.title) + '</h3>' +
      '    <p>' + esc(ev.description) + '</p>' +
      (meta ? '<div class="meta">' + meta + '</div>' : '') +
      cd +
      '    <div class="ef-cta"><button type="button" class="btn btn-gold btn-lg js-register" data-event="' + esc(ev.title) + '">Register Now</button>' +
      '    <a class="btn btn-white" href="volunteer.html">Volunteer With Us</a></div>' +
      '  </div>' +
      '</div>';
  }

  function startCountdowns() {
    var els = document.querySelectorAll("[data-countdown]");
    if (!els.length) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      els.forEach(function (el) {
        var left = +el.getAttribute("data-countdown") - Date.now();
        if (left < 0) left = 0;
        var s = Math.floor(left / 1000);
        var map = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
        Object.keys(map).forEach(function (k) {
          var box = el.querySelector('[data-cd="' + k + '"]');
          if (box) box.textContent = k === "d" ? map[k] : pad(map[k]);
        });
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  function pastCard(ev) {
    return '<article class="project-card" data-reveal><div class="pc-body"><h3>' + esc(ev.title) + '</h3><p>' + esc(ev.description) + '</p><span class="pill">' + esc(ev.date) + '</span></div></article>';
  }

  function done() {
    document.querySelectorAll("#upcomingEvents [data-reveal], #pastEvents [data-reveal]").forEach(function (el) { el.classList.add("in"); });
    if (typeof window.KPT_retranslate === "function") window.KPT_retranslate();
  }

  if (!API) {
    upcomingBox.innerHTML = note("Events are not available right now.");
    if (pastBox) pastBox.innerHTML = "";
    return;
  }

  upcomingBox.innerHTML = note("Loading events…");

  fetch(API, { method: "GET" })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res || !res.ok) { upcomingBox.innerHTML = note("Couldn’t load events. Please refresh."); return; }
      var events = res.events || [];
      var now = new Date(); now.setHours(0, 0, 0, 0);
      var upcoming = [], past = [];
      events.forEach(function (ev) {
        var d = parseDate(ev.date);
        var isPast = (String(ev.status).toLowerCase() === "past") || (d && d < now);
        (isPast ? past : upcoming).push(ev);
      });
      upcoming.sort(function (a, b) { return (parseDate(a.date) || 0) - (parseDate(b.date) || 0); });
      past.sort(function (a, b) { return (parseDate(b.date) || 0) - (parseDate(a.date) || 0); });

      upcomingBox.innerHTML = upcoming.length
        ? featuredCard(upcoming[0]) + upcoming.slice(1).map(card).join("")
        : note("No upcoming events right now. Check back soon! 🌱");
      if (pastBox) {
        pastBox.innerHTML = past.length
          ? past.map(pastCard).join("")
          : note("No past events listed yet.");
      }
      startCountdowns();
      done();
    })
    .catch(function () { upcomingBox.innerHTML = note("Couldn’t load events. Please refresh."); });
})();
