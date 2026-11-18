/* ===================================================================
   Site configuration
   Paste your deployed Google Apps Script Web App URL below (one time).
   See ADMIN-SETUP.md for step-by-step instructions.
   =================================================================== */
window.KPT_CONFIG = {
  // e.g. "https://script.google.com/macros/s/AKfy....../exec"
  EVENTS_API: "https://script.google.com/macros/s/AKfycbzZQpCSVjLn8Ze2U1TshXyvRyXbpNELv9ipWqZ1zHesU1HAsDK1Hrq3DGO0P1PPamoZ/exec",
  // Poster shown inside the featured (nearest upcoming) event card on the
  // Events page, and used as the page's social-share image.
  FEATURED_EVENT_IMAGE: "images/event-banner-aug15.jpg",
  // Razorpay key — shared by the donate page and the "Plant a Tree" popup.
  // Swap the rzp_live_ key here if it ever changes (one place, both places update).
  RAZORPAY_KEY: "rzp_live_T50zAZykTr9Rhq",

  /* ---------------- Transport / live tracking ----------------
     TRANSPORT_API : Apps Script web-app URL for google-apps-script/Transport.gs
                     (separate deployment from EVENTS_API). See TRANSPORT-SETUP.md.
     FIREBASE      : Firebase web config for the LIVE positions database.
                     Leave databaseURL empty until Firebase is set up — the pages
                     still load, they just show "live feed not connected".     */
  TRANSPORT_API: "",
  FIREBASE: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    appId: ""
  },
  // Map centre when nothing is being tracked yet (Hosur)
  MAP_CENTER: [12.7409, 77.8253],
  MAP_ZOOM: 12
};
