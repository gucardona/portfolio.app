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
