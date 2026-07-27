export const NAV_LINKS = [
  { label: 'Space', href: '#space' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Seats', href: '#seats' },
  { label: 'Plans', href: '#plans' },
  { label: 'Contact', href: '#contact' },
]

export const OFFER = {
  totalSpots: 20,
  spotsTaken: 7,
}

export const AMENITIES = [
  {
    symbol: 'fibre',
    title: 'Fibre internet',
    note: 'Two internet lines: 100 Mbps main + 50 Mbps backup. If one fails, the other keeps you online.',
  },
  {
    symbol: 'coffee',
    title: 'Coffee & chai, unlimited',
    note: 'The machine never sleeps, and neither does the kettle.',
  },
  {
    symbol: 'meeting',
    title: 'Meeting rooms',
    note: 'Two conference rooms, plus a private meeting room for 2–4 when the talk needs a door.',
  },
  {
    symbol: 'power',
    title: 'Power backup',
    note: 'UPS plus generator — your call does not drop when the grid does.',
  },
  {
    symbol: 'chair',
    title: 'Ergonomic setup',
    note: 'Proper task chairs and desks at the right height.',
  },
  {
    symbol: 'secure',
    title: 'Secure access',
    note: 'CCTV, and lockers that actually lock.',
  },
  {
    symbol: 'print',
    title: 'Print & scan',
    note: 'A4 and A3 laser printing and scanning, charged at cost.',
  },
  {
    symbol: 'community',
    title: 'Community',
    note: 'Fifty-odd regulars, monthly demo nights, zero forced fun.',
  },
]

// The studio runs in two shifts. Prices below are per shift — night runs on a
// premium (security + AC through the night). Fields can be a plain value
// (same for both shifts) or { day, night } to differ per shift.
export const SHIFTS = {
  day: {
    label: 'Day shift',
    time: '8:00 – 20:00',
    blurb:
      'The studio in daylight — front desk staffed, pantry in full service, meeting rooms bookable all shift.',
  },
  night: {
    label: 'Night shift',
    time: '20:00 – 8:00',
    blurb:
      'For night owls and US-timezone teams — on-site security, coffee till sunrise.',
  },
}

// `price` is the FINAL round figure a member pays, inclusive of 18% GST.
// The pricing card derives the base price from it (price ÷ 1.18), so the
// card reads e.g. "₹3,390 / 30 days · + 18% GST = ₹4,000".
export const PLANS = [
  {
    id: 'two-hours',
    name: 'Two Hours',
    price: { day: 100, night: 150 },
    per: 'one sitting',
    tagline: 'A trial sitting — see if the chair fits.',
    features: ['Any open desk', 'Fibre Wi-Fi', 'Coffee & chai included'],
  },
  {
    id: 'day-pass',
    name: { day: 'Day Pass', night: 'Night Pass' },
    price: { day: 350, night: 500 },
    per: { day: 'per day', night: 'per night' },
    tagline: { day: 'A full day, 8am to 8pm.', night: 'Dusk till dawn, 8pm to 8am.' },
    features: ['Any open desk', 'Fibre Wi-Fi', 'Coffee & chai included', 'Lounge access'],
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: { day: 1400, night: 2000 },
    per: 'Mon–Fri',
    tagline: {
      day: 'Five working days on the open floor.',
      night: 'Five nights on the open floor.',
    },
    features: ['Any open desk', 'Fibre Wi-Fi', 'Coffee & chai included', 'Phone booth access'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: { day: 4000, night: 6000 },
    per: '30 days',
    tagline: { day: 'Your own desk, your own drawer.', night: 'Your own desk, after dark.' },
    popular: true,
    features: [
      'Dedicated desk + locker',
      'Wired fibre port',
      '2 meeting-room hours',
      'Coffee & chai included',
    ],
  },
  {
    id: 'team-2',
    name: 'Team of 2',
    price: { day: 7500, night: 11000 },
    per: '30 days',
    tagline: 'Two dedicated desks, side by side.',
    features: [
      '2 dedicated desks + lockers',
      '4 meeting-room hours',
      'Wired fibre ports',
      'Coffee & chai included',
    ],
  },
  {
    id: 'team-4',
    name: 'Team of 4',
    price: { day: 14000, night: 22000 },
    per: '30 days',
    tagline: 'A corner of the studio that is yours.',
    features: [
      '4 dedicated desks + lockers',
      '8 meeting-room hours',
      'Storage shelf',
      'Coffee & chai included',
    ],
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'I came for the fibre and stayed for the chai. Three client projects shipped from desk D-04 and counting.',
    name: 'Ananya Rao',
    role: 'Freelance product designer',
    desk: 'DESK D-04',
  },
  {
    quote:
      'Quietest open floor I have worked on this side of Mumbai. People actually use the phone booths instead of pacing the corridor.',
    name: 'Kabir Mehta',
    role: 'Backend engineer, remote',
    desk: 'DESK A-05',
  },
  {
    quote:
      'We moved our four-person startup here and stopped arguing about whose turn it is to buy coffee. Worth it for that alone.',
    name: 'Farhan Ali',
    role: 'Founder, logistics startup',
    desk: 'DESKS D-03 TO D-06',
  },
]

// Floor plan inventory. Status: 'open' | 'taken' | 'reserved'
const openStudioStatus = ['open', 'open', 'open', 'open', 'open', 'open']

const dedicatedStatus = ['open', 'open', 'open', 'open', 'open', 'open']

export const DESKS = [
  ...openStudioStatus.map((status, i) => ({
    id: `A-${String(i + 1).padStart(2, '0')}`,
    zone: 'Open studio',
    plan: 'Day, weekly & monthly passes',
    status,
  })),
  ...dedicatedStatus.map((status, i) => ({
    id: `D-${String(i + 1).padStart(2, '0')}`,
    zone: 'Dedicated row',
    plan: 'Monthly & team plans',
    status,
  })),
]

export const ROOMS = [
  { id: 'C-01', zone: 'Conference room', plan: '4 seats · bookable by the hour', status: 'open' },
  { id: 'C-02', zone: 'Conference room', plan: '2 seats · bookable by the hour', status: 'open' },
  {
    id: 'M-01',
    zone: 'Meeting room',
    plan: 'Seats 2–4 · for meetings that need privacy',
    status: 'open',
  },
  { id: 'B-01', zone: 'Phone booth', plan: 'Free for members', status: 'open' },
  { id: 'B-02', zone: 'Phone booth', plan: 'Free for members', status: 'open' },
]

export const CONTACT = {
  address: [
    'F44, First Floor, Cosmos Square',
    'Rustomjee Global City, HDIL',
    'Vasai-Virar, Maharashtra 401303',
  ],
  phone: '+91 79774 48516',
  whatsapp: 'https://wa.me/917977448516',
  email: 'theinsidecubicles@gmail.com',
  coords: '19.4682917,72.8045583',
  enquiryForm: 'https://forms.gle/4LL7u88AMhHYaeX1A',
  nearby: ['Pizza Hut', "McDonald's", 'cafés & street food'],
  hours: [
    { days: 'Day shift', time: '8:00 – 20:00 · all week' },
    { days: 'Night shift', time: '20:00 – 8:00 · Mon – Sat' },
  ],
}
