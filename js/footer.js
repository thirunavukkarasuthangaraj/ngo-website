/* Shared site footer — injected so contact details live in one place.
   Footer links are also present in the page nav and sitemap.xml for SEO. */
(function () {
  var el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML =
'<div class="container">'+
'  <div class="footer-top">'+
'    <div class="footer-brand">'+
'      <a class="brand" href="index.html"><span class="logo"><img src="images/logo-clean.png" alt="Karisakattu Poove Trust logo" width="42" height="42"></span><span><b>Karisakattu Poove</b><small>Trust</small></span></a>'+
'      <p>An environmental &amp; social welfare trust in Hosur, Tamil Nadu — planting trees, growing forests and uplifting communities since 2020.</p>'+
'      <div class="social">'+
'        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></a>'+
'        <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>'+
'        <a href="https://www.youtube.com/@karisakattupoovehosur" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.4-.4-5a2.6 2.6 0 0 0-1.8-1.8C19 4.8 12 4.8 12 4.8s-7 0-8.8.4A2.6 2.6 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a2.6 2.6 0 0 0 1.8 1.8c1.8.4 8.8.4 8.8.4s7 0 8.8-.4A2.6 2.6 0 0 0 22.6 17c.4-1.6.4-5 .4-5zM10 15.5v-7l6 3.5z"/></svg></a>'+
'        <a href="https://wa.me/919629280506" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.5 23.5l1.6-6A11.5 11.5 0 1 1 12 23.5a11.6 11.6 0 0 1-5.6-1.4zM12 2.5a9.5 9.5 0 0 0-8 14.6l-1 3.6 3.7-1a9.5 9.5 0 1 0 5.3-17.2zm5.5 13.4c-.3.8-1.5 1.5-2 1.5s-1.2.2-3.8-1a9.7 9.7 0 0 1-3.9-3.6c-.3-.5-.9-1.4-.9-2.6s.6-1.8.9-2 .5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 2.8c.3.1.5.1.7-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3s0 .8-.3 1.6z"/></svg></a>'+
'      </div>'+
'    </div>'+
'    <div class="footer-col"><h4>Quick Links</h4><ul>'+
'      <li><a href="about.html">About Us</a></li>'+
'      <li><a href="projects.html">Projects</a></li>'+
'      <li><a href="gallery.html">Gallery</a></li>'+
'      <li><a href="events.html">Events</a></li>'+
'      <li><a href="volunteer.html">Volunteer</a></li>'+
'    </ul></div>'+
'    <div class="footer-col"><h4>Get Involved</h4><ul>'+
'      <li><a href="donate.html">Donate</a></li>'+
'      <li><a href="volunteer.html">Join as Volunteer</a></li>'+
'      <li><a href="contact.html">Partner With Us</a></li>'+
'      <li><a href="contact.html">CSR Programs</a></li>'+
'      <li><a href="contact.html">Contact</a></li>'+
'    </ul></div>'+
'    <div class="footer-col newsletter"><h4>Stay Connected</h4>'+
'      <p>Join our newsletter for stories, drives and impact updates.</p>'+
'      <form class="nl-form" novalidate><input type="email" placeholder="Your email address" required aria-label="Email"><button type="submit" aria-label="Subscribe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>'+
'      <div class="nl-msg"></div>'+
'      <ul style="margin-top:18px">'+
'        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Balaji Nagar, Hosur, Krishnagiri, TN</li>'+
'        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg> <a href="tel:+919629280506">+91 96292 80506</a></li>'+
'        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg> <a href="mailto:karisakattupoovetn@gmail.com">karisakattupoovetn@gmail.com</a></li>'+
'      </ul>'+
'    </div>'+
'  </div>'+
'  <div class="footer-bottom"><span>© <span data-year>2025</span> Karisakattu Poove Trust. All rights reserved.</span><span>Made with 🌱 for a greener tomorrow · <a href="contact.html">Privacy Policy</a></span><span>Developed by Thiru · Website queries only: <a href="https://wa.me/916374217724" target="_blank" rel="noopener">WhatsApp 63742 17724</a></span></div>'+
'</div>';
  // Re-bind year + newsletter for the freshly injected markup
  el.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
