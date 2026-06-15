import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  )
}
