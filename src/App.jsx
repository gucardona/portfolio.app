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
