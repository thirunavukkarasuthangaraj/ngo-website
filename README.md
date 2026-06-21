# 🌳 Karisakattu Poove Trust — Website

A premium, fully responsive static website for **Karisakattu Poove Trust**, an
environmental & social-welfare NGO based in Hosur, Tamil Nadu, India.

Built with **HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build step,
no dependencies. Just open and deploy.

---

## ✨ Features

- **8 pages** — Home, About, Projects, Gallery, Events, Volunteer, Donate, Contact
- **Premium design** — Poppins + Inter, forest-green & gold palette, glassmorphism, soft shadows
- 🌗 **Dark mode** toggle (remembers your choice)
- 🍃 Animated hero with **parallax + floating leaves** and a wave divider
- 🔢 **Animated counters** for impact numbers
- 🖼️ **Masonry gallery** with category filters and a **lightbox that plays photos *and* videos**
- 🕒 Animated **timeline**, auto-playing **testimonials slider**, infinite **partner marquee**
- 💚 **Donate page** — UPI/QR, bank transfer, donation tiers, progress bars, **impact calculator**
- 📝 **Volunteer & contact forms** with inline success messages
- ⬆️ Back-to-top button, loading animation, scroll-reveal animations
- 🔍 **SEO-ready** — meta tags, Open Graph, Twitter cards, JSON-LD structured data, `sitemap.xml`, `robots.txt`
- ♿ Accessible, semantic HTML; lazy-loaded images; respects `prefers-reduced-motion`

---

## 📁 Project structure

```
Karisakattupoove-trust/
├── index.html          # Homepage
├── about.html
├── projects.html
├── gallery.html
├── events.html
├── volunteer.html
├── donate.html
├── contact.html
├── css/
│   └── style.css       # Complete design system
├── js/
│   ├── script.js       # All interactions
│   └── footer.js       # Shared footer (injected — edit contact info here, once)
├── images/
│   ├── favicon.svg
│   ├── README.md       # ← How to add YOUR photos & videos
│   └── videos/         # ← Put your video files here
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## 🖼️ Adding your own photos & videos

The site ships with high-quality **placeholder** images (from Unsplash) so it looks
complete immediately. Replace them with the trust's real media — see
**[`images/README.md`](images/README.md)** for step-by-step instructions on:
- adding photos to the gallery,
- adding videos (they play right inside the lightbox),
- using a background video in the homepage hero.

---

## 🚀 Deployment

### Option A — GitHub Pages (free, recommended)
1. Push this folder to a GitHub repository.
2. Repo **Settings → Pages → Build from branch → `main` / root**.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

**Custom domain:** create a file named `CNAME` (no extension) in this folder
containing only your domain, e.g.:
```
karisakattupoovetrust.org
```
Then add the domain under Settings → Pages and point your DNS to GitHub.
> Update the `https://karisakattupoovetrust.org/` URLs in each page's `<link rel="canonical">`,
> Open Graph tags and `sitemap.xml` to match your real domain.

### Option B — Netlify / Vercel
Drag-and-drop this folder onto [netlify.com/drop](https://app.netlify.com/drop),
or import the repo in Vercel. No build settings needed (it's static).

### Option C — Any web host
Upload all files to your hosting `public_html` / web root via FTP.

### Local preview
Just open `index.html` in a browser. For the gallery video/lightbox to load local
files cleanly, run a tiny server:
```bash
python -m http.server 8000
# then visit http://localhost:8000
```

---

## 🎨 Customising

| What | Where |
|------|-------|
| Colors, fonts, radius, shadows | CSS variables at the top of `css/style.css` (`:root`) |
| Contact info, footer links | `js/footer.js` (one place, all pages) |
| Impact numbers | `data-count="..."` attributes in the HTML |
| Donate UPI ID / bank details | `donate.html` |
| Gallery photos & videos | `gallery.html` + `images/` (see `images/README.md`) |
| Events | `events.html` |
| Map location | `contact.html` (`<iframe>` `src`) |

### Connecting the forms
The volunteer and contact forms currently show a success message client-side
(no data is sent anywhere). To receive submissions, point the `<form>` at a
service like **[Formspree](https://formspree.io)**, **Getform**, or **Google Forms**:
```html
<form action="https://formspree.io/f/yourid" method="POST">
```
and remove the `data-mock` attribute.

---

## 📜 License & credits

- Placeholder photography: [Unsplash](https://unsplash.com) (free to use; replace with your own).
- Fonts: [Poppins](https://fonts.google.com/specimen/Poppins) & [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
- Built for Karisakattu Poove Trust 🌱

> _"Plant Today. Protect Tomorrow."_
