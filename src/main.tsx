import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './game/store'
import './styles.css'

// iOS Shortcuts deep links: ?log=weight:251.4  ?log=pullups:6  ?log=income:250
function applyDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const log = params.get('log')
  if (!log) return
  const [kind, raw] = log.split(':')
  const value = Number(raw)
  if ((kind === 'weight' || kind === 'pullups' || kind === 'income') && Number.isFinite(value)) {
    useStore.getState().logGoal(kind, value, 'via Shortcut')
  }
  params.delete('log')
  const qs = params.toString()
  window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''))
}

applyDeepLink()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
