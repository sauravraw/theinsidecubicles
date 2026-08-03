// Vercel serverless function — bridges the /invoice and /quotation tools and the Google Sheet.
// Keeps the Apps Script URL and shared secret server-side (never in the bundle).
// Env vars (Vercel dashboard): SHEETS_WEBAPP_URL, SHEETS_SECRET.
//
// POST → appends a row to the sheet (called after "Download PDF")
// GET  → returns { lastDocNo, count } so the form can suggest the next number

export default async function handler(req, res) {
  const url = process.env.SHEETS_WEBAPP_URL
  const secret = process.env.SHEETS_SECRET
  if (!url || !secret) {
    return res.status(503).json({ ok: false, error: 'Sheet logging not configured yet' })
  }

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {}
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, secret }),
        redirect: 'follow',
      })
      return res.status(200).send(await r.text())
    }

    const type = req.query && req.query.type === 'quotation' ? 'quotation' : 'invoice'
    const r = await fetch(`${url}?secret=${encodeURIComponent(secret)}&type=${type}`, {
      redirect: 'follow',
    })
    return res.status(200).send(await r.text())
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err) })
  }
}
