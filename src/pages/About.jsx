import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import './About.css'

export default function About() {
  return (
    <div className="about">
      <Nav />
      <div className="about__inner">
        <h1 className="about__name">Gustavo Parcianello Cardona</h1>
        <p className="about__tagline">Photographer based in Brazil</p>
        <p className="about__bio">
          Capturing landscapes, street life, and portraits across South America, Europe, and beyond.
        </p>
        <a href="mailto:gupcardona@gmail.com" className="about__contact">
          gupcardona@gmail.com
        </a>
      </div>
    </div>
  )
}
