import { TERMS } from './terms.js'

const COMPANY = {
  name: 'The Inside Cubicles',
  address: 'F44, First Floor, Cosmos Square, Rustomjee Global City, HDIL, Vasai-Virar, Maharashtra 401303',
  // agreements + invoices print bookings@; quotations print info@
  email: 'bookings@theinsidecubicles.com',
  quotationEmail: 'info@theinsidecubicles.com',
  phone: '+91 79774 48516',
}

export const fmt = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

// '2026-07-28' → '28/07/2026'; anything else passes through untouched
export const fmtDate = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v || '—'
}

// All entered prices are INCLUSIVE of 18% GST. The GST rows extract the tax
// from within the price — the customer's total never goes above the entered
// (discounted) amount.
export function computeTotals(state) {
  const subtotal = state.items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) * (Number(it.periods) || 1),
    0,
  )
  const discount = subtotal * ((Number(state.discountPct) || 0) / 100)
  const total = subtotal - discount
  const hasGst = state.gstMode === 'intra' || state.gstMode === 'inter'
  const taxable = hasGst ? total / 1.18 : total
  const tax = total - taxable
  return { subtotal, discount, taxable, tax, total }
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

// Bolds the lead-in of a bullet ("Cyber-malpractice: …"), coWORX-style.
function TermLead({ text }) {
  const i = text.indexOf(':')
  if (i < 1 || i > 60) return text
  return (
    <>
      <strong>{text.slice(0, i + 1)}</strong>
      {text.slice(i + 1)}
    </>
  )
}

function DocHeader({ state, title }) {
  return (
    <>
      <div className="doc-company">
        <h1>{COMPANY.name}</h1>
        <p>{COMPANY.address}</p>
        <p>
          {state.docType === 'quotation' ? COMPANY.quotationEmail : COMPANY.email} · {COMPANY.phone}
        </p>
        {state.ourGstin && <p className="doc-gstin">GSTIN: {state.ourGstin}</p>}
      </div>
      <div className="doc-title">{title}</div>
      <div className="doc-meta">
        <span>
          <strong>Date:</strong> {fmtDate(state.date)}
        </span>
        <span>
          <strong>{state.docType === 'invoice' ? 'Invoice' : state.docType === 'quotation' ? 'Quotation' : 'Ref'} No:</strong> {state.docNo}
        </span>
        <span>
          <strong>Start Date:</strong> {fmtDate(state.startDate)}
        </span>
        {state.endDate && (
          <span>
            <strong>{state.docType === 'quotation' ? 'Valid Until' : 'End Date'}:</strong> {fmtDate(state.endDate)}
          </span>
        )}
        {(state.docType === 'agreement' || state.docType === 'service') && state.initialTerm && (
          <span>
            <strong>Agreement Term:</strong> {state.initialTerm}
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
    ['Phone', state.phone ? `+91-${state.phone}` : ''],
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
  const sac = (state.sac || '').trim()
  const span = sac ? 5 : 4
  return (
    <>
      <h2 className="doc-section">Plan Details &amp; Seat Allocation</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Plan / Description</th>
            {sac && <th>SAC</th>}
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
              {sac && <td>{sac}</td>}
              <td>{it.qty}</td>
              <td>{fmt(Number(it.unitPrice))}</td>
              <td>{it.duration}</td>
              <td className="num">{fmt((Number(it.qty) || 0) * (Number(it.unitPrice) || 0) * (Number(it.periods) || 1))}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={span}>Subtotal</td>
            <td className="num">{fmt(totals.subtotal)}</td>
          </tr>
          {Number(state.discountPct) > 0 && (
            <tr className="total-row">
              <td colSpan={span}>Discount {state.discountPct}%</td>
              <td className="num">− {fmt(totals.discount)}</td>
            </tr>
          )}
          {(state.gstMode === 'intra' || state.gstMode === 'inter') && (
            <tr className="total-row">
              <td colSpan={span}>Taxable Value</td>
              <td className="num">{fmt(totals.taxable)}</td>
            </tr>
          )}
          {state.gstMode === 'intra' && (
            <>
              <tr className="total-row">
                <td colSpan={span}>SGST 9% (included)</td>
                <td className="num">{fmt(totals.tax / 2)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan={span}>CGST 9% (included)</td>
                <td className="num">{fmt(totals.tax / 2)}</td>
              </tr>
            </>
          )}
          {state.gstMode === 'inter' && (
            <tr className="total-row">
              <td colSpan={span}>IGST 18% (included)</td>
              <td className="num">{fmt(totals.tax)}</td>
            </tr>
          )}
          <tr className="total-row grand">
            <td colSpan={span}>Total Amount</td>
            <td className="num">₹ {fmt(totals.total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="doc-note">
        {state.gstMode === 'none'
          ? 'Note: GST is not charged on this document — GST registration is in process. Prices are in Indian Rupees (₹).'
          : 'Note: All prices are inclusive of 18% GST. Prices are in Indian Rupees (₹).'}
      </p>
    </>
  )
}

function BillingTable({ state }) {
  const rows = [
    ...(state.docType !== 'quotation' ? [['Next Billing Cycle', fmtDate(state.nextBilling)]] : []),
    ['Security Deposit', state.deposit],
    ['Notice Period', state.notice],
    ...(state.docType === 'agreement' || state.docType === 'service' ? [['Initial Term Length', state.initialTerm]] : []),
    ['Accepted Payment Methods', state.paymentMethods],
    ['Bank Details', state.bank],
    ['Late Payment Fee', state.lateFee],
  ]
  return (
    <div className="doc-block">
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
    </div>
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
        <h3>{state.docType === 'quotation' ? 'Accepted by (Member / Entity)' : 'For the Member / Entity'}</h3>
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

export default function DocPreview({ state: rawState }) {
  const isService = rawState.docType === 'service'
  const isQuotation = rawState.docType === 'quotation'
  const withTerms = rawState.docType === 'agreement' || isService
  // Commercial invoices never carry GST — nor the SAC column, which is a GST
  // classification code — even if a stale draft has them set.
  const invoiceKind = rawState.invoiceKind ?? (rawState.gstMode === 'none' ? 'commercial' : 'tax')
  const isCommercial = rawState.docType === 'invoice' && invoiceKind === 'commercial'
  const state = isCommercial ? { ...rawState, gstMode: 'none', sac: '' } : rawState
  const totals = computeTotals(state)
  const title = isQuotation
    ? 'QUOTATION'
    : isService
      ? 'SERVICE AGREEMENT'
      : state.docType === 'agreement'
        ? 'SERVICE AGREEMENT & MEMBERSHIP INVOICE'
        : isCommercial
          ? 'COMMERCIAL INVOICE'
          : 'TAX INVOICE'

  return (
    <div className="doc">
      {/* The table frame repeats its header row on every printed page. */}
      <table className="doc-frame">
        <thead>
          <tr>
            <td className="doc-frame-head">
              <Brand />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="doc-frame-body">
      <DocHeader state={state} title={title} />
      <CustomerTable state={state} />
      {!isService && <ItemsTable state={state} totals={totals} />}
      {isQuotation && (
        <p className="doc-note">
          This quotation is an offer of pricing only, valid until{' '}
          {state.endDate ? fmtDate(state.endDate) : '15 days from the date above'}. Desks and rooms
          are subject to availability at the time of confirmation.
        </p>
      )}
      {!isQuotation && <BillingTable state={state} />}

      {withTerms && (
        <div className="page-break">
          <div className="doc-title">TERMS OF SERVICE &amp; CODE OF CONDUCT</div>
          {TERMS.map((section) => (
            <div className="doc-terms" key={section.title}>
              <h2 className="doc-section">{section.title}</h2>
              {(section.body || []).map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.table && (
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36%' }}>Parameter</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.map(([param, details]) => (
                      <tr key={param}>
                        <td>{param}</td>
                        <td>{details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {section.note && <p className="doc-note">{section.note}</p>}
              {section.bullets && (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>
                      <TermLead text={b} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {withTerms && (
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
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="doc-frame-foot">
              <DocFooter />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
