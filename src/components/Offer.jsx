import Reveal from './Reveal.jsx'
import { CONTACT } from '../data.js'

const TOTAL_SPOTS = 20
const SPOTS_TAKEN = 7

export default function Offer() {
  return (
    <section className="offer">
      <Reveal className="offer-inner container">
        <p className="eyebrow offer-eyebrow">Founding members</p>
        <h2 className="offer-title">
          First {TOTAL_SPOTS} members get <span className="offer-cut">20% off</span> for a year
        </h2>
        <p className="offer-sub">
          Any monthly plan, price locked for 12 months, plus four free meeting-room hours every
          month. When the twenty seats are signed, the offer comes off the board.
        </p>
        <div className="offer-spots" role="img" aria-label={`${TOTAL_SPOTS - SPOTS_TAKEN} of ${TOTAL_SPOTS} founding spots left`}>
          {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
            <span key={i} className={`offer-cell ${i < SPOTS_TAKEN ? 'is-taken' : ''}`} />
          ))}
          <span className="offer-count">
            {TOTAL_SPOTS - SPOTS_TAKEN} of {TOTAL_SPOTS} spots left
          </span>
        </div>
        <div className="offer-ctas">
          <a className="btn btn-primary" href="#contact">
            Claim a founding spot
          </a>
          <a className="btn btn-ghost-inverse" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
        </div>
      </Reveal>
    </section>
  )
}
