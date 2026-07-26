import { useState } from 'react'
import Reveal from './Reveal.jsx'
import { DESKS, ROOMS } from '../data.js'

const DESK_W = 52
const DESK_H = 32

function deskPosition(desk) {
  const index = Number(desk.id.slice(2)) - 1
  if (desk.id.startsWith('A')) {
    return { x: 60 + index * 76, y: 110 }
  }
  return { x: 60 + index * 76, y: 370 }
}

const ROOM_RECTS = {
  'C-01': { x: 560, y: 30, w: 170, h: 120 },
  'C-02': { x: 560, y: 170, w: 170, h: 120 },
  'M-01': { x: 560, y: 310, w: 100, h: 90 },
  'B-01': { x: 380, y: 280, w: 50, h: 50 },
  'B-02': { x: 442, y: 280, w: 50, h: 50 },
}

const STATUS_LABEL = { open: 'Open', taken: 'Taken', reserved: 'Reserved' }

export default function FloorPlan() {
  const [selected, setSelected] = useState(null)
  const openCount = DESKS.filter((d) => d.status === 'open').length

  const pick = (unit) => setSelected(selected?.id === unit.id ? null : unit)

  return (
    <section className="section fp" id="seats">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Seat availability</p>
          <h2 className="section-title">Pick your spot on the plan</h2>
          <p className="section-sub">
            {openCount} desks open this week. Tap any desk to see which plans it belongs to —
            hatched ones are already spoken for.
          </p>
        </Reveal>

        <Reveal className="fp-layout" delay={100}>
          <svg
            className="fp-plan"
            viewBox="0 0 760 480"
            role="group"
            aria-label="Interactive floor plan showing desk availability"
          >
            <defs>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7">
                <path className="fp-hatch-line" d="M0 7 L7 0" />
              </pattern>
            </defs>

            {/* walls, with the entry gap on the left */}
            <path className="fp-wall" d="M30 295 L30 30 L730 30 L730 450 L30 450 L30 335" />
            <path className="fp-thin" d="M30 335 L70 335 M30 295 A40 40 0 0 1 70 335" />
            <text className="plan-note" transform="rotate(-90 20 348)" x="20" y="348">ENTRY</text>

            {/* conference room C-01: walls, table, 4 chairs */}
            <path className="fp-wall" d="M560 30 L560 150 L730 150" />
            <rect className="fp-line" x="605" y="60" width="80" height="56" rx="6" />
            {[[593, 88], [697, 88], [645, 48], [645, 128]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="fp-line" cx={cx} cy={cy} r="5" />
            ))}

            {/* conference room C-02: walls, table, 2 chairs */}
            <path className="fp-wall" d="M560 170 L730 170 M560 170 L560 290 L730 290" />
            <rect className="fp-line" x="615" y="207" width="60" height="46" rx="6" />
            {[[603, 230], [687, 230]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="fp-line" cx={cx} cy={cy} r="5" />
            ))}

            {/* private meeting room M-01: walls, table, 4 chairs */}
            <rect className="fp-wall" x="560" y="310" width="100" height="90" />
            <rect className="fp-line" x="588" y="337" width="44" height="34" rx="4" />
            {[[576, 354], [644, 354], [610, 325], [610, 383]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="fp-line" cx={cx} cy={cy} r="5" />
            ))}

            {/* pantry counter along the bottom wall */}
            <rect className="fp-line" x="620" y="418" width="100" height="24" />
            <text className="plan-note" x="620" y="410">PANTRY</text>

            {/* zone labels */}
            <text className="plan-note" x="60" y="185">OPEN STUDIO</text>
            <text className="plan-note" x="60" y="356">DEDICATED ROW</text>

            {/* desks */}
            {DESKS.map((desk) => {
              const { x, y } = deskPosition(desk)
              const isSelected = selected?.id === desk.id
              return (
                <g key={desk.id}>
                  <rect
                    className={`fp-desk is-${desk.status} ${isSelected ? 'is-selected' : ''}`}
                    x={x}
                    y={y}
                    width={DESK_W}
                    height={DESK_H}
                    tabIndex="0"
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`Desk ${desk.id}, ${desk.zone}, ${STATUS_LABEL[desk.status]}`}
                    onClick={() => pick(desk)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        pick(desk)
                      }
                    }}
                  />
                  {desk.status === 'taken' && (
                    <rect className="fp-desk-hatch" x={x} y={y} width={DESK_W} height={DESK_H} />
                  )}
                </g>
              )
            })}

            {/* bookable rooms */}
            {ROOMS.map((room) => {
              const r = ROOM_RECTS[room.id]
              const isSelected = selected?.id === room.id
              return (
                <g key={room.id}>
                  <rect
                    className={`fp-desk fp-room is-${room.status} ${isSelected ? 'is-selected' : ''}`}
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    tabIndex="0"
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`${room.zone} ${room.id}, ${STATUS_LABEL[room.status]}`}
                    onClick={() => pick(room)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        pick(room)
                      }
                    }}
                  />
                  {room.status === 'taken' && (
                    <rect className="fp-desk-hatch" x={r.x} y={r.y} width={r.w} height={r.h} />
                  )}
                  <text className="plan-note" x={r.x + 6} y={r.y + r.h - 8}>
                    {room.id}
                  </text>
                </g>
              )
            })}
          </svg>

          <aside className="fp-panel">
            {selected ? (
              <>
                <p className="fp-panel-id">{selected.id}</p>
                <p className="fp-panel-zone">{selected.zone}</p>
                <p className={`fp-panel-status is-${selected.status}`}>
                  {STATUS_LABEL[selected.status]}
                  {selected.status === 'reserved' && ' — free from next month'}
                </p>
                <p className="fp-panel-plan">{selected.plan}</p>
                {selected.status === 'open' ? (
                  <a className="btn btn-primary" href="#contact">
                    Book {selected.id}
                  </a>
                ) : (
                  <a className="btn btn-ghost" href="#contact">
                    Join the waitlist
                  </a>
                )}
              </>
            ) : (
              <>
                <p className="fp-panel-hint">Select a desk on the plan</p>
                <p className="fp-panel-plan">
                  Availability is updated every Monday. For today's picture, message us — we answer
                  fast.
                </p>
              </>
            )}
            <ul className="fp-legend">
              <li><span className="fp-key is-open" /> Open</li>
              <li><span className="fp-key is-taken" /> Taken</li>
              <li><span className="fp-key is-reserved" /> Reserved</li>
            </ul>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
