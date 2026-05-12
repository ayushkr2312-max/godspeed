import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './hub.css'
import TeamHub from './TeamHub.jsx'

createRoot(document.getElementById('team-hub-root')).render(
  <StrictMode>
    <TeamHub />
  </StrictMode>
)
