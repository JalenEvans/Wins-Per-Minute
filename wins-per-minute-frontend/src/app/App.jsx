import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TypingGame from '../components/TypingGame'

import './App.css'

export function App() {

  return (
    <div id="root" className="min-h-screen min-w-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-bold mb-4 text-center">Wins Per Minute</h1>
      <TypingGame />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
