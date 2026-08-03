import { useState } from 'react'
import Reveal from './Reveal.jsx'
import { PLANS, SHIFTS } from '../data.js'

// Plan fields can be a plain value or { day, night }.
function pick(value, shift) {
  return typeof value === 'object' && value !== null ? value[shift] : value
}

// plan.price is the final round figure incl. 18% GST; the base is derived from it.
function fmt(n) {
  return n.toLocaleString('en-IN')
}

function basePrice(finalPrice) {
  return Math.round(finalPrice / 1.18)
}

export default function Pricing() {
  const [shift, setShift] = useState('day')

  return (
    <section className="section container" id="plans">
      <Reveal className="section-head">
        <p className="eyebrow">Plans & pricing</p>
        <h2 className="section-title">Choose your plan</h2>
        <p className="section-sub">
          The studio runs in two shifts — pick yours, then pick a plan. Every plan includes the
          full legend above; the coffee is never an add-on.
        </p>
      </Reveal>

      <Reveal className="shift-row" delay={60}>
        <div className="shift-toggle" role="group" aria-label="Choose a shift">
          {Object.entries(SHIFTS).map(([key, s]) => (
            <button
              key={key}
              type="button"
              className={shift === key ? 'is-active' : ''}
              aria-pressed={shift === key}
              onClick={() => setShift(key)}
            >
              {s.label}
              <span className="shift-time">{s.time}</span>
            </button>
          ))}
        </div>
        <p className="shift-blurb" key={shift}>
          {SHIFTS[shift].blurb}
        </p>
      </Reveal>

      <div className="price-grid">
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.id}
            className={`price-card ${plan.popular ? 'is-popular' : ''}`}
            delay={(i % 3) * 70}
          >
            {plan.popular && <span className="price-tag">Most picked</span>}
            <h3 className="price-name">{pick(plan.name, shift)}</h3>
            <p className="price-tagline">{pick(plan.tagline, shift)}</p>
            <p className="price-figure">
              <span className="price-swap" key={shift}>
                ₹{fmt(pick(plan.price, shift))}{' '}
                <span className="price-per">/ {pick(plan.per, shift)}</span>
                <span className="price-gst">
                  <strong>₹{fmt(basePrice(pick(plan.price, shift)))}</strong> + 18% GST
                </span>
              </span>
            </p>
            <ul className="price-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a className={`btn ${plan.popular ? 'btn-primary' : 'btn-ghost'}`} href="#contact">
              Get started
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal as="p" className="price-note">
        Night shift runs on a premium — the lights, the AC, and the security stay on for you.
        Bigger team, both shifts, or a whole corner to yourself? Ask for the Enterprise sheet — it
        flexes.
      </Reveal>
    </section>
  )
}
