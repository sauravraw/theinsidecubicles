# The Inside Cubicles

Marketing site for **The Inside Cubicles**, a coworking studio. Built with Vite + React.

The visual identity treats the site as an architect's drawing set: graph-paper background,
plan-view illustrations, and mono annotations. It has two themes — **Paper** (light,
drafting sheet) and **Blueprint** (dark) — switched with the sun/moon icon button in
the nav and remembered per visitor; first-time visitors get their system preference.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Where things live

- `src/data.js` — all the content: nav links, amenities, shifts, pricing plans,
  testimonials, desk inventory for the floor plan, and contact details (`CONTACT`).

  Pricing runs in two shifts (`SHIFTS`: day 8:00–20:00, night 20:00–8:00) with a
  Day/Night switcher in the pricing section. Any plan field (`price`, `name`, `per`,
  `tagline`) can be a plain value (same for both shifts) or `{ day: …, night: … }`
  to differ per shift — night prices carry a premium (e.g. Monthly ₹3,499 → ₹5,499).
- `src/components/` — one component per page section, top to bottom:
  `Nav`, `Hero`, `Amenities`, `Offer`, `About`, `Gallery`, `FloorPlan` (the interactive
  seat-availability plan), `Pricing`, `Testimonials`, `Location`, `Footer`.
- `src/index.css` — the whole design system. Colors and fonts are CSS custom properties
  in the `:root` / `[data-theme='blueprint']` blocks at the top.

## Hidden document generators

Two hidden routes (not linked anywhere, `noindex`) generate customer PDFs with a
form and a preview drawer; "Download PDF" uses the browser print dialog (choose
"Save as PDF"), and drafts save to the browser:

- `/invoice` — Invoice, Service Agreement + Invoice, or Service Agreement only
- `/quotation` — Quotations (TICQ numbering, "valid until" date, Accepted-by block)

On Vercel both routes are protected by HTTP Basic Auth (`middleware.js`): set the
environment variables `OFFICE_USER` and `OFFICE_PASS` in the Vercel dashboard and
redeploy. Until they are set, the routes return 401 for everyone. On local dev they
are open (middleware only runs on Vercel).

GST defaults to "not charged — registration in process"; switch the GST dropdown to
SGST+CGST or IGST and fill "Our GSTIN" once registration arrives. Agreement terms
live in `src/office/terms.js` — have them reviewed by a legal professional.

Every downloaded document can auto-log to a Google Sheet via `api/invoice-log.js`
(a Vercel serverless function) + a Google Apps Script attached to the sheet. Set
`SHEETS_WEBAPP_URL` and `SHEETS_SECRET` env vars in Vercel; until then the office
tool works fine and simply shows "Sheet logging not set up yet". The sheet also
drives the suggested next invoice number.

## Updating seat availability

Desk statuses (`open` / `taken` / `reserved`) live in `src/data.js` in the
`openStudioStatus` and `dedicatedStatus` arrays — change an entry and the floor plan
updates. Rooms (conference, phone booths) are in `ROOMS`.

## Swapping in real photos

The gallery currently uses drawn plan-view vignettes. To use photographs instead,
replace the `art` SVGs in `src/components/Gallery.jsx` with `<img>` tags — the card
layout doesn't need to change.
