/* ===================================================================
   Bilingual toggle — English / தமிழ்
   Adds a language button to the header and swaps text live.
   Translations are keyed by the exact English text. Anything not in
   the dictionary stays in English (safe fallback).
   =================================================================== */
(function () {
  "use strict";
  var doc = document, body = doc.body;
  var KEY = "kpt-lang";

  // ---- Translation dictionary (English -> Tamil) ----
  var TA = {
    // Nav
    "Home": "முகப்பு", "About": "எங்களைப் பற்றி", "Projects": "திட்டங்கள்", "Gallery": "படத்தொகுப்பு",
    "Events": "நிகழ்வுகள்", "Volunteer": "தன்னார்வலர்", "Contact": "தொடர்பு", "View Site": "தளத்தைப் பார்க்க",
    "Events Page": "நிகழ்வுகள் பக்கம்",
    // Buttons / CTAs
    "Donate": "நன்கொடை", "Donate Now": "இப்போது நன்கொடை", "Become a Volunteer": "தன்னார்வலராகுங்கள்",
    "Register": "பதிவு செய்க", "Register as Volunteer": "தன்னார்வலராக பதிவு செய்க",
    "Read Our Story": "எங்கள் கதையைப் படியுங்கள்", "Join Our Mission": "எங்கள் பணியில் இணையுங்கள்",
    "See Our Projects": "எங்கள் திட்டங்களைப் பார்க்க", "View Full Gallery": "முழு படத்தொகுப்பு",
    "Get in Touch": "தொடர்பு கொள்ளுங்கள்", "Send Message": "செய்தி அனுப்பு",
    "Chat on WhatsApp": "WhatsApp இல் அரட்டை", "Fund a Project": "திட்டத்திற்கு நிதியளியுங்கள்",
    "Become a Monthly Donor": "மாதாந்திர நன்கொடையாளராகுங்கள்", "CSR Partnerships": "CSR கூட்டாண்மை",
    "Plan an Event": "நிகழ்வைத் திட்டமிடுங்கள்", "Watch Our Journey": "எங்கள் பயணத்தைப் பாருங்கள்",
    "Download Full Project Book (PDF)": "முழு திட்ட புத்தகம் (PDF)",
    "I've Donated — Notify Us": "நான் நன்கொடை அளித்தேன் — தெரிவியுங்கள்",
    "See Upcoming Events": "வரவிருக்கும் நிகழ்வுகள்",
    // Kickers
    "About the Trust": "டிரஸ்ட் பற்றி", "What We Do": "நாங்கள் செய்வது",
    "Why Choose Us": "ஏன் எங்களைத் தேர்வு செய்ய வேண்டும்", "Moments of Impact": "தாக்கத்தின் தருணங்கள்",
    "Our Journey": "எங்கள் பயணம்", "Voices of Change": "மாற்றத்தின் குரல்கள்", "Trusted By": "நம்பகமானவர்கள்",
    "Our Story": "எங்கள் கதை", "Meet the Founder": "நிறுவனரை சந்திக்கவும்", "By the Numbers": "எண்களில்",
    "Government of Tamil Nadu": "தமிழ்நாடு அரசு", "Mark Your Calendar": "நாட்காட்டியில் குறியுங்கள்",
    "Looking Back": "பின்னோக்கிப் பார்க்கையில்", "Lend Your Hands": "உங்கள் கைகளைக் கொடுங்கள்",
    "Why Volunteer": "ஏன் தன்னார்வலர்", "Volunteer Impact": "தன்னார்வலர் தாக்கம்",
    "Give Green": "பசுமைக்கு கொடையளியுங்கள்", "Say Hello": "வணக்கம் சொல்லுங்கள்",
    "Project Ledger": "திட்ட பதிவேடு", "How We Work": "நாங்கள் எப்படி செயல்படுகிறோம்",
    "Get Involved": "பங்கேற்க", "Our Values": "எங்கள் விழுமியங்கள்",
    // Headings
    "Plant Today.": "இன்று நடவு செய்.", "Protect Tomorrow.": "நாளையைக் காப்போம்.",
    "Featured Activities": "சிறப்பு செயல்பாடுகள்", "From our gallery": "எங்கள் படத்தொகுப்பிலிருந்து",
    "Impact you can trust": "நம்பகமான தாக்கம்", "Our Projects": "எங்கள் திட்டங்கள்",
    "Gallery": "படத்தொகுப்பு", "Upcoming events": "வரவிருக்கும் நிகழ்வுகள்", "Past events": "கடந்த நிகழ்வுகள்",
    "Events & Drives": "நிகழ்வுகள் & முகாம்கள்", "Contact Us": "எங்களைத் தொடர்பு கொள்ளுங்கள்",
    "Donate Today": "இன்று நன்கொடை அளியுங்கள்", "Donate to our bank account": "எங்கள் வங்கிக் கணக்கிற்கு நன்கொடை",
    "Stories from our volunteers": "எங்கள் தன்னார்வலர்களின் கதைகள்",
    "Our partners & supporters": "எங்கள் கூட்டாளர்கள் & ஆதரவாளர்கள்",
    "Together We Can Build a Greener Future": "ஒன்றாக பசுமையான எதிர்காலத்தை உருவாக்குவோம்",
    "Honoured with the Green Champion Award 2023": "பசுமை சாம்பியன் விருது 2023 பெற்றது",
    "Every Miyawaki forest, on record": "ஒவ்வொரு மியாவாகி காடும், பதிவில்",
    "Meet the Founder": "நிறுவனரை சந்திக்கவும்", "Our impact so far": "இதுவரை எங்கள் தாக்கம்",
    "Milestones that grew us": "எங்களை வளர்த்த மைல்கற்கள்",
    "From barren land to living forests": "தரிசு நிலத்திலிருந்து உயிர்க்காடுகள் வரை",
    "Growing nature, nurturing people": "இயற்கையை வளர்த்து, மக்களை வளர்க்கிறோம்",
    "Small hands, big forests": "சிறிய கைகள், பெரிய காடுகள்",
    "What our family has grown": "எங்கள் குடும்பம் வளர்த்தது", "Volunteer Registration": "தன்னார்வலர் பதிவு",
    "Send us a message": "எங்களுக்கு செய்தி அனுப்புங்கள்",
    "Bring your team for a CSR drive": "உங்கள் குழுவை CSR முகாமிற்கு அழைத்து வாருங்கள்",
    "Let's grow something together": "ஒன்றாக ஏதாவது வளர்ப்போம்",
    "Your generosity grows forests": "உங்கள் கொடை காடுகளை வளர்க்கிறது",
    // Stat labels
    "Trees & Saplings": "மரங்கள் & கன்றுகள்", "Miyawaki Forests": "மியாவாகி காடுகள்", "Locations": "இடங்கள்",
    "CSR & Govt Partners": "CSR & அரசு கூட்டாளர்கள்", "Green Champion Award": "பசுமை சாம்பியன் விருது",
    "Volunteers": "தன்னார்வலர்கள்", "Villages": "கிராமங்கள்", "Active Volunteers": "செயல் தன்னார்வலர்கள்",
    "Saplings Planted": "நடப்பட்ட கன்றுகள்", "Planting Since": "நடவு தொடங்கியது",
    "Drives Held": "நடத்திய முகாம்கள்", "Volunteer Hours": "தன்னார்வ நேரம்", "Schools": "பள்ளிகள்",
    "Miyawaki Forests Created": "உருவாக்கிய மியாவாகி காடுகள்",
    // Activity cards
    "Tree Plantation": "மரம் நடுதல்", "Palm Seed Sowing": "பனை விதை விதைத்தல்",
    "Pond & Lake Revival": "குளம் & ஏரி மீட்டல்", "Vegetable Gardens": "காய்கறித் தோட்டங்கள்",
    "Awareness & Welfare": "விழிப்புணர்வு & நலன்", "Water Conservation": "நீர் பாதுகாப்பு",
    "Pond & Lake Revival": "குளம் & ஏரி மீட்டல்",
    // Why-us
    "Verified & Transparent": "சரிபார்க்கப்பட்ட & வெளிப்படை", "Community Driven": "சமூகம் சார்ந்தது",
    "Long-Term Care": "நீண்டகால பராமரிப்பு", "CSR Partnerships": "CSR கூட்டாண்மை",
    "Measurable Impact": "அளவிடக்கூடிய தாக்கம்", "Sustainability First": "நிலைத்தன்மை முதன்மை",
    "Our Mission": "எங்கள் நோக்கம்", "Our Vision": "எங்கள் தொலைநோக்கு",
    // Footer
    "Quick Links": "விரைவு இணைப்புகள்", "Get Involved": "பங்கேற்க", "Stay Connected": "தொடர்பில் இருங்கள்",
    "About Us": "எங்களைப் பற்றி", "Join as Volunteer": "தன்னார்வலராக இணையுங்கள்",
    "Partner With Us": "எங்களுடன் இணையுங்கள்", "CSR Programs": "CSR திட்டங்கள்",
    "Privacy Policy": "தனியுரிமைக் கொள்கை",
    // Form labels
    "Full Name": "முழுப் பெயர்", "Name": "பெயர்", "Phone": "தொலைபேசி", "Email": "மின்னஞ்சல்",
    "Location": "இடம்", "Location / Village": "இடம் / கிராமம்", "Availability": "கிடைக்கும் நேரம்",
    "Areas of Interest": "ஆர்வமுள்ள பகுதிகள்", "Message": "செய்தி", "Subject": "தலைப்பு",
    "Office Hours": "அலுவலக நேரம்", "Visit Us": "எங்களை சந்திக்க", "Email Us": "மின்னஞ்சல் அனுப்புங்கள்",
    "Call / WhatsApp": "அழைப்பு / WhatsApp", "Call Us": "எங்களை அழைக்கவும்",
    // Hero subtitles / common lines
    "Creating greener villages and stronger communities through environmental and social initiatives — one tree, one family, one forest at a time.":
      "சுற்றுச்சூழல் மற்றும் சமூகப் பணிகள் மூலம் பசுமையான கிராமங்களையும் வலிமையான சமூகங்களையும் உருவாக்குகிறோம் — ஒரு மரம், ஒரு குடும்பம், ஒரு காடு.",
    // In the News (home)
    "In the News": "செய்திகளில்",
    "Featured in the press": "பத்திரிகைகளில் இடம்பெற்றோம்",
    "Our green mission has been recognised by leading media for its impact across Hosur and Krishnagiri.":
      "ஓசூர் மற்றும் கிருஷ்ணகிரி முழுவதும் எங்கள் பசுமைப் பணிக்காக முன்னணி ஊடகங்களால் அங்கீகரிக்கப்பட்டுள்ளோம்.",
    // Team & volunteers (about)
    "The People": "மக்கள்",
    "Our team & volunteers": "எங்கள் குழு & தன்னார்வலர்கள்",
    "Farmers, students, professionals and families — the hands and hearts behind every forest we grow.":
      "விவசாயிகள், மாணவர்கள், தொழில் வல்லுநர்கள் மற்றும் குடும்பங்கள் — நாங்கள் வளர்க்கும் ஒவ்வொரு காட்டிற்கும் பின்னால் இருக்கும் கைகளும் இதயங்களும்.",
    "Together for a greener Hosur 🌱": "பசுமையான ஓசூருக்காக ஒன்றாக 🌱",
    "Our volunteers & young green champions": "எங்கள் தன்னார்வலர்களும் இளம் பசுமை வீரர்களும்",
    "The Karisakattu Poove team": "கரிசக்காட்டுப் பூவே குழு",
    "At a school plantation programme": "ஒரு பள்ளி நடவு நிகழ்ச்சியில்"
  };

  // ---- Collect translatable text nodes ----
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };
  var nodes = [];
  function collect() {
    nodes = [];
    var w = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (p && (SKIP[p.nodeName] || (p.classList && p.classList.contains("lang-toggle")))) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) nodes.push(n);
  }

  function apply(lang) {
    nodes.forEach(function (n) {
      if (lang === "ta") {
        var key = (n.__en || n.nodeValue).trim();
        if (TA[key]) { if (n.__en == null) n.__en = n.nodeValue; n.nodeValue = n.nodeValue.replace(key, TA[key]); }
      } else if (n.__en != null) {
        n.nodeValue = n.__en;
      }
    });
    doc.documentElement.setAttribute("lang", lang === "ta" ? "ta" : "en");
    var btns = doc.querySelectorAll(".lang-toggle");
    for (var i = 0; i < btns.length; i++) btns[i].textContent = (lang === "ta" ? "EN" : "தமிழ்");
  }

  // ---- Inject the toggle button into the header ----
  function injectButton() {
    var actions = doc.querySelector(".nav-actions");
    if (!actions || actions.querySelector(".lang-toggle")) return;
    var btn = doc.createElement("button");
    btn.className = "icon-btn lang-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Switch language");
    var burger = actions.querySelector(".burger");
    actions.insertBefore(btn, burger || null);
    btn.addEventListener("click", function () {
      var cur = doc.documentElement.getAttribute("lang") === "ta" ? "ta" : "en";
      var next = cur === "ta" ? "en" : "ta";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  }

  function init() {
    injectButton();
    collect();
    var saved = "en";
    try { saved = localStorage.getItem(KEY) || "en"; } catch (e) {}
    apply(saved);
  }

  // Re-scan + re-apply after dynamic content is injected (e.g. events loaded
  // from the Google Sheet). Safe to call any time.
  window.KPT_retranslate = function () {
    collect();
    apply(doc.documentElement.getAttribute("lang") === "ta" ? "ta" : "en");
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
