# Media — your photos & videos go here

Right now the site uses high-quality **placeholder** photos loaded from Unsplash so it
looks complete out of the box. Replace them with your own media — that's the whole point.

## Folder layout
```
images/                 ← put your photos here (.jpg / .webp / .png)
images/videos/          ← put your videos here (.mp4 / .webm)
images/favicon.svg      ← site icon (already provided)
```

## How to add YOUR photos to the Gallery
Open `gallery.html`. Each photo is one block like this:

```html
<div class="g-item" data-cat="plantation" data-cap="Sapling drive, 2024"
     data-full="images/my-photo-large.jpg">
  <img src="images/my-photo-thumb.jpg" alt="Sapling drive" loading="lazy">
</div>
```
- `data-cat`  → filter category: `plantation`, `forest`, `community`, `water`, `education`, `video`
- `data-cap`  → caption shown on hover and in the lightbox
- `data-full` → the large/full-size image opened in the lightbox
- `src`       → a smaller thumbnail (keeps the page fast)

## How to add a VIDEO to the Gallery
Add `data-video` pointing to your video file. Use any image as the clickable poster:

```html
<div class="g-item" data-cat="video" data-cap="Plantation day film"
     data-video="images/videos/plantation-day.mp4">
  <img src="images/video-poster.jpg" alt="Plantation day film" loading="lazy">
</div>
```
The lightbox automatically plays videos and shows photos — no code changes needed.

## How to use a VIDEO in the homepage hero
In `index.html`, find `<div class="hero-bg">` and swap the `<img>` for:

```html
<video autoplay muted loop playsinline poster="images/hero-poster.jpg">
  <source src="images/videos/hero.mp4" type="video/mp4">
</video>
```

## Tips for fast loading
- Resize photos to ~1600px wide max, save as JPG ~80% quality (or WebP).
- Keep hero/background videos short (10–20s) and compressed (~5–10 MB).
- Keep thumbnails ~600px wide.
