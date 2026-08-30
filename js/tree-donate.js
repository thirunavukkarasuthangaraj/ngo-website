/* ===================================================================
   "Plant a Tree" donation popup
   - A centered modal that opens automatically the first time a visitor
     lands on the site (once per day), and any time they click the
     floating "Plant a Tree 🌱" button.
   - ₹500 preset + other quick amounts + a custom amount field.
   - Pays inside the popup via Razorpay (same key + Google-Sheet logging
     and emailed receipt as the main donate page).
   Self-contained: builds its own DOM, loads Razorpay on demand, and only
   needs a single <script src="js/tree-donate.js"> tag per page.
   =================================================================== */
(function () {
  "use strict";
  var doc = document;
  var cfg = window.KPT_CONFIG || {};
  var API = cfg.EVENTS_API;
  var RZP_KEY = cfg.RAZORPAY_KEY || "";
  var MAX_AMT = 2000000;                 // ₹20,00,000 max online donation
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var SEEN_KEY = "kpt_tree_popup_seen";  // remembers auto-open so we don't nag

  function fmt(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

  // ---- floating button ----
  var fab = doc.createElement("button");
  fab.type = "button";
  fab.className = "tree-fab";
  fab.setAttribute("aria-label", "Plant a tree — donate");
  fab.innerHTML = '<span class="tf-emoji" aria-hidden="true">🌱</span><span class="tf-label">Plant a Tree</span>';
  doc.body.appendChild(fab);

  // ---- modal ----
  var modal = doc.createElement("div");
  modal.className = "reg-modal td-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<div class="reg-backdrop"></div>' +
    '<div class="reg-dialog td-dialog" role="dialog" aria-modal="true" aria-label="Plant a tree donation">' +
    '  <button type="button" class="reg-close" aria-label="Close">&times;</button>' +
    '  <div class="td-body">' +
    '    <div class="td-hero" aria-hidden="true"><img src="images/gallery/kid-planting.jpg" alt="A child planting a tree sapling"></div>' +
    '    <div class="td-head">' +
    '      <span class="td-badge">🌳 Plant a Tree</span>' +
    '      <h3 class="reg-title">Grow a forest with ₹500</h3>' +
    '      <p class="td-sub">₹50 plants one tree. Choose an amount to grow a forest.</p>' +
    '    </div>' +
    '    <div class="td-amounts">' +
    '      <button type="button" class="td-chip active" data-amt="500">₹500</button>' +
    '      <button type="button" class="td-chip" data-amt="1000">₹1,000</button>' +
    '      <button type="button" class="td-chip" data-amt="2500">₹2,500</button>' +
    '      <button type="button" class="td-chip" data-amt="5000">₹5,000</button>' +
    '    </div>' +
    '    <div class="field"><label for="td-amount">Or enter your own amount (₹)</label>' +
    '      <input id="td-amount" type="number" min="10" max="2000000" step="1" inputmode="numeric" placeholder="Custom amount (min ₹10)" value="500"></div>' +
    '    <div class="field"><label for="td-name">Your name <span class="req">*</span></label>' +
    '      <input id="td-name" type="text" placeholder="Full name" autocomplete="name"></div>' +
    '    <div class="td-grid">' +
    '      <div class="field"><label for="td-email">Email <span class="req">*</span></label>' +
    '        <input id="td-email" type="email" placeholder="you@example.com" autocomplete="email"></div>' +
    '      <div class="field"><label for="td-phone">Phone <span class="opt">(optional)</span></label>' +
    '        <input id="td-phone" type="tel" placeholder="10-digit mobile" autocomplete="tel"></div>' +
    '    </div>' +
    '    <button type="button" class="btn btn-gold btn-block btn-lg td-donate">Donate <span class="td-btn-amt">₹500</span></button>' +
    '    <p class="td-note">🔒 Secure payment via Razorpay · A receipt is emailed to you · 80G tax benefit</p>' +
    '    <p class="td-msg"></p>' +
    '  </div>' +
    '  <div class="reg-success td-success">' +
    '    <div class="s-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
    '    <h3>Thank you! 🌱</h3>' +
    '    <p class="td-success-text">Your donation was successful. A receipt has been emailed to you.</p>' +
    '    <button type="button" class="btn btn-primary reg-done">Done</button>' +
    '  </div>' +
    '</div>';
  doc.body.appendChild(modal);

  var amtInput = modal.querySelector("#td-amount");
  var btn = modal.querySelector(".td-donate");
  var btnAmt = modal.querySelector(".td-btn-amt");
  var chips = modal.querySelectorAll(".td-chip");
  var msg = modal.querySelector(".td-msg");
  var bodyBox = modal.querySelector(".td-body");
  var successBox = modal.querySelector(".td-success");
  var successText = modal.querySelector(".td-success-text");

  function currentAmt() { return Math.floor(Number(amtInput.value) || 0); }
  function syncBtn() { btnAmt.textContent = currentAmt() > 0 ? fmt(currentAmt()) : ""; }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      amtInput.value = chip.getAttribute("data-amt");
      syncBtn();
    });
  });
  amtInput.addEventListener("input", function () {
    chips.forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-amt") === String(currentAmt()));
    });
    syncBtn();
  });
  syncBtn();

  // ---- open / close ----
  function open() {
    msg.textContent = "";
    bodyBox.style.display = "";
    successBox.classList.remove("show");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    doc.body.style.overflow = "hidden";
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    doc.body.style.overflow = "";
  }

  fab.addEventListener("click", open);
  doc.addEventListener("click", function (e) {
    if (e.target.closest(".td-modal .reg-close") ||
        e.target.closest(".td-modal .reg-backdrop") ||
        e.target.closest(".td-modal .reg-done")) close();
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Do not auto-open on page load — header Donate + this button are enough.

  // ---- Razorpay: load on demand ----
  function ensureRazorpay(cb) {
    if (window.Razorpay) { cb(); return; }
    var s = doc.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = cb;
    s.onerror = function () {
      msg.textContent = "Couldn’t load the payment library. Please check your connection.";
      msg.style.color = "var(--gold-600)";
    };
    doc.head.appendChild(s);
  }

  // Log to the Google Sheet + email a receipt (fire-and-forget).
  function saveDonation(d) {
    if (!API) return;
    d.type = "donation";
    try {
      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(d)
      }).catch(function () { });
    } catch (e) { }
  }

  btn.addEventListener("click", function () {
    var amount = currentAmt();
    var name = (modal.querySelector("#td-name").value || "").trim();
    var email = (modal.querySelector("#td-email").value || "").trim();
    var phone = (modal.querySelector("#td-phone").value || "").trim();

    msg.style.color = "var(--gold-600)";
    if (!name) { msg.textContent = "Please enter your name."; modal.querySelector("#td-name").focus(); return; }
    if (!EMAIL_RE.test(email)) { msg.textContent = "Please enter a valid email for your receipt."; modal.querySelector("#td-email").focus(); return; }
    if (amount < 10) { msg.textContent = "Minimum donation is ₹10."; amtInput.focus(); return; }
    if (amount > MAX_AMT) { msg.textContent = "Maximum online donation is ₹20,00,000. Please contact us for larger gifts."; amtInput.focus(); return; }
    if (!RZP_KEY) { msg.textContent = "Payments are not configured yet. Please try the Donate page."; return; }

    btn.disabled = true;
    ensureRazorpay(function () {
      btn.disabled = false;
      var rzp = new Razorpay({
        key: RZP_KEY,
        amount: amount * 100,
        currency: "INR",
        name: "Karisakattu Poove Trust",
        description: "Plant a Tree — donation towards tree plantation",
        image: "images/logo-clean.png",
        prefill: { name: name, email: email, contact: phone },
        notes: { purpose: "Plant a Tree", trust_reg: "74/2020" },
        theme: { color: "#2e7d32" },
        handler: function (response) {
          saveDonation({ name: name, email: email, phone: phone, amount: amount, payment_id: response.razorpay_payment_id });
          successText.innerHTML = "Your donation of <b>" + fmt(amount) + "</b> was successful. " +
            "A receipt has been emailed to <b>" + email + "</b>.<br><span style=\"color:var(--muted)\">Ref: " +
            response.razorpay_payment_id + "</span>";
          bodyBox.style.display = "none";
          successBox.classList.add("show");
        }
      });
      rzp.on("payment.failed", function (resp) {
        msg.textContent = "Payment failed: " + ((resp.error && resp.error.description) || "please try again.");
      });
      rzp.open();
    });
  });
})();
