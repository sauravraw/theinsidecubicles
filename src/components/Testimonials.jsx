import Reveal from './Reveal.jsx'
import { TESTIMONIALS } from '../data.js'

export default function Testimonials() {
  return (
    <section className="section container" id="members">
      <Reveal className="section-head">
        <p className="eyebrow">Field notes — From the floor</p>
        <h2 className="section-title">What members say</h2>
      </Reveal>
      <div className="quote-grid">
        {TESTIMONIALS.map((t, i) => (
          <Reveal as="figure" key={t.name} className="quote-card" delay={i * 80}>
            <figcaption className="quote-desk">{t.desk}</figcaption>
            <blockquote>{t.quote}</blockquote>
            <p className="quote-name">
              {t.name}
              <span>{t.role}</span>
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
