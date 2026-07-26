import { NAV_LINKS, CONTACT } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-name">The Inside Cubicles</p>
          <p className="footer-blurb">
            A coworking studio in Rustomjee Global City, Vasai-Virar, for people who take their
            work seriously and their office lightly.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <p className="footer-head">Happy to help</p>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          <p className="footer-head">Reach us</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:${CONTACT.phone.replace(/ /g, '')}`}>{CONTACT.phone}</a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
      <div className="container footer-base">
        <span>© 2026 The Inside Cubicles</span>
      </div>
    </footer>
  )
}
