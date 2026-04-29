import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import "./types/typography.ts"
import "@fontsource/source-sans-3/400.css"
import "@fontsource/source-sans-3/600.css"
import "@fontsource/source-sans-3/700.css"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
