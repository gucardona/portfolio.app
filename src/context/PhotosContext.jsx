import { createContext, useContext, useState, useEffect } from 'react'

const PhotosContext = createContext(null)

const GENRE_ORDER = ['landscape', 'street', 'portrait', 'travel']

export function PhotosProvider({ children }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => { setPhotos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const genres = GENRE_ORDER.filter(g => photos.some(p => p.genres.includes(g)))

  return (
    <PhotosContext.Provider value={{ photos, genres, loading }}>
      {children}
    </PhotosContext.Provider>
  )
}

export const usePhotos = () => useContext(PhotosContext)
