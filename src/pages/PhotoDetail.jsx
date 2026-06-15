import { Link, useParams } from 'react-router-dom'
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
