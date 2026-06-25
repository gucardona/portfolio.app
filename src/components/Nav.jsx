import { Link } from 'react-router-dom'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">Gustavo Parcianello Cardona</Link>
      <div className="nav-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  )
}
