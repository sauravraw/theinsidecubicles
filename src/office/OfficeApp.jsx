import { useEffect, useState } from 'react'
import DocPreview, { computeTotals, fmt } from './DocPreview.jsx'
import './office.css'

const today = new Date()
const dd = String(today.getDate()).padStart(2, '0')
const mm = String(today.getMonth() + 1).padStart(2, '0')
const todayISO = `${today.getFullYear()}-${mm}-${dd}`

const DRAFTS_KEY = 'tic-office-drafts'

// Plan catalogue — picking one fills description, price, and duration (all editable after).
export const CATALOG = [
  { label: 'Two hours — day shift', price: 100, duration: 'one sitting' },
  { label: 'Day pass', price: 350, duration: 'per day' },
  { label: 'Weekly desk — day shift', price: 1400, duration: 'Mon–Fri' },
  { label: 'Monthly desk — day shift', price: 4000, duration: '30 days' },
  { label: 'Team of 2 — day shift', price: 7500, duration: '30 days' },
  { label: 'Team of 4 — day shift', price: 14000, duration: '30 days' },
  { label: 'Two hours — night shift', price: 150, duration: 'one sitting' },
  { label: 'Night pass', price: 500, duration: 'per night' },
  { label: 'Weekly desk — night shift', price: 2000, duration: 'Mon–Fri' },
  { label: 'Monthly desk — night shift', price: 6000, duration: '30 days' },
  { label: 'Team of 2 — night shift', price: 11000, duration: '30 days' },
  { label: 'Team of 4 — night shift', price: 22000, duration: '30 days' },
  { label: 'Conference room C-01 (4 seats)', price: 0, duration: 'per hour' },
  { label: 'Conference room C-02 (2 seats)', price: 0, duration: 'per hour' },
  { label: 'Meeting room M-01', price: 0, duration: 'per hour' },
]

const CUSTOM = '__custom'

function blankItem() {
  const first = CATALOG[3] // Monthly desk — day shift
  return { desc: first.label, qty: 1, unitPrice: first.price, periods: 1, duration: first.duration }
}

function initialState(docType = 'invoice') {
  return {
    docType,
    docNo: `${docType === 'agreement' ? 'TICSA' : 'TICI'}-${dd}${mm}A1`,
    date: todayISO,
    startDate: todayISO,
    endDate: '',
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
    nextBilling: '',
    deposit: 'No deposit',
    notice: '30 days written notice',
    initialTerm: '12 months',
    paymentMethods: 'Bank Transfer (NEFT/RTGS/IMPS), UPI',
    bank: 'Bank details to be updated',
    lateFee: '2% per week on outstanding amount after due date',
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
  const prefix = docType === 'agreement' ? 'TICSA' : 'TICI'
  const m = /^TIC(?:SA|I)-(\d{4})A(\d+)$/.exec(lastDocNo || '')
  if (m && m[1] === `${dd}${mm}`) return `${prefix}-${dd}${mm}A${Number(m[2]) + 1}`
  return `${prefix}-${dd}${mm}A1`
}

export default function OfficeApp() {
  const [state, setState] = useState(() => initialState())
  const [drafts, setDrafts] = useState(loadDrafts)
  const [previewOpen, setPreviewOpen] = useState(() => window.location.hash === '#preview')
  const [confirmed, setConfirmed] = useState(false)
  const [sheetStatus, setSheetStatus] = useState('')

  // Suggest the next number from the Google Sheet log (when configured).
  useEffect(() => {
    fetch('/api/invoice-log')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok && data.lastDocNo !== undefined) {
          setState((s) => ({ ...s, docNo: nextDocNo(data.lastDocNo, s.docType) }))
          setSheetStatus(`Sheet connected — ${data.count} documents logged so far`)
        } else {
          setSheetStatus('Sheet logging not set up yet — numbers are manual')
        }
      })
      .catch(() => setSheetStatus('Sheet logging unavailable — numbers are manual'))
  }, [])

  const logToSheet = () => {
    const totals = computeTotals(state)
    fetch('/api/invoice-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docNo: state.docNo,
        docType: state.docType,
        entity: state.entity,
        contact: state.contact,
        phone: state.phone,
        email: state.email,
        total: Math.round(totals.total * 100) / 100,
        gstMode: state.gstMode,
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }).catch(() => {})
  }

  const downloadPdf = () => {
    logToSheet()
    window.print()
  }

  const openPreview = () => {
    setConfirmed(false)
    setPreviewOpen(true)
  }

  useEffect(() => {
    document.title = 'Office — The Inside Cubicles'
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
      items: s.items.map((it, idx) => (idx === i ? { ...it, [key]: e.target.value } : it)),
    }))
  const addItem = () => setState((s) => ({ ...s, items: [...s.items, blankItem()] }))
  const removeItem = (i) => setState((s) => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }))

  const pickPlan = (i) => (e) => {
    const value = e.target.value
    setState((s) => ({
      ...s,
      items: s.items.map((it, idx) => {
        if (idx !== i) return it
        if (value === CUSTOM) return { ...it, desc: '' }
        const plan = CATALOG.find((p) => p.label === value)
        return { ...it, desc: plan.label, unitPrice: plan.price, duration: plan.duration }
      }),
    }))
  }

  const setDocType = (docType) =>
    setState((s) => ({
      ...s,
      docType,
      docNo: s.docNo.replace(/^TIC(SA|I)/, docType === 'agreement' ? 'TICSA' : 'TICI'),
    }))

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

  return (
    <div className="office">
      <header className="office-top">
        <span className="office-brand">The Inside Cubicles — Office</span>
        <span className="office-hint">
          Fill the form, then open the preview to check every detail and download the PDF.
          {sheetStatus ? ` · ${sheetStatus}` : ''}
        </span>
        <button className="office-btn primary" type="button" onClick={openPreview}>
          Preview
        </button>
      </header>

      <div className="office-body">
        <form className="office-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Document</legend>
            <label>
              Type
              <select value={state.docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="invoice">Invoice</option>
                <option value="agreement">Service Agreement + Invoice</option>
              </select>
            </label>
            <label>
              Number
              <input value={state.docNo} onChange={upd('docNo')} />
            </label>
            <label>
              Date
              <input type="date" value={state.date} onChange={upd('date')} />
            </label>
            <label>
              Start date
              <input type="date" value={state.startDate} onChange={upd('startDate')} />
            </label>
            <label>
              End date
              <input type="date" value={state.endDate} onChange={upd('endDate')} />
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
              <input value={state.phone} onChange={upd('phone')} />
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

          <fieldset>
            <legend>Line items</legend>
            {state.items.map((it, i) => {
              const isCustom = !CATALOG.some((p) => p.label === it.desc)
              return (
                <div className="office-item" key={i}>
                  <label className="if-plan">
                    Plan
                    <select value={isCustom ? CUSTOM : it.desc} onChange={pickPlan(i)}>
                      {CATALOG.map((p) => (
                        <option key={p.label} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                      <option value={CUSTOM}>Custom / other…</option>
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
            <label>
              GST
              <select value={state.gstMode} onChange={upd('gstMode')}>
                <option value="none">No GST (registration in process)</option>
                <option value="intra">SGST 9% + CGST 9% (Maharashtra)</option>
                <option value="inter">IGST 18% (other states)</option>
              </select>
            </label>
            <label>
              Our GSTIN
              <input value={state.ourGstin} onChange={upd('ourGstin')} placeholder="Fill once registered" />
            </label>
            <p className="office-total">Total: ₹ {fmt(totals.total)}</p>
          </fieldset>

          <fieldset>
            <legend>Billing terms</legend>
            <label>
              Next billing cycle
              <input value={state.nextBilling} onChange={upd('nextBilling')} />
            </label>
            <label>
              Security deposit
              <input value={state.deposit} onChange={upd('deposit')} />
            </label>
            <label>
              Notice period
              <input value={state.notice} onChange={upd('notice')} />
            </label>
            {state.docType === 'agreement' && (
              <>
                <label>
                  Initial term
                  <input value={state.initialTerm} onChange={upd('initialTerm')} />
                </label>
                <label>
                  Late payment fee
                  <input value={state.lateFee} onChange={upd('lateFee')} />
                </label>
              </>
            )}
            <label>
              Payment methods
              <input value={state.paymentMethods} onChange={upd('paymentMethods')} />
            </label>
            <label className="wide">
              Bank details
              <textarea rows="3" value={state.bank} onChange={upd('bank')} />
            </label>
            <label>
              Our signatory
              <input value={state.ourSignatory} onChange={upd('ourSignatory')} placeholder="Name" />
            </label>
          </fieldset>

          <fieldset>
            <legend>Drafts (saved in this browser)</legend>
            <div className="office-actions">
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
              <span>Preview — {state.docNo}</span>
              <button className="office-btn" type="button" onClick={() => setPreviewOpen(false)}>
                × Close
              </button>
            </div>
            <div className="office-drawer-body">
              <DocPreview state={state} />
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
              <button
                className="office-btn primary"
                type="button"
                disabled={!confirmed}
                onClick={downloadPdf}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
