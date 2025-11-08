import { useState, useEffect } from 'react'
import GameBoard from '../components/GameBoard'

function Home() {
  const [loading, setLoading] = useState(true)
  const [gameId, setGameId] = useState(null)
  const [targetCode, setTargetCode] = useState(null)

  useEffect(() => {
    // Fetch today's daily puzzle
    fetch('/api/today')
      .then(res => res.json())
      .then(data => {
        setGameId(data.gameId)
        setTargetCode(data.targetCode)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load daily puzzle:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading today's puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Daily Flaggle</h2>
        <p className="text-gray-600 text-sm sm:text-base">Guess today's flag in 6 attempts</p>
      </div>

      {gameId && <GameBoard gameId={gameId} mode="daily" initialTargetCode={targetCode} />}
    </div>
  )
}

export default Home
