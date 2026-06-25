import { Link } from 'react-router-dom'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">Gustavo Parcianello Cardona</Link>
      <div className="nav-links">
        <Link to="/about">About</Link>
        <a href="mailto:gupcardona@gmail.com">Contact</a>
      </div>
    </nav>
  )
}
