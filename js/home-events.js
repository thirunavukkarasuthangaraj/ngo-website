/* ===================================================================
   Homepage upcoming-events slider — pulls live events from the Google
   Sheet and shows the next few in a simple swipe/arrow slider.
   The whole section stays hidden if there are no upcoming events.
   =================================================================== */
(function () {
  "use strict";
  var cfg = window.KPT_CONFIG || {};
  var API = cfg.EVENTS_API;
  var section = document.getElementById("homeEvents");
  var track = document.getElementById("homeEventsTrack");
  if (!API || !section || !track) return;

  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function parseDate(s) {
    if (!s) return null;
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

  // Sheets may convert a typed time ("6 AM") into an ISO date-time
  // (1899-...T...Z). Show just a clean time in that case.
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

  fetch(API, { method: "GET" })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res || !res.ok || !res.events) return;
      var now = new Date(); now.setHours(0, 0, 0, 0);
      var upcoming = res.events.filter(function (ev) {
        var d = parseDate(ev.date);
        var isPast = (String(ev.status).toLowerCase() === "past") || (d && d < now);
        return !isPast;
      });
      upcoming.sort(function (a, b) { return (parseDate(a.date) || 0) - (parseDate(b.date) || 0); });
      upcoming = upcoming.slice(0, 8);
      if (!upcoming.length) return; // keep section hidden

      track.innerHTML = upcoming.map(card).join("");
      section.style.display = "";

      var prev = section.querySelector(".he-prev");
      var next = section.querySelector(".he-next");
      function step(dir) { track.scrollBy({ left: dir * track.clientWidth * 0.92, behavior: "smooth" }); }
      if (prev) prev.addEventListener("click", function () { step(-1); });
      if (next) next.addEventListener("click", function () { step(1); });

      section.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
      if (typeof window.KPT_retranslate === "function") window.KPT_retranslate();
    })
    .catch(function () { /* leave section hidden */ });
})();
