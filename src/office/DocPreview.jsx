import { TERMS } from './terms.js'

const COMPANY = {
  name: 'The Inside Cubicles',
  address: 'F44, First Floor, Cosmos Square, Rustomjee Global City, HDIL, Vasai-Virar, Maharashtra 401303',
  email: 'theinsidecubicles@gmail.com',
  phone: '+91 79774 48516',
}

export const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

// '2026-07-28' → '28/07/2026'; anything else passes through untouched
export const fmtDate = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v || '—'
}

export function computeTotals(state) {
  const subtotal = state.items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) * (Number(it.periods) || 1),
    0,
  )
  const discount = subtotal * ((Number(state.discountPct) || 0) / 100)
  const afterDiscount = subtotal - discount
  let tax = 0
  if (state.gstMode === 'intra' || state.gstMode === 'inter') tax = afterDiscount * 0.18
  return { subtotal, discount, afterDiscount, tax, total: afterDiscount + tax }
}

function Brand() {
  return (
    <div className="doc-brand">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="13" height="13" fill="#e4572e" />
        <rect x="17" y="2" width="13" height="13" fill="none" stroke="#16283c" strokeWidth="2" />
        <rect x="2" y="17" width="13" height="13" fill="none" stroke="#16283c" strokeWidth="2" />
        <rect x="17" y="17" width="13" height="13" fill="none" stroke="#16283c" strokeWidth="2" />
      </svg>
      <span>The Inside Cubicles</span>
    </div>
  )
}

function DocHeader({ state, title }) {
  return (
    <>
      <Brand />
      <div className="doc-company">
        <h1>{COMPANY.name}</h1>
        <p>{COMPANY.address}</p>
        <p>
          {COMPANY.email} · {COMPANY.phone}
        </p>
        <p className="doc-gstin">{state.ourGstin ? `GSTIN: ${state.ourGstin}` : 'GSTIN: applied for — registration in process'}</p>
      </div>
      <div className="doc-title">{title}</div>
      <div className="doc-meta">
        <span>
          <strong>Date:</strong> {fmtDate(state.date)}
        </span>
        <span>
          <strong>{state.docType === 'agreement' ? 'Ref' : 'Invoice'} No:</strong> {state.docNo}
        </span>
        <span>
          <strong>Start Date:</strong> {fmtDate(state.startDate)}
        </span>
        {state.endDate && (
          <span>
            <strong>End Date:</strong> {fmtDate(state.endDate)}
          </span>
        )}
      </div>
    </>
  )
}

function CustomerTable({ state }) {
  const rows = [
    ['Customer Name / Entity', state.entity],
    ['Point of Contact', state.contact],
    ['Email', state.email],
    ['Phone', state.phone],
    ['GST Number (if applicable)', state.gstin],
    ['Billing Address', state.address],
  ]
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th style={{ width: '36%' }}></th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td>{label}</td>
            <td className="pre-line">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ItemsTable({ state, totals }) {
  return (
    <>
      <h2 className="doc-section">Plan Details &amp; Seat Allocation</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Plan / Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Duration</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((it, i) => (
            <tr key={i}>
              <td>{it.desc}</td>
              <td>{it.qty}</td>
              <td>{fmt(Number(it.unitPrice))}</td>
              <td>{it.duration}</td>
              <td className="num">{fmt((Number(it.qty) || 0) * (Number(it.unitPrice) || 0) * (Number(it.periods) || 1))}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="4">Subtotal</td>
            <td className="num">{fmt(totals.subtotal)}</td>
          </tr>
          {Number(state.discountPct) > 0 && (
            <tr className="total-row">
              <td colSpan="4">Discount {state.discountPct}%</td>
              <td className="num">− {fmt(totals.discount)}</td>
            </tr>
          )}
          {state.gstMode === 'intra' && (
            <>
              <tr className="total-row">
                <td colSpan="4">SGST 9%</td>
                <td className="num">{fmt(totals.tax / 2)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan="4">CGST 9%</td>
                <td className="num">{fmt(totals.tax / 2)}</td>
              </tr>
            </>
          )}
          {state.gstMode === 'inter' && (
            <tr className="total-row">
              <td colSpan="4">IGST 18%</td>
              <td className="num">{fmt(totals.tax)}</td>
            </tr>
          )}
          <tr className="total-row grand">
            <td colSpan="4">Total Amount</td>
            <td className="num">₹ {fmt(totals.total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="doc-note">
        {state.gstMode === 'none'
          ? 'Note: GST is not charged on this document — GST registration is in process. Prices are in Indian Rupees (₹).'
          : 'Note: Prices are in Indian Rupees (₹).'}
      </p>
    </>
  )
}

function BillingTable({ state }) {
  const rows = [
    ['Next Billing Cycle', state.nextBilling],
    ['Security Deposit', state.deposit],
    ['Notice Period', state.notice],
    ...(state.docType === 'agreement' ? [['Initial Term Length', state.initialTerm]] : []),
    ['Accepted Payment Methods', state.paymentMethods],
    ['Bank Details', state.bank],
    ...(state.docType === 'agreement' ? [['Late Payment Fee', state.lateFee]] : []),
  ]
  return (
    <>
      <h2 className="doc-section">Billing &amp; Security Deposit</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th style={{ width: '36%' }}>Parameter</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className="pre-line">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Signatures({ state }) {
  return (
    <div className="doc-signs">
      <div>
        <h3>For The Inside Cubicles</h3>
        <p className="sign-line">Authorised Signatory:</p>
        <div className="sign-rule" />
        <p>Name: {state.ourSignatory || '____________________'}</p>
      </div>
      <div>
        <h3>For the Member / Entity</h3>
        <p className="sign-line">Authorised Signatory:</p>
        <div className="sign-rule" />
        <p>Name: {state.contact}</p>
        <p>Company: {state.entity}</p>
      </div>
    </div>
  )
}

function DocFooter() {
  return <p className="doc-footer">Confidential — The Inside Cubicles · www.theinsidecubicles.com</p>
}

export default function DocPreview({ state }) {
  const totals = computeTotals(state)
  const isAgreement = state.docType === 'agreement'
  const title = isAgreement ? 'SERVICE AGREEMENT & MEMBERSHIP INVOICE' : 'INVOICE'

  return (
    <div className="doc">
      <DocHeader state={state} title={title} />
      <CustomerTable state={state} />
      <ItemsTable state={state} totals={totals} />
      <BillingTable state={state} />

      {isAgreement && (
        <div className="page-break">
          <div className="doc-title">TERMS OF SERVICE &amp; CODE OF CONDUCT</div>
          {TERMS.map((section) => (
            <div className="doc-terms" key={section.title}>
              <h2 className="doc-section">{section.title}</h2>
              {(section.body || []).map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {isAgreement && (
        <div className="page-break">
          <div className="doc-title">AUTHORISATION &amp; SIGNATURES</div>
          <p>
            By signing below, the Member acknowledges that they have read, understood, and agreed to
            the membership details and all Terms of Service &amp; Code of Conduct set out in this
            Agreement.
          </p>
        </div>
      )}

      <Signatures state={state} />
      <DocFooter />
    </div>
  )
}
