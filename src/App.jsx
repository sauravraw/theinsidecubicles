import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Amenities from './components/Amenities.jsx'
import Offer from './components/Offer.jsx'
// import About from './components/About.jsx'
import Gallery from './components/Gallery.jsx'
import FloorPlan from './components/FloorPlan.jsx'
import Pricing from './components/Pricing.jsx'
// import Testimonials from './components/Testimonials.jsx'
import Location from './components/Location.jsx'
import Footer from './components/Footer.jsx'

function initialTheme() {
  const saved = localStorage.getItem('tic-theme')
  if (saved === 'paper' || saved === 'blueprint') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'blueprint' : 'paper'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('tic-theme', theme)
  }, [theme])

  return (
    <>
      <Nav theme={theme} onToggleTheme={() => setTheme(theme === 'paper' ? 'blueprint' : 'paper')} />
      <main>
        <Hero />
        <Amenities />
        <Offer />
        {/* <About /> — hidden for now; uncomment (and the import above) to bring it back */}
        <Gallery />
        <FloorPlan />
        <Pricing />
        {/* <Testimonials /> — hidden for now; uncomment (and the import above) to bring it back */}
        <Location />
      </main>
      <Footer />
    </>
  )
}
