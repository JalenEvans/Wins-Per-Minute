import './App.css'
import TypingGame from './components/TypingGame'

function App() {

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Wins Per Minute</h1>
      <TypingGame />
    </div>
  )
}

export default App
