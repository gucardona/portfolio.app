import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { usePhotos } from '../context/PhotosContext'
import './Admin.css'

const GENRES = ['landscape', 'street', 'portrait', 'travel']
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

export default function Admin() {
  const { authed, checking, logout } = useAuth()
  const { photos, refresh } = usePhotos()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState(empty)
  const [slugManual, setSlugManual] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (checking) return null
  if (!authed) return <Navigate to="/login" replace />

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const setTitle = (val) => {
    set('title', val)
    if (!slugManual) set('slug', toSlug(val))
  }

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setForm(prev => {
      if (prev.title) return prev
      const base = f.name.replace(/\.[^.]+$/, '')
      const title = base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return { ...prev, title, slug: toSlug(base) }
    })
  }, [])

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

  const reset = () => {
    setForm(empty)
    setSlugManual(false)
    setPreview(null)
    setFile(null)
    setSelected(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const loadPhoto = (p) => {
    setSelected(p.slug)
    setPreview(null)
    setFile(null)
    setError(null)
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

  const handleSubmit = async () => {
    setError(null)
    setSaving(true)
    try {
      if (selected) {
        const res = await fetch(`/api/photos/${selected}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: form.title,
            year: Number(form.year),
            genres: form.genres,
            aspectRatio: form.aspectRatio,
            shutter: form.shutter || '',
            aperture: form.aperture || '',
            iso: form.iso ? Number(form.iso) : 0,
            focal: form.focal || '',
            camera: form.camera || '',
            lens: form.lens || '',
            location: form.location || '',
          }),
        })
        if (!res.ok) throw new Error(await res.text())
      } else {
        if (!file) { setError('Select an image file first'); setSaving(false); return }
        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', form.title)
        fd.append('slug', form.slug)
        fd.append('year', String(form.year))
        fd.append('genres', JSON.stringify(form.genres))
        fd.append('aspectRatio', form.aspectRatio)
        if (form.shutter) fd.append('shutter', form.shutter)
        if (form.aperture) fd.append('aperture', form.aperture)
        if (form.iso) fd.append('iso', form.iso)
        if (form.focal) fd.append('focal', form.focal)
        if (form.camera) fd.append('camera', form.camera)
        if (form.lens) fd.append('lens', form.lens)
        if (form.location) fd.append('location', form.location)
        const res = await fetch('/api/photos', {
          method: 'POST',
          credentials: 'include',
          body: fd,
        })
        if (!res.ok) throw new Error(await res.text())
      }
      await refresh()
      reset()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected || !window.confirm(`Delete "${form.title}"?`)) return
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/photos/${selected}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(await res.text())
      await refresh()
      reset()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedPhoto = selected ? photos.find(p => p.slug === selected) : null

  return (
    <div className="admin">
      <header className="admin-header">
        <Link to="/" className="admin-header__logo">Gustavo Parcianello Cardona</Link>
        <span className="admin-header__slug">/ admin</span>
        <button className="admin-header__logout" onClick={() => { logout(); navigate('/login') }}>
          logout
        </button>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__top">
            <p className="admin-sidebar__label">Photos ({photos.length})</p>
            <button className="admin-sidebar__new" onClick={reset}>+ new</button>
          </div>
          <div className="admin-sidebar__list">
            {photos.map(p => (
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
            {error && <div className="admin-error">{error}</div>}

            <div className="admin-section">
              <div className="admin-section__row">
                <p className="admin-section__heading">
                  {selected ? 'Edit · ' + form.title : 'New Photo'}
                </p>
                <button className="admin-reset-btn" onClick={reset}>clear</button>
              </div>

              <div
                className={`admin-dropzone${dragging ? ' admin-dropzone--active' : ''}${preview || selectedPhoto ? ' admin-dropzone--filled' : ''}`}
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
                ) : selectedPhoto ? (
                  <>
                    <img src={selectedPhoto.src} alt={form.title} className="admin-dropzone__preview" />
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
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
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
                    placeholder="golden-hour-patagonia"
                    disabled={!!selected}
                  />
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
                  <button key={g} type="button"
                    className={`admin-genre-btn${form.genres.includes(g) ? ' admin-genre-btn--on' : ''}`}
                    onClick={() => toggleGenre(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <p className="admin-section__heading">EXIF — Primary</p>
              <div className="admin-grid admin-grid--4">
                {[['shutter','Shutter','1/500s'],['aperture','Aperture','f/2.8'],['iso','ISO','400'],['focal','Focal','35mm']].map(([key, label, ph]) => (
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
                {[['camera','Camera','Sony A7IV'],['lens','Lens','24–70 f/2.8'],['location','Location','Patagonia, AR']].map(([key, label, ph]) => (
                  <div key={key} className="admin-field">
                    <label className="admin-label" htmlFor={`f-${key}`}>{label}</label>
                    <input id={`f-${key}`} className="admin-input" value={form[key]}
                      onChange={e => set(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section admin-section--last">
              <div className="admin-actions">
                <button className="admin-save-btn" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving…' : selected ? 'Save Changes' : 'Upload Photo'}
                </button>
                {selected && (
                  <button className="admin-delete-btn" onClick={handleDelete} disabled={saving}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
