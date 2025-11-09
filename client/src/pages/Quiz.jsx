import { useState, useEffect } from 'react'
import FlagDisplay from '../components/FlagDisplay'

function Quiz() {
  const [quizSession, setQuizSession] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fiftyFiftyRemaining, setFiftyFiftyRemaining] = useState(3)
  const [hiddenOptions, setHiddenOptions] = useState([])

  const startQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      setQuizSession(data)
      setCurrentQuestion(0)
      setScore(0)
      setQuizComplete(false)
      setShowFeedback(false)
      setSelectedAnswer(null)
      setFiftyFiftyRemaining(3)
      setHiddenOptions([])
      setLoading(false)
    } catch (err) {
      console.error('Failed to start quiz:', err)
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return // Prevent changing answer after submission
    setSelectedAnswer(answer)
  }

  const use50Fifty = () => {
    if (fiftyFiftyRemaining <= 0 || showFeedback || hiddenOptions.length > 0) return

    const currentQ = quizSession.questions[currentQuestion]
    const incorrectOptions = currentQ.options.filter(opt => opt !== currentQ.correctAnswer)

    // Randomly select 2 incorrect options to hide (50% of 4 options = 2)
    const shuffled = [...incorrectOptions].sort(() => Math.random() - 0.5)
    const optionsToHide = shuffled.slice(0, 2)

    setHiddenOptions(optionsToHide)
    setFiftyFiftyRemaining(fiftyFiftyRemaining - 1)
  }

  const submitAnswer = () => {
    if (!selectedAnswer) return

    const currentQ = quizSession.questions[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correctAnswer

    if (isCorrect) {
      setScore(score + 1)
    }

    setShowFeedback(true)

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setHiddenOptions([])
      } else {
        setQuizComplete(true)
      }
    }, 2000)
  }

  const shareToFacebook = () => {
    const shareUrl = `https://www.flaggle.com/quiz?score=${score}`
    const shareText = `I scored ${score}/${totalQuestions} on Flaggle Quiz! Can you beat my score? 🎯`

    // Try to use Web Share API first (works on mobile)
    if (navigator.share) {
      navigator.share({
        title: 'Flaggle Quiz Results',
        text: shareText,
        url: shareUrl
      }).catch(() => {
        // Fallback to Facebook sharer
        openFacebookSharer(shareUrl, shareText)
      })
    } else {
      openFacebookSharer(shareUrl, shareText)
    }
  }

  const openFacebookSharer = (url, text) => {
    // Copy text to clipboard for user to paste
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
      // Open Facebook with the URL
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      window.open(facebookUrl, '_blank', 'width=600,height=600')

      // Show a temporary notification
      alert('Your score has been copied to clipboard! Paste it when sharing on Facebook.')
    }).catch(() => {
      // If clipboard fails, just open Facebook
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      window.open(facebookUrl, '_blank', 'width=600,height=600')
    })
  }

  const copyScore = () => {
    const shareText = `I scored ${score}/${totalQuestions} on Flaggle Quiz! Can you beat my score? 🎯\n\nhttps://www.flaggle.com/quiz`
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Score copied to clipboard! You can now paste it anywhere.')
    }).catch(() => {
      alert('Failed to copy to clipboard')
    })
  }

  const getButtonStyle = (option) => {
    if (!showFeedback) {
      return selectedAnswer === option
        ? 'bg-blue-500 text-white border-blue-600'
        : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
    }

    const currentQ = quizSession.questions[currentQuestion]
    if (option === currentQ.correctAnswer) {
      return 'bg-green-500 text-white border-green-600'
    }
    if (option === selectedAnswer && option !== currentQ.correctAnswer) {
      return 'bg-red-500 text-white border-red-600'
    }
    return 'bg-gray-100 text-gray-500 border-gray-300'
  }

  const isPassed = score >= 7
  const totalQuestions = 10

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Quiz Mode</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Identify 10 flags. Score 7 or more to pass!
        </p>
      </div>

      {!quizSession ? (
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4">Ready to Test Your Knowledge?</h3>
            <p className="text-gray-600 mb-6">
              You'll be shown 10 flags with 4 options each. Get 7 or more correct to pass the quiz!
            </p>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-md w-full"
            >
              {loading ? 'Starting...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      ) : quizComplete ? (
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-8xl mb-4">
              {isPassed ? '🎉' : '😔'}
            </div>
            <h3 className="text-3xl font-bold mb-4">
              {isPassed ? 'Congratulations!' : 'Quiz Failed'}
            </h3>
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2">
                <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                  {score}
                </span>
                <span className="text-gray-400">/{totalQuestions}</span>
              </div>
              <p className="text-lg text-gray-600">
                {isPassed
                  ? 'You passed the quiz! Great job!'
                  : 'You need at least 7 correct answers to pass. Try again!'}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Performance</div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {((score / totalQuestions) * 100).toFixed(0)}% correct
              </div>
            </div>

            <div className="space-y-3">
              {isPassed && (
                <>
                  <button
                    onClick={shareToFacebook}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Share on Facebook
                  </button>
                  <button
                    onClick={copyScore}
                    className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Score
                  </button>
                </>
              )}
              <button
                onClick={startQuiz}
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md w-full"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-primary">
                Score: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Two-column layout: Flag on left, Options on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Flag display */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center">
              <div className="w-full">
                <FlagDisplay
                  countryCode={quizSession.questions[currentQuestion].countryCode}
                  blurred={false}
                />
              </div>
            </div>

            {/* Right side - Options */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Which country is this?
              </h3>

              {/* 50/50 Lifeline Button */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={use50Fifty}
                  disabled={fiftyFiftyRemaining <= 0 || showFeedback || hiddenOptions.length > 0}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                >
                  <span className="text-lg">50/50</span>
                </button>
                <div className="text-sm text-gray-600 font-semibold">
                  Lifelines: {fiftyFiftyRemaining} remaining
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 flex-1">
                {quizSession.questions[currentQuestion].options
                  .filter(option => !hiddenOptions.includes(option))
                  .map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`${getButtonStyle(
                        option
                      )} px-6 py-4 rounded-lg font-semibold border-2 transition-all duration-200 disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  ))}
              </div>

              {/* Submit button */}
              {!showFeedback && (
                <div className="mt-6 text-center">
                  <button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full"
                  >
                    Submit Answer
                  </button>
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className="mt-6">
                  <div
                    className={`${
                      selectedAnswer === quizSession.questions[currentQuestion].correctAnswer
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    } border-2 rounded-lg p-4 text-center`}
                  >
                    <p className="font-bold text-lg">
                      {selectedAnswer === quizSession.questions[currentQuestion].correctAnswer
                        ? '✓ Correct!'
                        : `✗ Wrong! The answer is ${quizSession.questions[currentQuestion].correctAnswer}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz
