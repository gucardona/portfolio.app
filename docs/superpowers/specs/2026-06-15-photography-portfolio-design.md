# Photography Portfolio — Design Spec
**Date:** 2026-06-15
**Project:** `portfolio.app` (inside `gupa.dev` monorepo)

---

## Overview

A single-page React photography portfolio with a dark, immersive gallery aesthetic. Visitors browse all photos on the gallery page, filter by genre, and click through to a dedicated detail page per photo that shows the full image plus camera EXIF metadata.

---

## Stack

| Layer | Choice |
|---|---|
| Bundler | Vite |
| UI | React 18 |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Styling | Plain CSS with CSS variables (no framework) |

Fonts: `Unbounded` (weights 200, 300) + `Syne` (weights 300, 400) — loaded from Google Fonts, consistent with the rest of gupa.dev.

---

## Design Direction

- **Background:** `#0a0a0a` (near-black) throughout — images float against darkness
- **Text:** `#f0f0ee` primary, `#444` / `#888` for labels and metadata
- **Accent:** `#0057b8` (matches gupa.dev blue) — used sparingly on active filter chip borders
- **Borders/dividers:** `#1a1a1a`
- **Font sizes:** micro uppercase labels in Unbounded (6–8px, letter-spacing 0.2–0.35em), body in Syne

---

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Gallery` | Masonry grid + filter bar |
| `/photo/:slug` | `PhotoDetail` | Full image + metadata + EXIF + prev/next |

No other routes in scope.

---

## File Structure

```
portfolio.app/
├── src/
│   ├── data/
│   │   └── photos.js           ← static photo registry
│   ├── components/
│   │   ├── Nav.jsx             ← top navigation bar
│   │   ├── FilterBar.jsx       ← genre filter chips
│   │   ├── MasonryGrid.jsx     ← Framer Motion layout grid
│   │   └── PhotoCard.jsx       ← individual thumbnail, links to /photo/:slug
│   ├── pages/
│   │   ├── Gallery.jsx         ← route: /
│   │   └── PhotoDetail.jsx     ← route: /photo/:slug
│   ├── App.jsx                 ← React Router setup
│   └── index.css               ← CSS variables, reset, global styles
└── public/
    └── photos/                 ← image files (jpg/webp)
```

---

## Data Structure

Each photo is a plain JS object in `src/data/photos.js`:

```js
{
  slug: "golden-hour-patagonia",       // URL key → /photo/golden-hour-patagonia
  title: "Golden Hour, Patagonia",
  year: 2025,
  genres: ["landscape", "travel"],     // array — photo can appear in multiple filters
  src: "/photos/golden-hour-patagonia.jpg",
  aspectRatio: "3/2",                  // manually set: "3/2" | "2/3" | "1"

  exif: {                              // entire block optional; omit any missing fields
    shutter: "1/500s",
    aperture: "f/2.8",
    iso: 400,
    focal: "35mm",
    camera: "Sony A7IV",
    lens: "24–70 f/2.8",
    location: "Patagonia, AR",
  }
}
```

`genres` is an array so a photo can appear under multiple filter categories simultaneously. `aspectRatio` is set manually to avoid runtime image-dimension parsing. Any missing `exif` field is simply not rendered.

---

## Gallery Page (`/`)

### Nav
Logo (`portfolio`) left, links (`About · Contact`) right. Same Unbounded micro-type style as gupa.dev.

### Filter Bar
Chips: `All · Landscape · Street · Portrait · Travel`. Active chip has white border and white text. Each chip displays the count of photos in that genre in a muted tone. Clicking a chip filters the grid.

### Masonry Grid
CSS Grid with `grid-template-columns: repeat(3, 1fr)`. Portrait photos (`aspectRatio: "2/3"`) use `grid-row: span 2`. Wide/panoramic photos (`aspectRatio: "3/2"`) use `grid-column: span 2` where appropriate. Gap: 3px.

On hover: brightness lift + pointer cursor. No text overlay on thumbnails.

Each card is a `<Link>` to `/photo/:slug`.

---

## Photo Detail Page (`/photo/:slug`)

### Layout (top to bottom)
1. **Nav** — same as gallery
2. **Back link** — `← Back to gallery`
3. **Full-width image** — respects original aspect ratio, no cropping
4. **Metadata row** — title + `Genre · Year` on left; genre tag chips on right
5. **EXIF block (primary)** — 4-column grid: Shutter · Aperture · ISO · Focal length
6. **EXIF block (secondary)** — 3-column grid: Camera · Lens · Location
7. **Prev / Next arrows** — navigate through all photos (or filtered set if navigated from a filter)

EXIF blocks are separated from metadata by a `1px` `#1a1a1a` divider. Each EXIF item shows a micro uppercase label above the value. Missing fields are not rendered; if all secondary EXIF fields are absent, the secondary block is hidden entirely.

---

## Animations (Framer Motion)

| Moment | Mechanism | Duration |
|---|---|---|
| Filter switch | `layout` prop on `PhotoCard` + `AnimatePresence` for exits | ~200ms |
| Gallery → Detail | Fade-up on detail page mount (`y: 20→0`, `opacity: 0→1`) | ~300ms |
| Detail → Gallery (back) | Plain fade, no motion | ~150ms |

No scroll animations, no stagger effects. Motion is used only where it adds clarity to state changes.

---

## Out of Scope (this iteration)

- CMS or admin interface for adding photos
- About and Contact pages (nav links present but routes not built)
- SEO / meta tags
- Automatic EXIF extraction from image files
- Mobile-specific layout (responsive CSS included but not a primary design target yet)
