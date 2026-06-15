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
