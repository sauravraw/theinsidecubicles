import Reveal from './Reveal.jsx'
import { CONTACT } from '../data.js'

function SiteMap() {
  return (
    <div className="loc-map">
      <div className="loc-frame">
        <span className="loc-here" aria-hidden="true">
          We are here
        </span>
        <iframe
          className="loc-embed"
          title="The Inside Cubicles on Google Maps"
          src={`https://maps.google.com/maps?q=${CONTACT.coords}(${encodeURIComponent('The Inside Cubicles')})&z=18&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <a
        className="loc-directions"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.mapsQuery)}`}
        target="_blank"
        rel="noreferrer"
      >
        Get directions on Google Maps →
      </a>
    </div>
  )
}

export default function Location() {
  return (
    <section className="section container loc" id="contact">
      <Reveal className="loc-info">
        <p className="eyebrow">Location & contact</p>
        <h2 className="section-title">Find us here</h2>
        <address className="loc-address">
          {CONTACT.address.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
        <dl className="loc-hours">
          {CONTACT.hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.time}</dd>
            </div>
          ))}
        </dl>
        <div className="loc-nearby">
          <p className="loc-nearby-head">Food nearby</p>
          <p className="loc-nearby-list">
            {CONTACT.nearby.join(' · ')} — all a short walk from the door.
          </p>
        </div>
        <p className="loc-lines">
          <a href={`tel:${CONTACT.phone.replace(/ /g, '')}`}>{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
        <div className="loc-ctas">
          <a className="btn btn-primary" href={CONTACT.enquiryForm} target="_blank" rel="noreferrer">
            Enquire now
          </a>
          <a className="btn btn-ghost" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
        </div>
      </Reveal>
      <Reveal className="loc-figure" delay={120}>
        <SiteMap />
      </Reveal>
    </section>
  )
}
