import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import OfficeApp from './office/OfficeApp.jsx'
import './index.css'

const path = window.location.pathname.replace(/\/+$/, '')
// /invoice → invoice generator; /quotation → quotations; /agreement → invoice + agreement pair
const officeMode =
  path === '/invoice' ? 'invoice' : path === '/quotation' ? 'quotation' : path === '/agreement' ? 'agreement' : null

// any other path falls back to the homepage, and the URL cleans up to /
if (!officeMode && path !== '') {
  window.history.replaceState(null, '', '/')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{officeMode ? <OfficeApp mode={officeMode} /> : <App />}</StrictMode>,
)
