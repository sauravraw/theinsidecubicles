import Reveal from './Reveal.jsx'
import { AMENITIES } from '../data.js'

const SYMBOLS = {
  fibre: (
    <>
      <path d="M4 10.5C6.2 8.3 9 7 12 7s5.8 1.3 8 3.5" />
      <path d="M7 14c1.4-1.3 3.1-2 5-2s3.6.7 5 2" />
      <circle cx="12" cy="17.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
      <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
      <path d="M8 6c0-1 .8-1.2.8-2M11.5 6c0-1 .8-1.2.8-2" />
    </>
  ),
  meeting: (
    <>
      <rect x="7" y="8" width="10" height="8" rx="1" />
      <circle cx="4.5" cy="10.5" r="1.2" />
      <circle cx="4.5" cy="14" r="1.2" />
      <circle cx="19.5" cy="10.5" r="1.2" />
      <circle cx="19.5" cy="14" r="1.2" />
      <circle cx="10" cy="5" r="1.2" />
      <circle cx="14.5" cy="5" r="1.2" />
      <circle cx="10" cy="19.5" r="1.2" />
      <circle cx="14.5" cy="19.5" r="1.2" />
    </>
  ),
  power: <path d="M13 3 6 13.5h5L10.5 21l7.5-10.5h-5L13 3Z" />,
  chair: (
    <>
      <path d="M7.5 4h6v7h-6z" />
      <path d="M6 13.5h9M10.5 13.5V18M8 21h5" />
      <path d="M16.5 8.5V14" />
    </>
  ),
  secure: (
    <>
      <circle cx="8.5" cy="9" r="4" />
      <path d="M11.5 12 19 19.5M15.5 16l2-2M13.5 14l1.5-1.5" />
    </>
  ),
  print: (
    <>
      <rect x="5" y="9" width="14" height="7" rx="1" />
      <path d="M8 9V4.5h8V9M8 14h8v5.5H8z" />
    </>
  ),
  community: (
    <>
      <circle cx="8" cy="8.5" r="2.5" />
      <circle cx="16" cy="8.5" r="2.5" />
      <path d="M3.5 18c.6-2.8 2.3-4.5 4.5-4.5S11.9 15.2 12.5 18M11.5 18c.6-2.8 2.3-4.5 4.5-4.5s3.9 1.7 4.5 4.5" />
    </>
  ),
}

export default function Amenities() {
  return (
    <section className="section container" id="amenities">
      <Reveal className="section-head">
        <p className="eyebrow">Legend — What every plan includes</p>
        <h2 className="section-title">Everything you need, nothing you'd bill for</h2>
      </Reveal>
      <div className="amen-grid">
        {AMENITIES.map((item, i) => (
          <Reveal key={item.symbol} className="amen-item" delay={(i % 4) * 60}>
            <span className="amen-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24">{SYMBOLS[item.symbol]}</svg>
            </span>
            <div>
              <h3 className="amen-title">{item.title}</h3>
              <p className="amen-note">{item.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
