import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
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

  const [fullscreen, setFullscreen] = useState(false)
  const [lbScale, setLbScale] = useState(1)
  const lbScaleRef = useRef(1)
  const lbX = useMotionValue(0)
  const lbY = useMotionValue(0)
  const lbContainerRef = useRef(null)
  const lbImgRef = useRef(null)

  // Escape key
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = fullscreen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [fullscreen])

  // Reset zoom when closing
  useEffect(() => {
    if (!fullscreen) {
      lbScaleRef.current = 1
      setLbScale(1)
      lbX.set(0)
      lbY.set(0)
    }
  }, [fullscreen, lbX, lbY])

  // Scroll to zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const el = lbContainerRef.current
    if (!el || !fullscreen) return

    const onWheel = (e) => {
      e.preventDefault()
      const prev = lbScaleRef.current
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const next = Math.min(Math.max(prev * factor, 1), 6)

      if (next <= 1) {
        lbX.set(0)
        lbY.set(0)
        lbScaleRef.current = 1
        setLbScale(1)
        return
      }

      // Zoom toward cursor position
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      lbX.set(cx + (lbX.get() - cx) * (next / prev))
      lbY.set(cy + (lbY.get() - cy) * (next / prev))

      lbScaleRef.current = next
      setLbScale(next)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [fullscreen, lbX, lbY])

  const getDragConstraints = useCallback(() => {
    const img = lbImgRef.current
    if (!img || lbScaleRef.current <= 1) return { top: 0, bottom: 0, left: 0, right: 0 }
    const s = lbScaleRef.current
    const maxX = Math.max(0, (img.offsetWidth * s - window.innerWidth) / 2)
    const maxY = Math.max(0, (img.offsetHeight * s - window.innerHeight) / 2)
    return { left: -maxX, right: maxX, top: -maxY, bottom: maxY }
  }, [])

  const resetZoom = useCallback(() => {
    lbScaleRef.current = 1
    setLbScale(1)
    lbX.set(0)
    lbY.set(0)
  }, [lbX, lbY])

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

  const prev = index > 0 ? photos[index - 1] : null
  const next = index < photos.length - 1 ? photos[index + 1] : null

  const exif = photo.exif ?? {}
  const hasSecondary = exif.camera || exif.lens || exif.location
  const isZoomed = lbScale > 1

  return (
    <>
      <motion.div
        className="photo-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Nav />
        <div className="photo-detail__inner">
          <Link to="/" className="photo-detail__back">← Back to gallery</Link>

          <div className="photo-detail__image" onClick={() => setFullscreen(true)}>
            <img src={photo.src} alt={photo.title} />
            <span className="photo-detail__expand-hint">click to expand</span>
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

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            ref={lbContainerRef}
            className={`photo-lightbox${isZoomed ? ' photo-lightbox--zoomed' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === lbContainerRef.current) setFullscreen(false) }}
          >
            <motion.div
              className="photo-lightbox__frame"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.img
                ref={lbImgRef}
                src={photo.src}
                alt={photo.title}
                className="photo-lightbox__img"
                style={{ scale: lbScale, x: lbX, y: lbY }}
                drag={isZoomed}
                dragConstraints={getDragConstraints()}
                dragElastic={0}
                dragMomentum={false}
                onDoubleClick={resetZoom}
              />
            </motion.div>

            <button className="photo-lightbox__close" onClick={() => setFullscreen(false)}>✕</button>

            <AnimatePresence>
              {!isZoomed && (
                <motion.div
                  className="photo-lightbox__hint"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  scroll to zoom · drag to pan
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isZoomed && (
                <motion.div
                  className="photo-lightbox__zoom-ui"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="photo-lightbox__zoom-pill">
                    <span className="photo-lightbox__zoom-level">{lbScale.toFixed(1)}×</span>
                    <button className="photo-lightbox__zoom-reset" onClick={resetZoom}>reset</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
