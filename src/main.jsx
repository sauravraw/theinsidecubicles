import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import OfficeApp from './office/OfficeApp.jsx'
import './index.css'

const isOffice = window.location.pathname.replace(/\/+$/, '') === '/office'

createRoot(document.getElementById('root')).render(
  <StrictMode>{isOffice ? <OfficeApp /> : <App />}</StrictMode>,
)
