import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FeedbackApp } from './features/feedback/components/FeedbackApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeedbackApp />
  </StrictMode>,
)
