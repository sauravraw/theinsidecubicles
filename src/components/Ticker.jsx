import { OFFER } from '../data.js'

const ITEMS = [
  `Founding offer — first ${OFFER.totalSpots} members get 20% off for a year`,
  'Claim your spot →',
]

// Two identical groups scroll by -50% for a seamless loop; the second is
// hidden from screen readers so the message is only announced once.
function Group({ hidden }) {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <span className="ticker-group" aria-hidden={hidden ? 'true' : undefined}>
      {repeated.map((item, i) => (
        <span key={i} className="ticker-item">
          {item}
        </span>
      ))}
    </span>
  )
}

export default function Ticker() {
  return (
    <a
      className="ticker"
      href="#offer"
      aria-label={`Founding offer — first ${OFFER.totalSpots} members get 20% off for a year. See the offer and plans.`}
    >
      <span className="ticker-track">
        <Group />
        <Group hidden />
      </span>
    </a>
  )
}
