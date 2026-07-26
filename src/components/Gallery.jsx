import Reveal from './Reveal.jsx'

function Desk({ x, y }) {
  return (
    <g>
      <rect className="v-line" x={x} y={y} width="44" height="24" />
      <circle className="v-line" cx={x + 22} cy={y + 34} r="5" />
    </g>
  )
}

const VIGNETTES = [
  {
    title: 'Open studio',
    note: '6 open + 6 dedicated desks',
    art: (
      <svg viewBox="0 0 280 180" aria-hidden="true">
        {[45, 118, 191].map((x) => (
          <g key={x}>
            <Desk x={x} y={40} />
            <Desk x={x} y={104} />
          </g>
        ))}
      </svg>
    ),
  },
  {
    title: 'Conference rooms',
    note: '2 Private Conference Rooms',
    art: (
      <svg viewBox="0 0 280 180" aria-hidden="true">
        <rect className="v-wall" x="25" y="40" width="110" height="100" />
        <path className="v-accent" d="M29 70 L29 110" />
        <rect className="v-line" x="55" y="72" width="50" height="36" rx="4" />
        {[[45, 90], [115, 90], [80, 60], [80, 120]].map(([cx, cy]) => (
          <circle key={`c1-${cx}-${cy}`} className="v-line" cx={cx} cy={cy} r="6" />
        ))}
        <rect className="v-wall" x="150" y="40" width="105" height="100" />
        <rect className="v-line" x="180" y="77" width="44" height="26" rx="4" />
        {[[170, 90], [234, 90]].map(([cx, cy]) => (
          <circle key={`c2-${cx}-${cy}`} className="v-line" cx={cx} cy={cy} r="6" />
        ))}
      </svg>
    ),
  },
  {
    title: 'Phone booths',
    note: '1 Open Phone Booth',
    art: (
      <svg viewBox="0 0 280 180" aria-hidden="true">
        {[60, 160].map((x) => (
          <g key={x}>
            <rect className="v-wall" x={x} y="55" width="60" height="70" />
            <rect className="v-line" x={x + 10} y="65" width="40" height="14" />
            <circle className="v-line" cx={x + 30} cy="100" r="7" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    title: 'Lounge & pantry',
    note: 'Unlimited coffee · chai on tap',
    art: (
      <svg viewBox="0 0 280 180" aria-hidden="true">
        <rect className="v-line" x="40" y="70" width="90" height="30" rx="8" />
        <path className="v-line" d="M40 70 L40 60 L130 60 L130 70" />
        <circle className="v-line" cx="160" cy="115" r="14" />
        <rect className="v-wall" x="200" y="40" width="40" height="100" />
        <circle className="v-accent-dot" cx="220" cy="65" r="4" />
        <circle className="v-accent-dot" cx="220" cy="90" r="4" />
      </svg>
    ),
  },
]

export default function Gallery() {
  return (
    <section className="section container" id="gallery">
      <Reveal className="section-head">
        <p className="eyebrow">The space</p>
        <h2 className="section-title">Explore the studio</h2>
        <p className="section-sub">
          Designed for focus first, conversation second. Come see it in person — the drawings don't
          do the coffee justice.
        </p>
      </Reveal>
      <div className="gallery-grid">
        {VIGNETTES.map((v, i) => (
          <Reveal key={v.title} className="gallery-card" delay={i * 70}>
            <div className="gallery-art">{v.art}</div>
            <div className="gallery-meta">
              <h3>{v.title}</h3>
              <p>{v.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
