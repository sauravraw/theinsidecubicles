import Reveal from './Reveal.jsx'

const SPECS = [
  ['Area', '2,400 sq ft'],
  ['Desks', '12'],
  ['Phone booths', '2'],
  ['Conference rooms', '2 · 4 + 2 seats'],
  ['Meeting room', 'Private · 2–4'],
  ['Shifts', 'Day + Night'],
  ['Fibre', '100 Mbps + 50 backup'],
  ['Chai', 'Unmetered'],
]

export default function About() {
  return (
    <section className="section container about" id="about">
      <Reveal className="about-copy">
        <p className="eyebrow">About the studio</p>
        <h2 className="section-title">More than four walls</h2>
        <p>
          The cubicle got a bad name — fluorescent light, grey fabric, someone else's radio. We kept
          the part that worked, a defined space where your focus is yours, and redrew everything
          else: daylight on both sides of the floor, chairs you can sit in past lunch, and a pantry
          that takes coffee seriously.
        </p>
        <p>
          The Inside Cubicles is run by the people who sit in it. We keep the floor quiet, the calls
          in the booths, and the community optional — a monthly demo night, not a mandatory mixer.
        </p>
        <p>
          And because half the city works on someone else's timezone, the studio runs a night shift
          too: 8pm to 8am with security on site, and the coffee machine on duty. Same
          desks, different sky.
        </p>
        <a className="btn btn-ghost" href="#contact">
          Book a free tour
        </a>
      </Reveal>
      <Reveal className="about-specs" delay={120}>
        <p className="about-specs-head">Specification</p>
        <dl>
          {SPECS.map(([label, value]) => (
            <div className="about-spec" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
