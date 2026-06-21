/* ===================================================================
   KARISAKATTU POOVE TRUST — site interactions (vanilla JS, no deps)
   - Loader, theme toggle, mobile nav, sticky header
   - Scroll reveal, animated counters, parallax hero, floating leaves
   - Gallery filter + lightbox (image & video), testimonials slider
   - Forms, donate calculator, back-to-top, newsletter
   =================================================================== */
(function () {
  "use strict";
  var doc = document, body = doc.body, root = doc.documentElement;
  var on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); };
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- Loader ---------- */
  window.addEventListener("load", function () {
    var l = $("#loader");
    if (l) setTimeout(function () { l.classList.add("done"); }, 350);
  });

  /* ---------- Theme (persisted) ---------- */
  var THEME_KEY = "kpt-theme";
  function applyTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
    else if (window.matchMedia && matchMedia("(prefers-color-scheme:dark)").matches) applyTheme("dark");
  } catch (e) {}
  $$(".theme-toggle").forEach(function (btn) {
    on(btn, "click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      applyTheme(dark ? "light" : "dark");
      try { localStorage.setItem(THEME_KEY, dark ? "light" : "dark"); } catch (e) {}
    });
  });

  /* ---------- Mobile nav ---------- */
  var burger = $(".burger"), overlay = $(".nav-overlay");
  function closeNav() { body.classList.remove("nav-open"); }
  on(burger, "click", function () { body.classList.toggle("nav-open"); });
  on(overlay, "click", closeNav);
  $$(".menu a").forEach(function (a) { on(a, "click", closeNav); });
  on(doc, "keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Enhance mobile nav panel (brand + close, donate + social) ---------- */
  var navPanel = $("nav.primary"), menuList = $(".menu", navPanel);
  if (navPanel && menuList) {
    var LEAF = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>';
    var head = doc.createElement("div");
    head.className = "nav-panel-head";
    head.innerHTML =
      '<span class="brand"><span class="logo">' + LEAF + '</span><span><b>Karisakattu Poove</b><small>Trust</small></span></span>' +
      '<button class="nav-close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg></button>';
    navPanel.insertBefore(head, menuList);

    var foot = doc.createElement("div");
    foot.className = "nav-panel-foot";
    foot.innerHTML =
      '<a href="donate.html" class="btn btn-gold btn-block btn-lg">Donate Now</a>' +
      '<div class="social">' +
      '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></a>' +
      '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
      '<a href="https://www.youtube.com/@karisakattupoovehosur" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.4-.4-5a2.6 2.6 0 0 0-1.8-1.8C19 4.8 12 4.8 12 4.8s-7 0-8.8.4A2.6 2.6 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a2.6 2.6 0 0 0 1.8 1.8c1.8.4 8.8.4 8.8.4s7 0 8.8-.4A2.6 2.6 0 0 0 22.6 17c.4-1.6.4-5 .4-5zM10 15.5v-7l6 3.5z"/></svg></a>' +
      '<a href="tel:+919629280506" aria-label="Call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg></a>' +
      '</div>';
    navPanel.appendChild(foot);

    on($(".nav-close", navPanel), "click", closeNav);
    on(foot.querySelector("a[href='donate.html']"), "click", closeNav);
  }

  /* ---------- Sticky header shadow ---------- */
  var header = $("header.site");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 28);
    var tt = $("#toTop");
    if (tt) tt.classList.toggle("show", window.scrollY > 520);
  }
  on(window, "scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  on($("#toTop"), "click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Sticky bottom CTA banner (appears after scroll, dismissible) ---------- */
  var sticky = $("#stickyCta");
  if (sticky) {
    var ctaDismissed = false;
    try { ctaDismissed = sessionStorage.getItem("kpt-cta") === "1"; } catch (e) {}
    on($(".sticky-cta-close", sticky), "click", function () {
      ctaDismissed = true;
      sticky.classList.remove("show");
      body.classList.remove("cta-visible");
      try { sessionStorage.setItem("kpt-cta", "1"); } catch (e) {}
    });
    on(window, "scroll", function () {
      if (ctaDismissed) return;
      var show = window.scrollY > 660;
      sticky.classList.toggle("show", show);
      body.classList.toggle("cta-visible", show);
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -50px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var dec = (el.getAttribute("data-count").indexOf(".") > -1) ? 1 : 0;
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(1) : Math.floor(val).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = dec ? target.toFixed(1) : target.toLocaleString("en-IN");
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Progress bars (donate) ---------- */
  var bars = $$(".progress-bar i");
  if (bars.length && "IntersectionObserver" in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = (en.target.getAttribute("data-fill") || "0") + "%";
          pio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { pio.observe(b); });
  }

  /* ---------- Hero parallax + floating leaves ---------- */
  var heroBg = $(".hero-bg img");
  if (heroBg && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    on(window, "scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = "translateY(" + y * 0.22 + "px) scale(1.06)";
    }, { passive: true });
  }
  var leafBox = $(".leaves");
  if (leafBox && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    var leafSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>';
    for (var i = 0; i < 12; i++) {
      var leaf = doc.createElement("span");
      leaf.className = "leaf";
      leaf.innerHTML = leafSVG;
      var size = 12 + Math.round(Math.random() * 22);
      leaf.style.width = size + "px"; leaf.style.height = size + "px";
      leaf.style.left = Math.round(Math.random() * 100) + "%";
      leaf.style.animationDuration = (9 + Math.random() * 12).toFixed(1) + "s";
      leaf.style.animationDelay = (Math.random() * 12).toFixed(1) + "s";
      leaf.style.color = "rgba(" + (90 + Math.round(Math.random() * 60)) + ",190,120," + (0.3 + Math.random() * 0.4).toFixed(2) + ")";
      leafBox.appendChild(leaf);
    }
  }

  /* ---------- Gallery filter ---------- */
  var filterBtns = $$(".filter-btn"), gItems = $$(".masonry .g-item");
  filterBtns.forEach(function (btn) {
    on(btn, "click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      gItems.forEach(function (it) {
        var show = f === "all" || it.getAttribute("data-cat") === f;
        it.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Lightbox (images + videos) ---------- */
  var lb = $("#lightbox");
  if (lb && gItems.length) {
    var lbImg = $(".lb-img", lb), lbVid = $(".lb-vid", lb), lbCap = $(".lb-cap", lb);
    var current = 0, visible = [];
    function refreshVisible() { visible = gItems.filter(function (it) { return !it.classList.contains("hide"); }); }
    function showItem(idx) {
      refreshVisible();
      if (!visible.length) return;
      current = (idx + visible.length) % visible.length;
      var it = visible[current];
      var vsrc = it.getAttribute("data-video");
      var cap = it.getAttribute("data-cap") || "";
      if (vsrc) {
        lbImg.style.display = "none";
        lbVid.style.display = "block";
        lbVid.src = vsrc; lbVid.play();
      } else {
        lbVid.pause(); lbVid.removeAttribute("src"); lbVid.style.display = "none";
        lbImg.style.display = "block";
        var full = it.getAttribute("data-full") || (it.querySelector("img") ? it.querySelector("img").src : "");
        lbImg.src = full;
      }
      if (lbCap) lbCap.textContent = cap;
    }
    function openLB(it) {
      refreshVisible();
      showItem(visible.indexOf(it));
      lb.classList.add("open"); body.style.overflow = "hidden";
    }
    function closeLB() {
      lb.classList.remove("open"); body.style.overflow = "";
      if (lbVid) { lbVid.pause(); lbVid.removeAttribute("src"); }
    }
    gItems.forEach(function (it) { on(it, "click", function () { openLB(it); }); });
    on($(".lb-close", lb), "click", closeLB);
    on($(".lb-prev", lb), "click", function () { showItem(current - 1); });
    on($(".lb-next", lb), "click", function () { showItem(current + 1); });
    on(lb, "click", function (e) { if (e.target === lb) closeLB(); });
    on(doc, "keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft") showItem(current - 1);
      if (e.key === "ArrowRight") showItem(current + 1);
    });
  }

  /* ---------- Testimonials slider ---------- */
  var track = $(".ttrack");
  if (track) {
    var slides = $$(".tslide", track), idx = 0, timer = null;
    var dotsBox = $(".tdots");
    if (dotsBox) {
      slides.forEach(function (_, i) {
        var d = doc.createElement("button");
        d.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        if (i === 0) d.classList.add("active");
        on(d, "click", function () { go(i); restart(); });
        dotsBox.appendChild(d);
      });
    }
    var dots = dotsBox ? $$("button", dotsBox) : [];
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("active", di === idx); });
    }
    function next() { go(idx + 1); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(next, 6000); }
    if (slides.length > 1) restart();
    var sliderEl = $(".tslider");
    on(sliderEl, "mouseenter", function () { if (timer) clearInterval(timer); });
    on(sliderEl, "mouseleave", restart);
  }

  /* ---------- Homepage photo carousel ---------- */
  var pc = $(".photo-carousel");
  if (pc) {
    var pcTrack = $(".pc-track", pc);
    var pcSlides = $$(".pc-slide", pc);
    var pcDotsBox = $(".pc-dots", pc);
    var pcIdx = 0, pcTimer = null;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
    function pcPer() { return parseInt(getComputedStyle(pc).getPropertyValue("--pc-per"), 10) || 1; }
    function pcMax() { return Math.max(0, pcSlides.length - pcPer()); }
    function pcBuildDots() {
      if (!pcDotsBox) return;
      pcDotsBox.innerHTML = "";
      for (var i = 0; i <= pcMax(); i++) {
        var d = doc.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", "Go to slide " + (i + 1));
        (function (n) { on(d, "click", function () { pcGo(n); pcRestart(); }); })(i);
        pcDotsBox.appendChild(d);
      }
    }
    function pcGo(i) {
      pcIdx = Math.max(0, Math.min(i, pcMax()));
      var w = pcSlides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(pcTrack).columnGap || getComputedStyle(pcTrack).gap) || 0;
      pcTrack.style.transform = "translateX(" + (-(w + gap) * pcIdx) + "px)";
      $$("button", pcDotsBox).forEach(function (d, di) { d.classList.toggle("active", di === pcIdx); });
    }
    function pcNext() { pcGo(pcIdx >= pcMax() ? 0 : pcIdx + 1); }
    function pcPrev() { pcGo(pcIdx <= 0 ? pcMax() : pcIdx - 1); }
    function pcStop() { if (pcTimer) { clearInterval(pcTimer); pcTimer = null; } }
    function pcStart() { if (reduce || pcSlides.length <= pcPer()) return; pcStop(); pcTimer = setInterval(pcNext, 4200); }
    function pcRestart() { pcStop(); pcStart(); }
    on($(".he-next", pc), "click", function () { pcNext(); pcRestart(); });
    on($(".he-prev", pc), "click", function () { pcPrev(); pcRestart(); });
    on(pc, "mouseenter", pcStop);
    on(pc, "mouseleave", pcStart);
    var sx = 0, sdx = 0, drag = false;
    on(pcTrack, "touchstart", function (e) { drag = true; sx = e.touches[0].clientX; sdx = 0; pcStop(); }, { passive: true });
    on(pcTrack, "touchmove", function (e) { if (drag) sdx = e.touches[0].clientX - sx; }, { passive: true });
    on(pcTrack, "touchend", function () { if (Math.abs(sdx) > 40) { if (sdx < 0) pcNext(); else pcPrev(); } drag = false; pcRestart(); });
    var pcRT;
    on(window, "resize", function () { clearTimeout(pcRT); pcRT = setTimeout(function () { pcBuildDots(); pcGo(Math.min(pcIdx, pcMax())); }, 150); });
    pcBuildDots();
    pcGo(0);
    pcStart();
  }

  /* ---------- Forms: send submission to WhatsApp + show success ----------
     The trust's WhatsApp number (international format, no +, no spaces).
     Change it here once, or per-form via data-whatsapp="91XXXXXXXXXX". */
  var WA_NUMBER = "919629280506";

  function buildWAMessage(form) {
    var lines = [];
    var title = form.getAttribute("data-wa-title") || "New enquiry";
    lines.push("*" + title + " — Karisakattu Poove Trust*");
    lines.push("");
    $$(".field", form).forEach(function (field) {
      var label = field.querySelector("label");
      var input = field.querySelector("input, select, textarea");
      if (!label || !input || input.type === "checkbox") return;
      var val = (input.value || "").trim();
      if (!val) return;
      var lbl = label.textContent.replace("*", "").trim();
      lines.push("*" + lbl + ":* " + val);
    });
    var checks = $$(".chip-check input:checked", form).map(function (c) {
      return c.nextElementSibling ? c.nextElementSibling.textContent.trim() : "";
    }).filter(Boolean);
    if (checks.length) lines.push("*Interests:* " + checks.join(", "));
    return lines.join("\n");
  }

  // collect named inputs (+ checked interest chips) into a flat object
  function collectFields(form) {
    var data = {};
    $$("input[name], select[name], textarea[name]", form).forEach(function (el) {
      if (el.type === "checkbox") return;
      if (el.value) data[el.name] = el.value.trim();
    });
    var interests = $$(".chip-check input:checked", form).map(function (c) {
      return c.nextElementSibling ? c.nextElementSibling.textContent.trim() : "";
    }).filter(Boolean);
    if (interests.length) data.interests = interests.join(", ");
    return data;
  }

  // save a public form submission to the Google Sheet backend (fire-and-forget)
  function saveToSheet(form) {
    var cfg = window.KPT_CONFIG || {};
    var type = form.getAttribute("data-sheet");
    if (!cfg.EVENTS_API || !type) return;
    var payload = collectFields(form);
    payload.type = type;
    try {
      fetch(cfg.EVENTS_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) {}
  }

  $$("form[data-mock]").forEach(function (form) {
    on(form, "submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // 1) save to Google Sheet (volunteer / contact)
      saveToSheet(form);

      // 2) Open WhatsApp with the pre-filled submission
      var num = form.getAttribute("data-whatsapp") || WA_NUMBER;
      if (form.hasAttribute("data-whatsapp") || form.getAttribute("data-send") === "whatsapp") {
        var msg = buildWAMessage(form);
        window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(msg), "_blank");
      }

      var card = form.closest(".form-card") || form.parentElement;
      var success = card ? card.querySelector(".form-success") : null;
      if (success) {
        form.style.display = "none";
        success.classList.add("show");
        var nameField = form.querySelector("[data-name]");
        var nameOut = success.querySelector("[data-name-out]");
        if (nameField && nameOut && nameField.value) nameOut.textContent = nameField.value.split(" ")[0];
      } else {
        form.reset();
        alert("Thank you! Your message has been received.");
      }
    });
  });

  /* ---------- Newsletter ---------- */
  $$(".nl-form").forEach(function (form) {
    on(form, "submit", function (e) {
      e.preventDefault();
      var msg = form.parentElement.querySelector(".nl-msg");
      var input = form.querySelector("input");
      if (input && input.checkValidity()) {
        if (msg) msg.textContent = "🌱 Thank you for subscribing!";
        form.reset();
      } else { form.reportValidity(); }
    });
  });

  /* ---------- Donate: amount selector ---------- */
  var amtBtns = $$(".amount-btn"), customAmt = $("#customAmount");
  amtBtns.forEach(function (b) {
    on(b, "click", function () {
      amtBtns.forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      if (customAmt) customAmt.value = b.getAttribute("data-amt") || "";
    });
  });
  on(customAmt, "input", function () { amtBtns.forEach(function (x) { x.classList.remove("active"); }); });

  /* ---------- Donate: impact calculator ---------- */
  var range = $("#calcRange");
  if (range) {
    var outAmt = $("#calcAmt"), outTrees = $("#calcTrees"), outFam = $("#calcFam"), outCo2 = $("#calcCo2");
    function calc() {
      var amt = parseInt(range.value, 10);
      if (outAmt) outAmt.textContent = "₹" + amt.toLocaleString("en-IN");
      if (outTrees) outTrees.textContent = Math.round(amt / 50);          // ₹50 ≈ 1 sapling
      if (outFam) outFam.textContent = Math.max(1, Math.round(amt / 1500)); // ₹1500 ≈ 1 family kit
      if (outCo2) outCo2.textContent = (amt / 50 * 0.021).toFixed(2);     // ~21kg CO2/tree/yr
    }
    on(range, "input", calc);
    calc();
  }

  /* ---------- Floating WhatsApp "Contact us" button (all pages) ---------- */
  if (!$(".wa-float")) {
    var wa = doc.createElement("a");
    wa.className = "wa-float";
    wa.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Hi Karisakattu Poove Trust, I'd like to know more.");
    wa.target = "_blank"; wa.rel = "noopener";
    wa.setAttribute("aria-label", "Contact us on WhatsApp");
    wa.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.5 23.5l1.6-6A11.5 11.5 0 1 1 12 23.5a11.6 11.6 0 0 1-5.6-1.4zM12 2.5a9.5 9.5 0 0 0-8 14.6l-1 3.6 3.7-1a9.5 9.5 0 1 0 5.3-17.2zm5.5 13.4c-.3.8-1.5 1.5-2 1.5s-1.2.2-3.8-1a9.7 9.7 0 0 1-3.9-3.6c-.3-.5-.9-1.4-.9-2.6s.6-1.8.9-2 .5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 2.8c.3.1.5.1.7-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3s0 .8-.3 1.6z"/></svg>';
    body.appendChild(wa);
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Copy-to-clipboard (donate bank details) ---------- */
  $$("[data-copy]").forEach(function (el) {
    on(el, "click", function () {
      var text = el.getAttribute("data-copy");
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
        var old = el.getAttribute("title");
        el.setAttribute("title", "Copied!");
        setTimeout(function () { el.setAttribute("title", old || ""); }, 1400);
      });
    });
  });
})();
