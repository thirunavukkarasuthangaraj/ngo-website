/* ===================================================================
   Event registration — a reusable popup that opens when any element
   with class "js-register" (carrying data-event="Event title") is
   clicked. Saves the registration to the Google Sheet (Registrations
   tab) via the same Apps Script backend.
   Uses event delegation so it works for cards injected asynchronously.
   =================================================================== */
(function () {
  "use strict";
  var doc = document;
  var cfg = window.KPT_CONFIG || {};
  var API = cfg.EVENTS_API;

  // ---- build the modal once, append to <body> ----
  var modal = doc.createElement("div");
  modal.className = "reg-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<div class="reg-backdrop"></div>' +
    '<div class="reg-dialog" role="dialog" aria-modal="true" aria-label="Event registration">' +
    '  <button type="button" class="reg-close" aria-label="Close">&times;</button>' +
    '  <div class="reg-body">' +
    '    <span class="kicker">Register</span>' +
    '    <h3 class="reg-title">Register for this event</h3>' +
    '    <p class="reg-event"></p>' +
    '    <form class="reg-form" novalidate>' +
    '      <div class="field"><label>Your Name <span class="req">*</span></label><input type="text" name="name" required placeholder="Full name"></div>' +
    '      <div class="field"><label>Phone <span class="req">*</span></label><input type="tel" name="phone" required placeholder="10-digit mobile" pattern="[0-9+ ]{7,15}"></div>' +
    '      <div class="field"><label>Email</label><input type="email" name="email" placeholder="you@example.com"></div>' +
    '      <div class="field"><label>How many people?</label><input type="number" name="people" min="1" value="1"></div>' +
    '      <button type="submit" class="btn btn-primary btn-block btn-lg reg-submit">Confirm Registration</button>' +
    '      <p class="reg-msg"></p>' +
    '    </form>' +
    '  </div>' +
    '  <div class="reg-success">' +
    '    <div class="s-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
    '    <h3>You\'re registered! 🌱</h3>' +
    '    <p>Thank you — we\'ve received your registration and will be in touch. See you at the event!</p>' +
    '    <button type="button" class="btn btn-primary reg-done">Done</button>' +
    '  </div>' +
    '</div>';
  doc.body.appendChild(modal);

  var dialog = modal.querySelector(".reg-dialog");
  var form = modal.querySelector(".reg-form");
  var eventOut = modal.querySelector(".reg-event");
  var msg = modal.querySelector(".reg-msg");
  var submitBtn = modal.querySelector(".reg-submit");
  var successBox = modal.querySelector(".reg-success");
  var bodyBox = modal.querySelector(".reg-body");
  var currentEvent = "";

  function open(eventTitle) {
    currentEvent = eventTitle || "";
    eventOut.textContent = currentEvent ? "🌳 " + currentEvent : "";
    form.reset();
    msg.textContent = "";
    successBox.classList.remove("show");
    bodyBox.style.display = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    doc.body.style.overflow = "hidden";
    var first = form.querySelector("input[name=name]");
    if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    doc.body.style.overflow = "";
  }

  // ---- event delegation: catches cards injected after page load ----
  doc.addEventListener("click", function (e) {
    var trigger = e.target.closest(".js-register");
    if (trigger) {
      e.preventDefault();
      open(trigger.getAttribute("data-event") || "");
      return;
    }
    if (e.target.closest(".reg-close") || e.target.closest(".reg-backdrop") || e.target.closest(".reg-done")) {
      close();
    }
  });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!API) { msg.textContent = "Registration is temporarily unavailable."; msg.style.color = "var(--gold-600)"; return; }

    var payload = { type: "registration", event: currentEvent };
    new FormData(form).forEach(function (v, k) { payload[k] = String(v).trim(); });

    submitBtn.disabled = true; submitBtn.textContent = "Submitting…"; msg.textContent = "";
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        submitBtn.disabled = false; submitBtn.textContent = "Confirm Registration";
        if (res && res.ok) { bodyBox.style.display = "none"; successBox.classList.add("show"); }
        else { msg.textContent = (res && res.error) || "Something went wrong."; msg.style.color = "var(--gold-600)"; }
      })
      .catch(function (err) {
        submitBtn.disabled = false; submitBtn.textContent = "Confirm Registration";
        msg.textContent = "Network error: " + err; msg.style.color = "var(--gold-600)";
      });
  });
})();
