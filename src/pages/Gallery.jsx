import { useState, useMemo } from 'react'
import Nav from '../components/Nav'
import FilterBar from '../components/FilterBar'
import MasonryGrid from '../components/MasonryGrid'
import { usePhotos } from '../context/PhotosContext'
import './Gallery.css'

function buildCounts(photos, genres) {
  const counts = { all: photos.length }
  genres.forEach(g => {
    counts[g] = photos.filter(p => p.genres.includes(g)).length
  })
  return counts
}

export default function Gallery() {
  const { photos, genres, loading } = usePhotos()
  const [active, setActive] = useState('all')

  const filtered = useMemo(
    () => active === 'all' ? photos : photos.filter(p => p.genres.includes(active)),
    [photos, active]
  )

  const counts = useMemo(() => buildCounts(photos, genres), [photos, genres])

  return (
    <div className="gallery">
      <Nav />
      <FilterBar genres={genres} active={active} counts={counts} onChange={setActive} />
      {loading
        ? <div className="gallery__loading">Loading</div>
        : <MasonryGrid photos={filtered} />
      }
    </div>
  )
}
