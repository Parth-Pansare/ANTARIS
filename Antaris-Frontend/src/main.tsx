import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './login-dark.css'
import './light-theme-compat.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
