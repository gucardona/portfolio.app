# Photography Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-themed React photography portfolio with a masonry gallery, genre filter bar, and dedicated photo detail pages with EXIF metadata.

**Architecture:** Single-page Vite + React app with React Router (two routes: `/` gallery, `/photo/:slug` detail). Photo data lives in a static JS array. Framer Motion drives filter-switch layout animations and page-enter transitions.

**Tech Stack:** Vite, React 18, React Router v6, Framer Motion, Vitest + React Testing Library, plain CSS with CSS variables, Google Fonts (Unbounded + Syne).

---

## File Map

| File | Responsibility |
|---|---|
| `src/main.jsx` | React entry point |
| `src/App.jsx` | React Router setup, two routes |
| `src/index.css` | CSS variables, reset, global typography |
| `src/data/photos.js` | Static photo registry (slug, title, genres, src, aspectRatio, exif) |
| `src/components/Nav.jsx` | Top navigation bar (logo + links) |
| `src/components/FilterBar.jsx` | Genre filter chips with per-genre counts |
| `src/components/PhotoCard.jsx` | Single masonry thumbnail, links to detail page |
| `src/components/MasonryGrid.jsx` | CSS grid + Framer Motion layout animation wrapper |
| `src/pages/Gallery.jsx` | Route `/` — filter state + MasonryGrid |
| `src/pages/PhotoDetail.jsx` | Route `/photo/:slug` — full image, EXIF, prev/next |
| `public/photos/` | Image files (jpg/webp) |

---

## Task 1: Scaffold project and install dependencies

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`

- [ ] **Step 1: Create the Vite + React project**

Run inside `portfolio.app/`:
```bash
npm create vite@latest . -- --template react
```
When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes** (only `docs/` exists which won't be touched — Vite scaffolds into `src/`, `public/`, etc.).

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install react-router-dom framer-motion
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Configure Vitest in `vite.config.js`**

Replace the generated `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to `package.json`**

In `package.json`, update the `scripts` section so it includes:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server running at `http://localhost:5173` (or similar). Open it — default Vite React page appears.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with React Router, Framer Motion, Vitest"
```

---

## Task 2: Global styles and CSS variables

**Files:**
- Modify: `src/index.css`
- Modify: `index.html` (add Google Fonts link)

- [ ] **Step 1: Add Google Fonts to `index.html`**

Replace the `<head>` section of `index.html` with:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300&family=Syne:wght@300;400&display=swap"
      rel="stylesheet"
    />
    <title>Photography — portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace `src/index.css` with design system styles**

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0a;
  --fg: #f0f0ee;
  --muted: #888;
  --faint: #444;
  --divider: #1a1a1a;
  --accent: #0057b8;
  --gap: 3px;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: 'Syne', sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

- [ ] **Step 3: Delete the generated `src/App.css`**

```bash
rm src/App.css
```

- [ ] **Step 4: Verify styles apply**

Update `src/main.jsx` to import the CSS (replace its contents):
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Run `npm run dev` and open the browser — background should be `#0a0a0a` (near-black).

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css src/main.jsx
git commit -m "feat: add CSS variables and global styles"
```

---

## Task 3: Photo data

**Files:**
- Create: `src/data/photos.js`

- [ ] **Step 1: Create `src/data/photos.js` with sample entries**

```js
export const GENRES = ['landscape', 'street', 'portrait', 'travel']

export const photos = [
  {
    slug: 'golden-hour-patagonia',
    title: 'Golden Hour, Patagonia',
    year: 2025,
    genres: ['landscape', 'travel'],
    src: '/photos/golden-hour-patagonia.jpg',
    aspectRatio: '3/2',
    exif: {
      shutter: '1/500s',
      aperture: 'f/2.8',
      iso: 400,
      focal: '35mm',
      camera: 'Sony A7IV',
      lens: '24–70 f/2.8',
      location: 'Patagonia, AR',
    },
  },
  {
    slug: 'morning-portrait',
    title: 'Morning Light',
    year: 2025,
    genres: ['portrait'],
    src: '/photos/morning-portrait.jpg',
    aspectRatio: '2/3',
    exif: {
      shutter: '1/200s',
      aperture: 'f/1.8',
      iso: 200,
      focal: '85mm',
      camera: 'Sony A7IV',
      lens: '85mm f/1.8',
    },
  },
  {
    slug: 'downtown-rush',
    title: 'Downtown Rush',
    year: 2024,
    genres: ['street'],
    src: '/photos/downtown-rush.jpg',
    aspectRatio: '3/2',
    exif: {
      shutter: '1/1000s',
      aperture: 'f/5.6',
      iso: 800,
      focal: '28mm',
      location: 'São Paulo, BR',
    },
  },
  {
    slug: 'misty-valleys',
    title: 'Misty Valleys',
    year: 2024,
    genres: ['landscape'],
    src: '/photos/misty-valleys.jpg',
    aspectRatio: '3/2',
    exif: {
      shutter: '1/60s',
      aperture: 'f/8',
      iso: 100,
      focal: '24mm',
      camera: 'Sony A7IV',
      location: 'Serra Gaúcha, BR',
    },
  },
  {
    slug: 'tokyo-alley',
    title: 'Tokyo Alley',
    year: 2024,
    genres: ['street', 'travel'],
    src: '/photos/tokyo-alley.jpg',
    aspectRatio: '2/3',
    exif: {
      shutter: '1/125s',
      aperture: 'f/4',
      iso: 1600,
      focal: '35mm',
      location: 'Tokyo, JP',
    },
  },
  {
    slug: 'dunes-at-dusk',
    title: 'Dunes at Dusk',
    year: 2025,
    genres: ['landscape', 'travel'],
    src: '/photos/dunes-at-dusk.jpg',
    aspectRatio: '1',
    exif: {
      shutter: '1/250s',
      aperture: 'f/11',
      iso: 200,
      focal: '50mm',
    },
  },
]
```

- [ ] **Step 2: Write a test for the data shape**

Create `src/data/photos.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { photos, GENRES } from './photos'

describe('photos data', () => {
  it('every photo has required fields', () => {
    photos.forEach(photo => {
      expect(photo.slug).toBeTruthy()
      expect(photo.title).toBeTruthy()
      expect(photo.year).toBeTypeOf('number')
      expect(photo.genres).toBeInstanceOf(Array)
      expect(photo.genres.length).toBeGreaterThan(0)
      expect(photo.src).toBeTruthy()
      expect(['3/2', '2/3', '1']).toContain(photo.aspectRatio)
    })
  })

  it('all photo genres are valid GENRES values', () => {
    photos.forEach(photo => {
      photo.genres.forEach(g => {
        expect(GENRES).toContain(g)
      })
    })
  })

  it('slugs are unique', () => {
    const slugs = photos.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
```

- [ ] **Step 3: Run the test**

```bash
npm test
```
Expected: 3 tests pass.

- [ ] **Step 4: Add placeholder images to `public/photos/`**

Create a placeholder for local dev (avoids broken images while building):
```bash
mkdir -p public/photos
```

Photos won't load in the browser until you drop real images in, but the app won't crash — the `<img>` just shows a broken icon, which is fine during development.

- [ ] **Step 5: Commit**

```bash
git add src/data/photos.js src/data/photos.test.js public/photos/
git commit -m "feat: add static photo data with Vitest shape tests"
```

---

## Task 4: Nav component

**Files:**
- Create: `src/components/Nav.jsx`
- Create: `src/components/Nav.css`

- [ ] **Step 1: Create `src/components/Nav.css`**

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5vw;
  border-bottom: 1px solid var(--divider);
}

.nav-logo {
  font-family: 'Unbounded', sans-serif;
  font-size: 9px;
  font-weight: 200;
  letter-spacing: .35em;
  text-transform: uppercase;
  color: var(--muted);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-family: 'Unbounded', sans-serif;
  font-size: 8px;
  font-weight: 200;
  letter-spacing: .25em;
  text-transform: uppercase;
  color: var(--faint);
  transition: color .2s;
}

.nav-links a:hover {
  color: var(--fg);
}
```

- [ ] **Step 2: Create `src/components/Nav.jsx`**

```jsx
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav">
      <span className="nav-logo">portfolio</span>
      <div className="nav-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Write a smoke test for Nav**

Create `src/components/Nav.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from './Nav'

describe('Nav', () => {
  it('renders logo and links', () => {
    render(<Nav />)
    expect(screen.getByText('portfolio')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```
Expected: all tests pass (3 data + 1 Nav).

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.jsx src/components/Nav.css src/components/Nav.test.jsx
git commit -m "feat: add Nav component"
```

---

## Task 5: FilterBar component

**Files:**
- Create: `src/components/FilterBar.jsx`
- Create: `src/components/FilterBar.css`

- [ ] **Step 1: Write the failing test first**

Create `src/components/FilterBar.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar'
import { photos, GENRES } from '../data/photos'

describe('FilterBar', () => {
  it('renders All chip and one chip per genre', () => {
    render(<FilterBar genres={GENRES} active="all" counts={{}} onChange={() => {}} />)
    expect(screen.getByText(/^All/)).toBeInTheDocument()
    GENRES.forEach(g => {
      expect(screen.getByText(new RegExp(g, 'i'))).toBeInTheDocument()
    })
  })

  it('marks the active chip', () => {
    render(<FilterBar genres={GENRES} active="landscape" counts={{}} onChange={() => {}} />)
    const chip = screen.getByText(/landscape/i).closest('.filter-chip')
    expect(chip).toHaveClass('filter-chip--active')
  })

  it('calls onChange with the clicked genre', async () => {
    const onChange = vi.fn()
    render(<FilterBar genres={GENRES} active="all" counts={{}} onChange={onChange} />)
    await userEvent.click(screen.getByText(/street/i))
    expect(onChange).toHaveBeenCalledWith('street')
  })

  it('calls onChange with "all" when All chip is clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar genres={GENRES} active="landscape" counts={{}} onChange={onChange} />)
    await userEvent.click(screen.getByText(/^All/))
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('shows photo count next to each chip', () => {
    const counts = { all: 6, landscape: 3, street: 1, portrait: 1, travel: 2 }
    render(<FilterBar genres={GENRES} active="all" counts={counts} onChange={() => {}} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```
Expected: FAIL — "Cannot find module './FilterBar'".

- [ ] **Step 3: Create `src/components/FilterBar.css`**

```css
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 1.5rem 5vw;
  flex-wrap: wrap;
}

.filter-chip {
  font-family: 'Unbounded', sans-serif;
  font-size: 7px;
  font-weight: 200;
  letter-spacing: .2em;
  text-transform: uppercase;
  padding: 5px 12px;
  border: 1px solid #222;
  border-radius: 2px;
  color: var(--faint);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color .15s, border-color .15s;
}

.filter-chip:hover {
  color: var(--fg);
  border-color: #444;
}

.filter-chip--active {
  color: var(--fg);
  border-color: var(--fg);
}

.filter-chip__count {
  font-size: 6px;
  color: #333;
}

.filter-chip--active .filter-chip__count {
  color: var(--faint);
}
```

- [ ] **Step 4: Create `src/components/FilterBar.jsx`**

```jsx
import './FilterBar.css'

export default function FilterBar({ genres, active, counts, onChange }) {
  const allChips = [{ key: 'all', label: 'All' }, ...genres.map(g => ({ key: g, label: g }))]

  return (
    <div className="filter-bar">
      {allChips.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-chip${active === key ? ' filter-chip--active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          {counts[key] != null && (
            <span className="filter-chip__count">{counts[key]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/FilterBar.jsx src/components/FilterBar.css src/components/FilterBar.test.jsx
git commit -m "feat: add FilterBar component with active state and photo counts"
```

---

## Task 6: PhotoCard component

**Files:**
- Create: `src/components/PhotoCard.jsx`
- Create: `src/components/PhotoCard.css`

- [ ] **Step 1: Write the failing test**

Create `src/components/PhotoCard.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PhotoCard from './PhotoCard'

const photo = {
  slug: 'test-photo',
  title: 'Test Photo',
  year: 2025,
  genres: ['landscape'],
  src: '/photos/test.jpg',
  aspectRatio: '3/2',
}

describe('PhotoCard', () => {
  it('renders an image with correct src and alt', () => {
    render(
      <MemoryRouter>
        <PhotoCard photo={photo} />
      </MemoryRouter>
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/photos/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test Photo')
  })

  it('links to the correct photo detail route', () => {
    render(
      <MemoryRouter>
        <PhotoCard photo={photo} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/photo/test-photo')
  })

  it('applies portrait class for 2/3 aspect ratio', () => {
    const portraitPhoto = { ...photo, aspectRatio: '2/3' }
    const { container } = render(
      <MemoryRouter>
        <PhotoCard photo={portraitPhoto} />
      </MemoryRouter>
    )
    expect(container.firstChild).toHaveClass('photo-card--portrait')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```
Expected: FAIL — "Cannot find module './PhotoCard'".

- [ ] **Step 3: Create `src/components/PhotoCard.css`**

```css
.photo-card {
  display: block;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.photo-card--portrait {
  grid-row: span 2;
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter .2s;
}

.photo-card:hover img {
  filter: brightness(1.1);
}
```

- [ ] **Step 4: Create `src/components/PhotoCard.jsx`**

```jsx
import { Link } from 'react-router-dom'
import './PhotoCard.css'

export default function PhotoCard({ photo }) {
  const isPortrait = photo.aspectRatio === '2/3'

  return (
    <Link
      to={`/photo/${photo.slug}`}
      className={`photo-card${isPortrait ? ' photo-card--portrait' : ''}`}
      style={{ aspectRatio: photo.aspectRatio }}
    >
      <img src={photo.src} alt={photo.title} loading="lazy" />
    </Link>
  )
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhotoCard.jsx src/components/PhotoCard.css src/components/PhotoCard.test.jsx
git commit -m "feat: add PhotoCard component"
```

---

## Task 7: MasonryGrid component

**Files:**
- Create: `src/components/MasonryGrid.jsx`
- Create: `src/components/MasonryGrid.css`

- [ ] **Step 1: Create `src/components/MasonryGrid.css`**

```css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  padding: var(--gap);
}
```

- [ ] **Step 2: Create `src/components/MasonryGrid.jsx`**

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import PhotoCard from './PhotoCard'
import './MasonryGrid.css'

export default function MasonryGrid({ photos }) {
  return (
    <div className="masonry-grid">
      <AnimatePresence>
        {photos.map(photo => (
          <motion.div
            key={photo.slug}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ gridRow: photo.aspectRatio === '2/3' ? 'span 2' : undefined }}
          >
            <PhotoCard photo={photo} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Write a smoke test**

Create `src/components/MasonryGrid.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MasonryGrid from './MasonryGrid'

const photos = [
  { slug: 'a', title: 'A', year: 2025, genres: ['landscape'], src: '/a.jpg', aspectRatio: '3/2' },
  { slug: 'b', title: 'B', year: 2025, genres: ['portrait'], src: '/b.jpg', aspectRatio: '2/3' },
]

describe('MasonryGrid', () => {
  it('renders one image per photo', () => {
    render(
      <MemoryRouter>
        <MasonryGrid photos={photos} />
      </MemoryRouter>
    )
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('renders nothing when photos array is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <MasonryGrid photos={[]} />
      </MemoryRouter>
    )
    expect(container.querySelector('.masonry-grid').children).toHaveLength(0)
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/MasonryGrid.jsx src/components/MasonryGrid.css src/components/MasonryGrid.test.jsx
git commit -m "feat: add MasonryGrid with Framer Motion layout animations"
```

---

## Task 8: Gallery page

**Files:**
- Create: `src/pages/Gallery.jsx`
- Create: `src/pages/Gallery.css`

- [ ] **Step 1: Write the failing test**

Create `src/pages/Gallery.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Gallery from './Gallery'

describe('Gallery', () => {
  it('shows all photos by default', () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(1)
  })

  it('filters to only landscape photos when Landscape chip is clicked', async () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    await userEvent.click(screen.getByText(/^landscape/i))
    const images = screen.getAllByRole('img')
    // Sample data has 3 landscape photos: golden-hour-patagonia, misty-valleys, dunes-at-dusk
    expect(images.length).toBe(3)
  })

  it('shows All chip as active by default', () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    const allChip = screen.getByText(/^All/).closest('.filter-chip')
    expect(allChip).toHaveClass('filter-chip--active')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```
Expected: FAIL — "Cannot find module './Gallery'".

- [ ] **Step 3: Create `src/pages/Gallery.css`**

```css
.gallery {
  min-height: 100vh;
}
```

- [ ] **Step 4: Create `src/pages/Gallery.jsx`**

```jsx
import { useState, useMemo } from 'react'
import Nav from '../components/Nav'
import FilterBar from '../components/FilterBar'
import MasonryGrid from '../components/MasonryGrid'
import { photos, GENRES } from '../data/photos'
import './Gallery.css'

function buildCounts(photos, genres) {
  const counts = { all: photos.length }
  genres.forEach(g => {
    counts[g] = photos.filter(p => p.genres.includes(g)).length
  })
  return counts
}

export default function Gallery() {
  const [active, setActive] = useState('all')

  const filtered = useMemo(
    () => active === 'all' ? photos : photos.filter(p => p.genres.includes(active)),
    [active]
  )

  const counts = useMemo(() => buildCounts(photos, GENRES), [])

  return (
    <div className="gallery">
      <Nav />
      <FilterBar
        genres={GENRES}
        active={active}
        counts={counts}
        onChange={setActive}
      />
      <MasonryGrid photos={filtered} />
    </div>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 6: Wire up App.jsx temporarily to test visually**

Replace `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 7: Verify gallery in browser**

```bash
npm run dev
```
Open `http://localhost:5173`. Expected:
- Near-black background
- Nav bar at top
- Filter chips (All · Landscape · Street · Portrait · Travel) with photo counts
- Masonry grid of photos (broken images are fine — just alt text squares)
- Clicking a filter chip hides non-matching photos with Framer Motion animation

- [ ] **Step 8: Commit**

```bash
git add src/pages/Gallery.jsx src/pages/Gallery.css src/pages/Gallery.test.jsx src/App.jsx
git commit -m "feat: add Gallery page with filter state and Framer Motion grid"
```

---

## Task 9: PhotoDetail page

**Files:**
- Create: `src/pages/PhotoDetail.jsx`
- Create: `src/pages/PhotoDetail.css`

- [ ] **Step 1: Write the failing tests**

Create `src/pages/PhotoDetail.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PhotoDetail from './PhotoDetail'

function renderDetail(slug) {
  return render(
    <MemoryRouter initialEntries={[`/photo/${slug}`]}>
      <Routes>
        <Route path="/photo/:slug" element={<PhotoDetail />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PhotoDetail', () => {
  it('renders the photo title and year', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText('Golden Hour, Patagonia')).toBeInTheDocument()
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('renders EXIF fields that are present', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText('1/500s')).toBeInTheDocument()
    expect(screen.getByText('f/2.8')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
  })

  it('does not render secondary EXIF block when all secondary fields are absent', () => {
    // dunes-at-dusk has no camera, lens, or location
    renderDetail('dunes-at-dusk')
    expect(screen.queryByText(/Sony/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Location/i)).not.toBeInTheDocument()
  })

  it('shows back link', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText(/back/i)).toBeInTheDocument()
  })

  it('shows Next link when not on last photo', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('shows Prev link when not on first photo', () => {
    renderDetail('downtown-rush')
    expect(screen.getByText(/prev/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```
Expected: FAIL — "Cannot find module './PhotoDetail'".

- [ ] **Step 3: Create `src/pages/PhotoDetail.css`**

```css
.photo-detail {
  min-height: 100vh;
}

.photo-detail__inner {
  padding: 2rem 5vw 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.photo-detail__back {
  font-family: 'Unbounded', sans-serif;
  font-size: 8px;
  font-weight: 200;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--faint);
  display: inline-block;
  margin-bottom: 1.5rem;
  transition: color .2s;
}

.photo-detail__back:hover {
  color: var(--fg);
}

.photo-detail__image {
  width: 100%;
  margin-bottom: 1.5rem;
}

.photo-detail__image img {
  width: 100%;
  height: auto;
  display: block;
}

.photo-detail__meta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1.25rem;
}

.photo-detail__title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: 200;
  letter-spacing: -.01em;
  color: var(--fg);
  margin-bottom: .5rem;
}

.photo-detail__subtitle {
  font-family: 'Unbounded', sans-serif;
  font-size: 8px;
  font-weight: 200;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--faint);
}

.photo-detail__tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.photo-detail__tag {
  font-family: 'Unbounded', sans-serif;
  font-size: 7px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: #333;
  padding: 3px 8px;
  border: 1px solid #222;
  border-radius: 2px;
}

/* EXIF */
.exif-primary,
.exif-secondary {
  border-top: 1px solid var(--divider);
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.exif-primary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.exif-secondary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.exif-item__label {
  font-family: 'Unbounded', sans-serif;
  font-size: 7px;
  font-weight: 200;
  letter-spacing: .25em;
  text-transform: uppercase;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.exif-item__value {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  color: var(--muted);
}

/* Prev / Next */
.photo-detail__nav {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--divider);
  padding-top: 1.25rem;
  margin-top: 1rem;
}

.photo-detail__nav-link {
  font-family: 'Unbounded', sans-serif;
  font-size: 8px;
  font-weight: 200;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--faint);
  transition: color .2s;
}

.photo-detail__nav-link:hover {
  color: var(--fg);
}

.photo-detail__nav-spacer {
  flex: 1;
}
```

- [ ] **Step 4: Create `src/pages/PhotoDetail.jsx`**

```jsx
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'
import { photos } from '../data/photos'
import './PhotoDetail.css'

function ExifItem({ label, value }) {
  if (value == null) return null
  return (
    <div className="exif-item">
      <span className="exif-item__label">{label}</span>
      <span className="exif-item__value">{value}</span>
    </div>
  )
}

export default function PhotoDetail() {
  const { slug } = useParams()
  const index = photos.findIndex(p => p.slug === slug)
  const photo = photos[index]

  const prev = index > 0 ? photos[index - 1] : null
  const next = index < photos.length - 1 ? photos[index + 1] : null

  if (!photo) {
    return (
      <div className="photo-detail">
        <Nav />
        <div className="photo-detail__inner">
          <Link to="/" className="photo-detail__back">← Back to gallery</Link>
          <p style={{ color: 'var(--muted)' }}>Photo not found.</p>
        </div>
      </div>
    )
  }

  const exif = photo.exif ?? {}
  const hasSecondary = exif.camera || exif.lens || exif.location

  return (
    <motion.div
      className="photo-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Nav />
      <div className="photo-detail__inner">
        <Link to="/" className="photo-detail__back">← Back to gallery</Link>

        <div className="photo-detail__image">
          <img src={photo.src} alt={photo.title} />
        </div>

        <div className="photo-detail__meta">
          <div>
            <h1 className="photo-detail__title">{photo.title}</h1>
            <p className="photo-detail__subtitle">
              {photo.genres.join(' · ')} · {photo.year}
            </p>
          </div>
          <div className="photo-detail__tags">
            {photo.genres.map(g => (
              <span key={g} className="photo-detail__tag">{g}</span>
            ))}
          </div>
        </div>

        {(exif.shutter || exif.aperture || exif.iso || exif.focal) && (
          <div className="exif-primary">
            <ExifItem label="Shutter" value={exif.shutter} />
            <ExifItem label="Aperture" value={exif.aperture} />
            <ExifItem label="ISO" value={exif.iso} />
            <ExifItem label="Focal" value={exif.focal} />
          </div>
        )}

        {hasSecondary && (
          <div className="exif-secondary">
            <ExifItem label="Camera" value={exif.camera} />
            <ExifItem label="Lens" value={exif.lens} />
            <ExifItem label="Location" value={exif.location} />
          </div>
        )}

        <div className="photo-detail__nav">
          {prev ? (
            <Link to={`/photo/${prev.slug}`} className="photo-detail__nav-link">← Prev</Link>
          ) : (
            <span className="photo-detail__nav-spacer" />
          )}
          {next && (
            <Link to={`/photo/${next.slug}`} className="photo-detail__nav-link">Next →</Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/PhotoDetail.jsx src/pages/PhotoDetail.css src/pages/PhotoDetail.test.jsx
git commit -m "feat: add PhotoDetail page with EXIF block and prev/next navigation"
```

---

## Task 10: Final routing and end-to-end verification

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `src/App.jsx` with both routes**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery'
import PhotoDetail from './pages/PhotoDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/photo/:slug" element={<PhotoDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: all tests pass (data + Nav + FilterBar + PhotoCard + MasonryGrid + Gallery + PhotoDetail).

- [ ] **Step 3: Add real photos and verify end-to-end in browser**

Drop at least 2–3 real photos into `public/photos/` named to match the slugs in `src/data/photos.js` (e.g. `golden-hour-patagonia.jpg`). Then:

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- [ ] Gallery loads with dark background and filter bar
- [ ] Filter chips show correct counts
- [ ] Clicking a chip filters photos with Framer Motion animation
- [ ] Clicking a photo navigates to `/photo/:slug` with fade-up animation
- [ ] Full image displays at natural aspect ratio
- [ ] EXIF fields display for photos that have them
- [ ] Secondary EXIF block (Camera/Lens/Location) hidden for photos without those fields
- [ ] Prev / Next arrows work and navigate between photos
- [ ] Back link returns to gallery

- [ ] **Step 4: Final commit**

```bash
git add src/App.jsx
git commit -m "feat: wire up React Router with Gallery and PhotoDetail routes"
```

---

## Build verification

- [ ] Run `npm run build` — should complete with no errors
- [ ] Run `npm run preview` — verify production build works in browser
