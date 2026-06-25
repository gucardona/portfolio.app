import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PhotosProvider } from './context/PhotosContext'
import Gallery from './pages/Gallery'
import PhotoDetail from './pages/PhotoDetail'
import About from './pages/About'
import Login from './pages/Login'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <PhotosProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/photo/:slug" element={<PhotoDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      </PhotosProvider>
    </AuthProvider>
  )
}
