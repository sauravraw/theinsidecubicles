import { useState } from 'react'
import { NAV_LINKS } from '../data.js'

function Wordmark() {
  return (
    <a className="nav-brand" href="#top" aria-label="The Inside Cubicles — home">
      <svg className="nav-glyph" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="13" height="13" className="glyph-fill" />
        <rect x="17" y="2" width="13" height="13" className="glyph-line" />
        <rect x="2" y="17" width="13" height="13" className="glyph-line" />
        <rect x="17" y="17" width="13" height="13" className="glyph-line" />
      </svg>
      <span className="nav-name">The Inside Cubicles</span>
    </a>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export default function Nav({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav" id="top">
      <div className="nav-inner container">
        <Wordmark />

        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="theme-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'paper' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'paper' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'paper' ? <MoonIcon /> : <SunIcon />}
          </button>
          <a className="btn btn-primary nav-cta" href="#contact">
            Get a day pass
          </a>
          <button
            className="nav-burger"
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
