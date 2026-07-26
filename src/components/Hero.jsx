function PlanSketch() {
  return (
    <svg
      className="hero-plan"
      viewBox="0 0 520 400"
      role="img"
      aria-label="Drafted floor plan of The Inside Cubicles studio"
    >
      {/* outer walls, with the entry gap on the left */}
      <path className="draw d1 wall" d="M40 196 L40 40 L480 40 L480 360 L40 360 L40 244" pathLength="1" />
      {/* entry door leaf + swing */}
      <path className="draw d4 thin" d="M40 244 L88 244" pathLength="1" />
      <path className="draw d4 thin" d="M40 196 A48 48 0 0 1 88 244" pathLength="1" />

      {/* desks along the top */}
      {[90, 170, 250].map((x) => (
        <g key={`top-${x}`}>
          <rect className="draw d2 thin" x={x} y="70" width="50" height="30" pathLength="1" />
          <circle className="draw d3 thin" cx={x + 25} cy="112" r="6" pathLength="1" />
        </g>
      ))}
      {/* desks along the bottom */}
      {[90, 170, 250].map((x) => (
        <g key={`bottom-${x}`}>
          <rect className="draw d2 thin" x={x} y="290" width="50" height="30" pathLength="1" />
          <circle className="draw d3 thin" cx={x + 25} cy="278" r="6" pathLength="1" />
        </g>
      ))}
      {/* the one that's yours */}
      <rect className="desk-yours" x="170" y="290" width="50" height="30" />

      {/* conference room 1 — 4 seats */}
      <path className="draw d2 wall" d="M340 40 L340 190 L480 190" pathLength="1" />
      <rect className="draw d3 thin" x="375" y="85" width="70" height="50" rx="4" pathLength="1" />
      {[[363, 98], [363, 122], [457, 98], [457, 122]].map(([cx, cy]) => (
        <circle key={`c1-${cx}-${cy}`} className="draw d3 thin" cx={cx} cy={cy} r="6" pathLength="1" />
      ))}

      {/* conference room 2 — 2 seats */}
      <path className="draw d2 wall" d="M340 210 L480 210 M340 210 L340 330 L480 330" pathLength="1" />
      <rect className="draw d3 thin" x="385" y="245" width="56" height="40" rx="4" pathLength="1" />
      {[[371, 265], [455, 265]].map(([cx, cy]) => (
        <circle key={`c2-${cx}-${cy}`} className="draw d3 thin" cx={cx} cy={cy} r="6" pathLength="1" />
      ))}

      {/* dimension lines */}
      <path className="draw d5 dim" d="M40 22 L480 22 M40 16 L40 28 M480 16 L480 28" pathLength="1" />
      <text className="plan-note" x="260" y="14" textAnchor="middle">
        12.0 M
      </text>
      <path className="draw d5 dim" d="M500 40 L500 360 M494 40 L506 40 M494 360 L506 360" pathLength="1" />
      <text className="plan-note" x="514" y="204" textAnchor="middle" transform="rotate(90 514 204)">
        8.0 M
      </text>

      {/* annotations */}
      <text className="plan-note" x="90" y="215">OPEN STUDIO</text>
      <text className="plan-note" x="348" y="180">CONF — 4</text>
      <text className="plan-note" x="348" y="320">CONF — 2</text>
      <text className="plan-note" x="46" y="186">ENTRY</text>
      <path className="draw d5 dim" d="M245 258 L222 288" pathLength="1" />
      <text className="plan-note is-accent" x="250" y="262">YOUR DESK</text>
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero container" id="space">
      <div className="hero-copy">
        <p className="eyebrow">Coworking — Global City, Vasai-Virar</p>
        <h1 className="hero-title">
          The cubicle,
          <br />
          <span className="hero-accent">reimagined.</span>
        </h1>
        <p className="hero-sub">
          The Inside Cubicles is a coworking studio built for deep work — fast fibre, good coffee,
          and a desk that's yours from the minute you sit down.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#contact">
            Get a free day pass
          </a>
          <a className="btn btn-ghost" href="#plans">
            See the plans
          </a>
        </div>
      </div>
      <div className="hero-figure">
        <PlanSketch />
      </div>
      <p className="hero-strip">
        <span>The Studio</span>
        <span>12 desks · 5 rooms</span>
        <span>100 Mbps fibre</span>
        <span>Day 8:00–20:00 · Night 20:00–8:00</span>
      </p>
    </section>
  )
}
