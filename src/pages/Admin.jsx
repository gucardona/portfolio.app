import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { photos as existingPhotos, GENRES } from '../data/photos'
import './Admin.css'

const ASPECT_RATIOS = ['3/2', '2/3', '1', '4/3', '16/9']

const empty = {
  title: '', slug: '', year: new Date().getFullYear(),
  aspectRatio: '3/2', genres: [],
  shutter: '', aperture: '', iso: '', focal: '',
  camera: '', lens: '', location: '',
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function generateConfig(form, fileName) {
  const exifEntries = [
    ['shutter', form.shutter],
    ['aperture', form.aperture],
    ['iso', form.iso ? Number(form.iso) : null],
    ['focal', form.focal],
    ['camera', form.camera],
    ['lens', form.lens],
    ['location', form.location],
  ].filter(([, v]) => v !== '' && v !== null && v !== undefined)

  const exifStr = exifEntries.length
    ? '    exif: {\n' + exifEntries.map(([k, v]) =>
        `      ${k}: ${typeof v === 'number' ? v : `'${v}'`},`
      ).join('\n') + '\n    },'
    : '    exif: {},'

  const src = fileName
    ? `/photos/${fileName}`
    : `/photos/${form.slug || 'photo'}.jpg`

  return `  {
    slug: '${form.slug || 'photo-slug'}',
    title: '${form.title || 'Photo Title'}',
    year: ${form.year},
    genres: [${form.genres.map(g => `'${g}'`).join(', ')}],
    src: '${src}',
    aspectRatio: '${form.aspectRatio}',
${exifStr}
  },`
}

export default function Admin() {
  const { authed, logout } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState(empty)
  const [slugManual, setSlugManual] = useState(false)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState(null)

  if (!authed) return <Navigate to="/login" replace />

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const setTitle = (val) => {
    set('title', val)
    if (!slugManual) set('slug', toSlug(val))
  }

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileName(file.name)
    if (!form.title) {
      const base = file.name.replace(/\.[^.]+$/, '')
      const title = base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      setForm(f => ({ ...f, title, slug: toSlug(base) }))
    }
  }, [form.title])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const toggleGenre = (g) => {
    set('genres', form.genres.includes(g)
      ? form.genres.filter(x => x !== g)
      : [...form.genres, g]
    )
  }

  const config = generateConfig(form, fileName)

  const copy = () => {
    navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const reset = () => {
    setForm(empty)
    setSlugManual(false)
    setPreview(null)
    setFileName('')
    setSelected(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const loadPhoto = (p) => {
    setSelected(p.slug)
    setPreview(null)
    setFileName('')
    setForm({
      title: p.title,
      slug: p.slug,
      year: p.year,
      aspectRatio: p.aspectRatio,
      genres: [...p.genres],
      shutter: p.exif?.shutter ?? '',
      aperture: p.exif?.aperture ?? '',
      iso: p.exif?.iso != null ? String(p.exif.iso) : '',
      focal: p.exif?.focal ?? '',
      camera: p.exif?.camera ?? '',
      lens: p.exif?.lens ?? '',
      location: p.exif?.location ?? '',
    })
    setSlugManual(true)
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <Link to="/" className="admin-header__logo">portfolio</Link>
        <span className="admin-header__slug">/ admin</span>
        <button className="admin-header__logout" onClick={() => { logout(); navigate('/login') }}>
          logout
        </button>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__top">
            <p className="admin-sidebar__label">Photos ({existingPhotos.length})</p>
            <button className="admin-sidebar__new" onClick={reset}>+ new</button>
          </div>
          <div className="admin-sidebar__list">
            {existingPhotos.map(p => (
              <button
                key={p.slug}
                className={`admin-photo-row${selected === p.slug ? ' admin-photo-row--active' : ''}`}
                onClick={() => loadPhoto(p)}
              >
                <div className="admin-photo-row__thumb">
                  <img src={p.src} alt={p.title} />
                </div>
                <div className="admin-photo-row__info">
                  <span className="admin-photo-row__title">{p.title}</span>
                  <span className="admin-photo-row__meta">{p.year} · {p.genres[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="admin-main">
          <motion.div
            key={selected ?? 'new'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="admin-section">
              <div className="admin-section__row">
                <p className="admin-section__heading">
                  {selected ? 'Edit · ' + form.title : 'New Photo'}
                </p>
                <button className="admin-reset-btn" onClick={reset}>clear</button>
              </div>

              <div
                className={`admin-dropzone${dragging ? ' admin-dropzone--active' : ''}${preview ? ' admin-dropzone--filled' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
                aria-label="Upload photo"
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="admin-dropzone__preview" />
                    <div className="admin-dropzone__overlay">
                      <span className="admin-dropzone__change">change image</span>
                    </div>
                  </>
                ) : selected ? (
                  <>
                    <img
                      src={existingPhotos.find(p => p.slug === selected)?.src}
                      alt={form.title}
                      className="admin-dropzone__preview"
                    />
                    <div className="admin-dropzone__overlay">
                      <span className="admin-dropzone__change">replace image</span>
                    </div>
                  </>
                ) : (
                  <div className="admin-dropzone__placeholder">
                    <div className="admin-dropzone__icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="0" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="admin-dropzone__text">drop image or click to browse</span>
                    <span className="admin-dropzone__sub">then place the file in /public/photos/</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />

              {fileName && (
                <div className="admin-file-note">
                  <span className="admin-file-note__label">file</span>
                  <span className="admin-file-note__name">{fileName}</span>
                  <span className="admin-file-note__arrow">→ copy to /public/photos/</span>
                </div>
              )}
            </div>

            <div className="admin-section">
              <p className="admin-section__heading">Info</p>
              <div className="admin-grid admin-grid--2">
                <div className="admin-field admin-field--span2">
                  <label className="admin-label" htmlFor="f-title">Title</label>
                  <input id="f-title" className="admin-input" value={form.title}
                    onChange={e => setTitle(e.target.value)} placeholder="Golden Hour, Patagonia" />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-slug">Slug</label>
                  <input id="f-slug" className="admin-input admin-input--mono" value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', e.target.value) }}
                    placeholder="golden-hour-patagonia" />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-year">Year</label>
                  <input id="f-year" className="admin-input" type="number" value={form.year}
                    onChange={e => set('year', Number(e.target.value))} min="1900" max="2099" />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-aspect">Aspect Ratio</label>
                  <select id="f-aspect" className="admin-input admin-select" value={form.aspectRatio}
                    onChange={e => set('aspectRatio', e.target.value)}>
                    {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <p className="admin-section__heading">Genres</p>
              <div className="admin-genres">
                {GENRES.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`admin-genre-btn${form.genres.includes(g) ? ' admin-genre-btn--on' : ''}`}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <p className="admin-section__heading">EXIF — Primary</p>
              <div className="admin-grid admin-grid--4">
                {[
                  ['shutter', 'Shutter', '1/500s'],
                  ['aperture', 'Aperture', 'f/2.8'],
                  ['iso', 'ISO', '400'],
                  ['focal', 'Focal', '35mm'],
                ].map(([key, label, ph]) => (
                  <div key={key} className="admin-field">
                    <label className="admin-label" htmlFor={`f-${key}`}>{label}</label>
                    <input id={`f-${key}`} className="admin-input admin-input--mono" value={form[key]}
                      onChange={e => set(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <p className="admin-section__heading">EXIF — Secondary</p>
              <div className="admin-grid admin-grid--3">
                {[
                  ['camera', 'Camera', 'Sony A7IV'],
                  ['lens', 'Lens', '24–70 f/2.8'],
                  ['location', 'Location', 'Patagonia, AR'],
                ].map(([key, label, ph]) => (
                  <div key={key} className="admin-field">
                    <label className="admin-label" htmlFor={`f-${key}`}>{label}</label>
                    <input id={`f-${key}`} className="admin-input" value={form[key]}
                      onChange={e => set(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section admin-section--last">
              <div className="admin-config-header">
                <p className="admin-section__heading">Generated Config</p>
                <button className={`admin-copy-btn${copied ? ' admin-copy-btn--done' : ''}`} onClick={copy}>
                  {copied ? '✓ copied' : 'copy'}
                </button>
              </div>
              <pre className="admin-config-output">{config}</pre>
              <p className="admin-config-note">
                Paste into <code>src/data/photos.js</code> inside the <code>photos</code> array,
                then copy the image file to <code>/public/photos/</code>.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
