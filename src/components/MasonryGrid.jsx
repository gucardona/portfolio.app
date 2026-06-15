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
            >
            <PhotoCard photo={photo} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
