import { useState } from 'react'
import GameBoard from '../components/GameBoard'

function Play() {
  const [gameId, setGameId] = useState(null)
  const [targetCode, setTargetCode] = useState(null)
  const [loading, setLoading] = useState(false)

  const startNewGame = () => {
    // Reset gameId first to unmount the current game
    setGameId(null)
    setTargetCode(null)

    setLoading(true)
    fetch('/api/new-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'practice' })
    })
      .then(res => res.json())
      .then(data => {
        setGameId(data.gameId)
        setTargetCode(data.targetCode)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to start new game:', err)
        setLoading(false)
      })
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Flaggle</h2>
        <p className="text-gray-600 text-sm sm:text-base">Guess the country from its flag in 5 attempts!</p>
      </div>

      {!gameId ? (
        <div className="text-center">
          <button
            onClick={startNewGame}
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Starting...' : 'Start New Game'}
          </button>
        </div>
      ) : (
        <GameBoard
          key={gameId}
          gameId={gameId}
          mode="practice"
          onComplete={startNewGame}
          initialTargetCode={targetCode}
        />
      )}
    </div>
  )
}

export default Play
