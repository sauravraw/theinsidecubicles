import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import DocPreview, { computeTotals, fmt } from './DocPreview.jsx'
import './office.css'

const today = new Date()
const dd = String(today.getDate()).padStart(2, '0')
const mm = String(today.getMonth() + 1).padStart(2, '0')
const todayISO = `${today.getFullYear()}-${mm}-${dd}`

// ---- date helpers: start date → end date → periods stay linked ----
const isoFrom = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`

// '2026-08-10' + 1 month → '2026-09-09' (full months, inclusive of the start day)
export function addMonthsInclusive(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1 + n, d)
  dt.setDate(dt.getDate() - 1)
  return isoFrom(dt)
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return isoFrom(new Date(y, m - 1, d + n))
}

// whole months covered by start..end (inclusive), nearest, never below 1
export function monthsBetween(startIso, endIso) {
  const [sy, sm, sd] = startIso.split('-').map(Number)
  const [ey, em, ed] = endIso.split('-').map(Number)
  const days = (new Date(ey, em - 1, ed + 1) - new Date(sy, sm - 1, sd)) / 86400000
  return Math.max(1, Math.round(days / 30.44))
}

const DRAFTS_KEY = 'tic-office-drafts'

// Plan catalogue — picking one fills description, price, and duration (all editable
// after). Conference prices: ₹6,000/person (day) · ₹7,000/person (night), per 30 days,
// already inclusive of 18% GST.
export const CATALOG_GROUPS = [
  {
    group: 'Day shift',
    items: [
      { label: 'Two hours — day shift', price: 100, duration: 'one sitting' },
      { label: 'Day pass', price: 350, duration: 'per day' },
      { label: 'Weekly desk — day shift', price: 1400, duration: 'per week' },
      { label: 'Monthly desk — day shift', price: 4000, duration: '30 days' },
      { label: 'Conference room — 1 person (day)', price: 6000, duration: '30 days' },
      { label: 'Conference room — 2 people (day)', price: 12000, duration: '30 days' },
      { label: 'Conference room — 3 people (day)', price: 18000, duration: '30 days' },
      { label: 'Conference room — 4 people (day)', price: 24000, duration: '30 days' },
    ],
  },
  {
    group: 'Night shift',
    items: [
      { label: 'Two hours — night shift', price: 150, duration: 'one sitting' },
      { label: 'Night pass', price: 500, duration: 'per night' },
      { label: 'Weekly desk — night shift', price: 2000, duration: 'per week' },
      { label: 'Monthly desk — night shift', price: 6000, duration: '30 days' },
      { label: 'Conference room — 1 person (night)', price: 7000, duration: '30 days' },
      { label: 'Conference room — 2 people (night)', price: 14000, duration: '30 days' },
      { label: 'Conference room — 3 people (night)', price: 21000, duration: '30 days' },
      { label: 'Conference room — 4 people (night)', price: 28000, duration: '30 days' },
    ],
  },
]

export const CATALOG = CATALOG_GROUPS.flatMap((g) => g.items)

const CUSTOM = '__custom'

// '30 days' + 3 periods -> '90 days'; 'per week' + 2 -> '2 weeks', etc.
function durationLabel(baseDuration, periods) {
  const n = Number(periods) || 1
  if (n <= 1) return baseDuration
  if (baseDuration === '30 days') return `${n * 30} days`
  if (baseDuration === 'per week') return `${n} weeks`
  if (baseDuration === 'per day') return `${n} days`
  if (baseDuration === 'per night') return `${n} nights`
  if (baseDuration === 'one sitting') return `${n} sittings`
  return baseDuration
}

function blankItem() {
  const first = CATALOG.find((p) => p.label === 'Monthly desk — day shift')
  return { desc: first.label, qty: 1, unitPrice: first.price, periods: 1, duration: first.duration }
}

const DOC_PREFIX = { invoice: 'TICI', agreement: 'TICSA', service: 'TICS', quotation: 'TICQ' }

// Re-sync 30-day (monthly-type) items' periods to the start..end month span.
// Hourly / daily / weekly items and custom rows are left for manual entry.
function syncMonthlyPeriods(items, n) {
  return items.map((it) => {
    const plan = CATALOG.find((p) => p.label === it.desc)
    if (!plan || plan.duration !== '30 days') return it
    return { ...it, periods: n, duration: durationLabel(plan.duration, n) }
  })
}

function initialState(docType = 'invoice') {
  return {
    docType,
    docNo: `${DOC_PREFIX[docType]}-${dd}${mm}A1`,
    date: todayISO,
    startDate: todayISO,
    // quotations default to a 15-day validity; everything else to a 1-month term
    endDate: docType === 'quotation' ? addDays(todayISO, 15) : addMonthsInclusive(todayISO, 1),
    ourGstin: '',
    ourSignatory: '',
    entity: '',
    contact: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    items: [blankItem()],
    discountPct: 0,
    gstMode: 'none',
    invoiceKind: 'commercial',
    sac: '997212',
    nextBilling: docType === 'quotation' ? '' : addDays(addMonthsInclusive(todayISO, 1), 1),
    deposit: 'No deposit',
    notice: '30 days written notice',
    initialTerm: '12 months',
    paymentMethods: 'Bank Transfer (NEFT/RTGS/IMPS), UPI',
    bank: 'Utkarsh Singh\nBank Name: HDFC Bank LTD\nBranch: Dahisar West - Kanderpada\nAccount Number: 50100163773282\nIFSC: HDFC0001230',
    lateFee: '2% per month (24% p.a.) on the outstanding amount, after a 5-day grace period from the due date',
  }
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}
  } catch {
    return {}
  }
}

// 'TICI-2807A3' → 'TICI-2807A4' when the last number is from today; else A1 for today.
function nextDocNo(lastDocNo, docType) {
  const prefix = DOC_PREFIX[docType]
  const m = /^TIC(?:SA|S|Q|I)-(\d{4})A(\d+)$/.exec(lastDocNo || '')
  if (m && m[1] === `${dd}${mm}`) return `${prefix}-${dd}${mm}A${Number(m[2]) + 1}`
  return `${prefix}-${dd}${mm}A1`
}

function loadWork(key, fallbackType) {
  try {
    const w = JSON.parse(localStorage.getItem(key))
    return w && w.docType ? { ...initialState(fallbackType), ...w } : null
  } catch {
    return null
  }
}

export default function OfficeApp({ mode = 'invoice' }) {
  const baseType = mode === 'quotation' ? 'quotation' : 'invoice'
  const WORK_KEY =
    mode === 'quotation' ? 'tic-work-quotation' : mode === 'agreement' ? 'tic-work-agreement' : 'tic-work-invoice'
  const [state, setState] = useState(() => loadWork(WORK_KEY, baseType) || initialState(baseType))
  const restoredWork = !!localStorage.getItem(WORK_KEY)

  // auto-save the work in progress — a refresh restores everything
  useEffect(() => {
    try {
      localStorage.setItem(WORK_KEY, JSON.stringify(state))
    } catch {
      /* storage full/blocked — drafts still work */
    }
  }, [state, WORK_KEY])
  const [drafts, setDrafts] = useState(loadDrafts)
  const [previewOpen, setPreviewOpen] = useState(() => window.location.hash === '#preview')
  const [confirmed, setConfirmed] = useState(false)
  const [sheetStatus, setSheetStatus] = useState('')

  // Suggest the next number from the Google Sheet log (when configured).
  // Each page reads its own tab: Invoices or Quotations.
  useEffect(() => {
    fetch(`/api/invoice-log?type=${mode === 'quotation' ? 'quotation' : 'invoice'}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok && data.lastDocNo !== undefined) {
          if (!restoredWork) setState((s) => ({ ...s, docNo: nextDocNo(data.lastDocNo, s.docType) }))
          setSheetStatus(`Sheet connected — ${data.count} documents logged so far`)
        } else {
          setSheetStatus('Sheet logging not set up yet — numbers are manual')
        }
      })
      .catch(() => setSheetStatus('Sheet logging unavailable — numbers are manual'))
  }, [])

  const logToSheet = (doc) => {
    const totals = computeTotals(doc)
    fetch('/api/invoice-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docNo: doc.docNo,
        docType: doc.docType,
        entity: doc.entity,
        contact: doc.contact,
        phone: doc.phone,
        email: doc.email,
        total: Math.round(totals.total * 100) / 100,
        gstMode: doc.gstMode,
        startDate: doc.startDate,
        endDate: doc.endDate,
      }),
    }).catch(() => {})
  }

  // On /agreement one form produces two PDFs: the plain invoice (TICI number)
  // and the combined agreement + invoice (same serial, TICSA prefix).
  const [printDoc, setPrintDoc] = useState('invoice')
  const docFor = (kind) =>
    mode === 'agreement' && kind === 'agreement'
      ? { ...state, docType: 'agreement', docNo: state.docNo.replace(/^TICI/, 'TICSA') }
      : state

  const downloadPdf = (kind) => {
    const doc = docFor(kind)
    flushSync(() => setPrintDoc(kind)) // the printed DOM must match the chosen document
    logToSheet(doc)
    window.print()
  }

  const openPreview = () => {
    setConfirmed(false)
    setPreviewOpen(true)
  }

  useEffect(() => {
    document.title =
      mode === 'quotation'
        ? 'Quotation — The Inside Cubicles'
        : mode === 'agreement'
          ? 'Agreement — The Inside Cubicles'
          : 'Office — The Inside Cubicles'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.body.classList.add('office-mode')
    return () => {
      document.head.removeChild(meta)
      document.body.classList.remove('office-mode')
    }
  }, [])

  const upd = (key) => (e) => setState((s) => ({ ...s, [key]: e.target.value }))
  const updItem = (i, key) => (e) =>
    setState((s) => ({
      ...s,
      items: s.items.map((it, idx) => {
        if (idx !== i) return it
        const next = { ...it, [key]: e.target.value }
        if (key === 'periods') {
          const plan = CATALOG.find((p) => p.label === it.desc)
          if (plan) next.duration = durationLabel(plan.duration, e.target.value)
        }
        return next
      }),
    }))
  // Add item copies the previous row, so periods/prices carry over instead of resetting
  const addItem = () =>
    setState((s) => ({
      ...s,
      items: [...s.items, s.items.length ? { ...s.items[s.items.length - 1] } : blankItem()],
    }))
  const removeItem = (i) => setState((s) => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }))

  const pickPlan = (i) => (e) => {
    const value = e.target.value
    setState((s) => ({
      ...s,
      items: s.items.map((it, idx) => {
        if (idx !== i) return it
        if (value === CUSTOM) return { ...it, desc: '' }
        const plan = CATALOG.find((p) => p.label === value)
        return { ...it, desc: plan.label, unitPrice: plan.price, duration: durationLabel(plan.duration, it.periods) }
      }),
    }))
  }

  const setDocType = (docType) =>
    setState((s) => ({
      ...s,
      docType,
      docNo: s.docNo.replace(/^TIC(SA|S|Q|I)/, DOC_PREFIX[docType]),
    }))

  // Commercial invoice never charges GST; switching to Tax turns the breakup on.
  const setInvoiceKind = (kind) =>
    setState((s) => ({
      ...s,
      invoiceKind: kind,
      gstMode: kind === 'commercial' ? 'none' : s.gstMode === 'none' ? 'intra' : s.gstMode,
    }))

  // phone: digits only, max 10 — a plain field, no number spinners
  const updPhone = (e) =>
    setState((s) => ({ ...s, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))

  // Date rules: start date >= document date, end date >= start date.
  const updDate = (e) => {
    const v = e.target.value
    setState((s) => {
      const startDate = s.startDate && v && s.startDate < v ? v : s.startDate
      const endDate = s.endDate && startDate && s.endDate < startDate ? '' : s.endDate
      return { ...s, date: v, startDate, endDate }
    })
  }

  const updStartDate = (e) => {
    let v = e.target.value
    setState((s) => {
      if (v && s.date && v < s.date) v = s.date
      if (!v) {
        return { ...s, startDate: v }
      }
      if (s.docType === 'quotation') {
        // valid-until stays an offer deadline: default it, never stomp a manual value
        const endDate = s.endDate || addDays(s.date || v, 15)
        return { ...s, startDate: v, endDate }
      }
      // picking a start date defaults the term to one full month
      const endDate = addMonthsInclusive(v, 1)
      return {
        ...s,
        startDate: v,
        endDate,
        nextBilling: addDays(endDate, 1),
        items: syncMonthlyPeriods(s.items, 1),
      }
    })
  }

  // clicking anywhere on a date field opens the calendar, not just the icon
  const openPicker = (e) => {
    try {
      e.target.showPicker?.()
    } catch {
      /* needs a user gesture; ignore */
    }
  }

  // picking the end date auto-fills the next billing cycle (day after expiry)
  // and re-syncs monthly items' periods to the new span
  const updEndDate = (e) => {
    let iso = e.target.value
    setState((s) => {
      if (iso && s.startDate && iso < s.startDate) iso = s.startDate
      if (!iso) return { ...s, endDate: iso }
      if (s.docType === 'quotation') return { ...s, endDate: iso }
      return {
        ...s,
        endDate: iso,
        nextBilling: addDays(iso, 1),
        items: s.startDate ? syncMonthlyPeriods(s.items, monthsBetween(s.startDate, iso)) : s.items,
      }
    })
  }

  const saveDraft = () => {
    const next = { ...drafts, [state.docNo]: state }
    setDrafts(next)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next))
  }

  const loadDraft = (no) => {
    if (drafts[no]) setState(drafts[no])
  }

  const deleteDraft = (no) => {
    const next = { ...drafts }
    delete next[no]
    setDrafts(next)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next))
  }

  const totals = computeTotals(state)
  // Older saved drafts have no invoiceKind — infer it from the GST mode.
  const invoiceKind = state.invoiceKind ?? (state.gstMode === 'none' ? 'commercial' : 'tax')
  const isCommercialInvoice = state.docType === 'invoice' && invoiceKind === 'commercial'

  return (
    <div className="office">
      <header className="office-top">
        <span className="office-brand">
          The Inside Cubicles — {mode === 'quotation' ? 'Quotation' : mode === 'agreement' ? 'Agreement' : 'Office'}
        </span>
        <span className="office-hint">
          Fill the form, then open the preview to check every detail and download the PDF.
          {sheetStatus ? ` · ${sheetStatus}` : ''}
        </span>
        <a className="office-btn office-logout" href="/office-logout">
          Logout
        </a>
      </header>

      <div className="office-body">
        <form className="office-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Document</legend>
            {mode === 'invoice' && (
              <label>
                Type
                <select value={state.docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="invoice">Invoice</option>
                  <option value="agreement">Service Agreement + Invoice</option>
                  <option value="service">Service Agreement only</option>
                </select>
              </label>
            )}
            {mode !== 'quotation' && state.docType === 'invoice' && (
              <label>
                Invoice type
                <select value={invoiceKind} onChange={(e) => setInvoiceKind(e.target.value)}>
                  <option value="commercial">Commercial Invoice (no GST)</option>
                  <option value="tax">Tax Invoice (with GST)</option>
                </select>
              </label>
            )}
            <label>
              Number
              <input value={state.docNo} onChange={upd('docNo')} />
            </label>
            <label>
              Date
              <input type="date" value={state.date} onChange={updDate} onClick={openPicker} />
            </label>
            <label>
              Start date
              <input type="date" value={state.startDate} onChange={updStartDate} onClick={openPicker} />
            </label>
            <label>
              {state.docType === 'quotation' ? 'Valid until' : 'End date'}
              <input type="date" value={state.endDate} onChange={updEndDate} onClick={openPicker} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Customer</legend>
            <label>
              Entity / name
              <input value={state.entity} onChange={upd('entity')} placeholder="Company or person" />
            </label>
            <label>
              Point of contact
              <input value={state.contact} onChange={upd('contact')} />
            </label>
            <label>
              Email
              <input value={state.email} onChange={upd('email')} />
            </label>
            <label>
              Phone
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={state.phone}
                onChange={updPhone}
                placeholder="10-digit mobile"
              />
            </label>
            <label>
              Customer GSTIN
              <input value={state.gstin} onChange={upd('gstin')} placeholder="Optional" />
            </label>
            <label className="wide">
              Billing address
              <textarea rows="3" value={state.address} onChange={upd('address')} />
            </label>
          </fieldset>

          {state.docType !== 'service' && (<>
          <fieldset>
            <legend>Line items</legend>
            {state.items.map((it, i) => {
              const isCustom = !CATALOG.some((p) => p.label === it.desc)
              return (
                <div className="office-item" key={i}>
                  <label className="if-plan">
                    Plan
                    <select value={isCustom ? CUSTOM : it.desc} onChange={pickPlan(i)}>
                      {CATALOG_GROUPS.map((g) => (
                        <optgroup key={g.group} label={g.group}>
                          {g.items.map((p) => (
                            <option key={p.label} value={p.label}>
                              {p.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Other">
                        <option value={CUSTOM}>Custom / other…</option>
                      </optgroup>
                    </select>
                  </label>
                  {isCustom && (
                    <label className="if-plan">
                      Description
                      <input
                        value={it.desc}
                        onChange={updItem(i, 'desc')}
                        placeholder="Type the description"
                      />
                    </label>
                  )}
                  <label className="if-sm">
                    Qty
                    <input type="number" min="0" value={it.qty} onChange={updItem(i, 'qty')} />
                  </label>
                  <label className="if-sm">
                    Unit ₹
                    <input type="number" min="0" value={it.unitPrice} onChange={updItem(i, 'unitPrice')} />
                  </label>
                  <label className="if-sm" title="How many periods to bill — e.g. 3 for three months">
                    Periods
                    <input type="number" min="1" value={it.periods} onChange={updItem(i, 'periods')} />
                  </label>
                  <label className="if-md">
                    Duration
                    <input value={it.duration} onChange={updItem(i, 'duration')} />
                  </label>
                  <button type="button" className="office-btn if-remove" onClick={() => removeItem(i)} title="Remove item">
                    ×
                  </button>
                </div>
              )
            })}
            <button type="button" className="office-btn" onClick={addItem}>
              + Add item
            </button>
          </fieldset>

          <fieldset>
            <legend>Totals</legend>
            <label>
              Discount %
              <input type="number" min="0" max="100" value={state.discountPct} onChange={upd('discountPct')} />
            </label>
            {!isCommercialInvoice && (
              <label>
                GST
                <select value={state.gstMode} onChange={upd('gstMode')}>
                  {state.docType !== 'invoice' && (
                    <option value="none">No GST lines (registration in process)</option>
                  )}
                  <option value="intra">Show SGST + CGST breakup (Maharashtra)</option>
                  <option value="inter">Show IGST breakup (other states)</option>
                </select>
              </label>
            )}
            <label>
              Our GSTIN
              <input value={state.ourGstin} onChange={upd('ourGstin')} placeholder="Fill once registered" />
            </label>
            {!isCommercialInvoice && (
              <label>
                SAC code
                <input value={state.sac} onChange={upd('sac')} placeholder="997212 for coworking rental" />
              </label>
            )}
            <p className="office-total">Total: ₹ {fmt(totals.total)}</p>
          </fieldset>
          </>)}

          <fieldset>
            <legend>{state.docType === 'quotation' ? 'Signatory' : 'Billing terms'}</legend>
            {state.docType !== 'quotation' && (<>
            <label>
              Next billing cycle
              <input
                type="date"
                value={state.nextBilling}
                onChange={upd('nextBilling')}
                onClick={openPicker}
              />
            </label>
            <label>
              Security deposit
              <input value={state.deposit} onChange={upd('deposit')} />
            </label>
            <label>
              Notice period
              <input value={state.notice} onChange={upd('notice')} />
            </label>
            {(state.docType === 'agreement' || state.docType === 'service' || mode === 'agreement') && (
              <label>
                Initial term (agreement length)
                <input value={state.initialTerm} onChange={upd('initialTerm')} placeholder="e.g. 11 months" />
              </label>
            )}
            <label>
              Late payment fee
              <input value={state.lateFee} onChange={upd('lateFee')} />
            </label>
            <label>
              Payment methods
              <input value={state.paymentMethods} onChange={upd('paymentMethods')} />
            </label>
            <label className="wide">
              Bank details
              <textarea rows="3" value={state.bank} onChange={upd('bank')} />
            </label>
            </>)}
            <label>
              Our signatory
              <input value={state.ourSignatory} onChange={upd('ourSignatory')} placeholder="Name" />
            </label>
          </fieldset>

          <fieldset>
            <legend>Actions &amp; drafts</legend>
            <div className="office-actions">
              <button className="office-btn primary" type="button" onClick={openPreview}>
                Preview
              </button>
              <button type="button" className="office-btn" onClick={saveDraft}>
                Save draft
              </button>
              <button type="button" className="office-btn" onClick={() => setState(initialState(state.docType))}>
                New document
              </button>
            </div>
            {Object.keys(drafts).length > 0 && (
              <ul className="office-drafts">
                {Object.entries(drafts).map(([no, d]) => (
                  <li key={no}>
                    <button type="button" className="office-link" onClick={() => loadDraft(no)}>
                      {no} — {d.entity || 'unnamed'}
                    </button>
                    <button type="button" className="office-btn" onClick={() => deleteDraft(no)} title="Delete">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        </form>

      </div>

      {previewOpen && (
        <div className="office-drawer" role="dialog" aria-modal="true" aria-label="Document preview">
          <div className="office-drawer-backdrop" onClick={() => setPreviewOpen(false)} />
          <div className="office-drawer-panel">
            <div className="office-drawer-head">
              <span>
                Preview — {mode === 'agreement'
                  ? `${state.docNo} + ${docFor('agreement').docNo}`
                  : state.docNo}
              </span>
              <button className="office-btn" type="button" onClick={() => setPreviewOpen(false)}>
                × Close
              </button>
            </div>
            <div className="office-drawer-body">
              {mode === 'agreement' ? (
                /* both documents preview stacked; printDoc picks which one prints */
                <div className={`office-doc-pair print-${printDoc}`}>
                  <div className="office-doc-slot slot-invoice">
                    <div className="office-doc-label">Document 1 of 2 — Invoice ({state.docNo})</div>
                    <DocPreview state={docFor('invoice')} />
                  </div>
                  <div className="office-doc-slot slot-agreement">
                    <div className="office-doc-label">
                      Document 2 of 2 — Agreement + Invoice ({docFor('agreement').docNo})
                    </div>
                    <DocPreview state={docFor('agreement')} />
                  </div>
                </div>
              ) : (
                <DocPreview state={state} />
              )}
            </div>
            <div className="office-drawer-foot">
              <label className="office-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I have checked every detail — customer, amounts, dates — and confirm it is correct.
              </label>
              {mode === 'agreement' ? (
                <>
                  <button
                    className="office-btn primary"
                    type="button"
                    disabled={!confirmed}
                    onClick={() => downloadPdf('invoice')}
                  >
                    Download Invoice PDF
                  </button>
                  <button
                    className="office-btn primary"
                    type="button"
                    disabled={!confirmed}
                    onClick={() => downloadPdf('agreement')}
                  >
                    Download Agreement + Invoice PDF
                  </button>
                </>
              ) : (
                <button
                  className="office-btn primary"
                  type="button"
                  disabled={!confirmed}
                  onClick={() => downloadPdf('invoice')}
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
