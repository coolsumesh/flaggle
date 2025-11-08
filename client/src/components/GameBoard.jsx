import { useState, useEffect } from 'react'
import CountryInput from './CountryInput'
import FeedbackRow from './FeedbackRow'
import FlagDisplay from './FlagDisplay'

function GameBoard({ gameId, mode, onComplete, initialTargetCode }) {
  const [guesses, setGuesses] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(6)
  const [targetCountry, setTargetCountry] = useState(null)
  const [targetCode, setTargetCode] = useState(initialTargetCode)
  const [hintUsed, setHintUsed] = useState(false)
  const [hintLetter, setHintLetter] = useState('')
  const [flagUnblurred, setFlagUnblurred] = useState(false)

  const handleGuess = async (countryName) => {
    if (gameOver || attemptsLeft === 0) return

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, guess: countryName })
      })

      const data = await response.json()

      setGuesses([...guesses, { country: countryName, feedback: data.feedback }])
      setAttemptsLeft(data.attemptsLeft)

      if (data.correct) {
        setWon(true)
        setGameOver(true)
        setTargetCountry(data.targetCountry)
        setTargetCode(data.targetCountry?.cca2)
      } else if (data.attemptsLeft === 0) {
        setGameOver(true)
        setTargetCountry(data.targetCountry)
        setTargetCode(data.targetCountry?.cca2)
      }
    } catch (err) {
      console.error('Failed to submit guess:', err)
    }
  }

  const handleHint = async () => {
    if (hintUsed || gameOver || !targetCode) return

    try {
      // Fetch all countries to find the target
      const response = await fetch('/api/countries')
      const countries = await response.json()
      const targetCountry = countries.find(c => c.cca2 === targetCode)

      if (targetCountry) {
        setHintLetter(targetCountry.name.charAt(0).toUpperCase())
        setHintUsed(true)
      }
    } catch (err) {
      console.error('Failed to get hint:', err)
    }
  }

  const handleGiveUp = async () => {
    if (gameOver) return

    try {
      // Fetch the full target country data including facts
      const response = await fetch(`/api/game/${gameId}/target`)
      const data = await response.json()

      if (data.targetCountry) {
        setTargetCountry(data.targetCountry)
        setTargetCode(data.targetCountry.cca2)
        setGameOver(true)
        setWon(false)
        setAttemptsLeft(0)
      }
    } catch (err) {
      console.error('Failed to give up:', err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left side - Flag display */}
      <div className="space-y-6">
        <FlagDisplay
          countryCode={targetCode}
          blurred={!gameOver && !flagUnblurred}
        />

        {/* Country facts when revealed */}
        {gameOver && targetCountry && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-indigo-900">
              📍 About {targetCountry.name}
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              {/* Always show region info */}
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">Region:</span>
                <span>{targetCountry.region}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">Subregion:</span>
                <span>{targetCountry.subregion}</span>
              </div>

              {/* Optional fields */}
              {targetCountry.capital && (
                <div className="flex items-start">
                  <span className="font-semibold min-w-[100px]">Capital:</span>
                  <span>{targetCountry.capital}</span>
                </div>
              )}
              {targetCountry.population && (
                <div className="flex items-start">
                  <span className="font-semibold min-w-[100px]">Population:</span>
                  <span>{(targetCountry.population / 1000000).toFixed(1)} million</span>
                </div>
              )}

              {/* Flag details */}
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">Flag Colors:</span>
                <span className="capitalize">{targetCountry.primary_colors?.replace(/,/g, ', ')}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">Coordinates:</span>
                <span>{targetCountry.lat?.toFixed(2)}°, {targetCountry.lon?.toFixed(2)}°</span>
              </div>

              {/* Fun fact section */}
              {targetCountry.fun_fact ? (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="font-semibold mb-2 text-indigo-900">💡 Did you know?</p>
                  <p className="text-gray-600 italic">{targetCountry.fun_fact}</p>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-xs text-gray-500 italic">
                    Learn more about {targetCountry.name} online!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Guessing interface */}
      <div className="space-y-6">
        {/* Attempts remaining and hint */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-sm text-gray-600">
            Attempts remaining: <span className="font-bold text-primary text-lg">{attemptsLeft}</span>/6
          </p>
          {!gameOver && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleHint}
                disabled={hintUsed}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {hintUsed ? '💡 Used' : '💡 Letter'}
              </button>
              <button
                onClick={() => setFlagUnblurred(true)}
                disabled={flagUnblurred}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {flagUnblurred ? '👁️ Revealed' : '👁️ Show Flag'}
              </button>
              <button
                onClick={handleGiveUp}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                🏳️ Give Up
              </button>
            </div>
          )}
        </div>

        {/* Display hint */}
        {hintUsed && !gameOver && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-yellow-900">
              <span className="font-bold">💡 Hint:</span> The country starts with the letter{' '}
              <span className="inline-block bg-yellow-500 text-white font-bold text-2xl px-3 py-1 rounded ml-2">{hintLetter}</span>
            </p>
          </div>
        )}

        {/* Input or game over message */}
        <div className="bg-white rounded-lg shadow-lg p-5 border-2 border-gray-100">
          {!gameOver ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 text-center sm:text-left">Make your guess:</h3>
              <CountryInput onGuess={handleGuess} disabled={gameOver} />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold mb-3 text-center">
                {won ? '🎉 Congratulations!' : attemptsLeft === 0 && guesses.length > 0 ? '😔 Game Over' : '🏳️ You Gave Up'}
              </h3>
              <p className="text-gray-700 mb-4 text-center">
                The flag was: <span className="font-bold text-xl text-primary">{targetCountry?.name}</span>
              </p>
              {won ? (
                <p className="text-sm text-gray-600 text-center mb-4">
                  You guessed it in {guesses.length} {guesses.length === 1 ? 'attempt' : 'attempts'}!
                </p>
              ) : attemptsLeft === 0 && guesses.length === 0 ? (
                <p className="text-sm text-gray-600 text-center mb-4">
                  Don't worry! Try again to improve your geography knowledge.
                </p>
              ) : null}
              {mode === 'practice' && onComplete && (
                <div className="text-center mt-6">
                  <button
                    onClick={onComplete}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous guesses */}
        {guesses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Your Guesses:</h3>
            <div className="space-y-3">
              {guesses.map((guess, idx) => (
                <FeedbackRow key={idx} guess={guess} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameBoard
