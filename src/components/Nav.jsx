import { Link } from 'react-router-dom'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">portfolio</Link>
      <div className="nav-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  )
}
