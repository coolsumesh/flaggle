import express from 'express'
import { getAllCountries } from '../db/countries.js'

const router = express.Router()

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Start a new quiz
router.post('/quiz/start', (req, res) => {
  try {
    const allCountries = getAllCountries()

    if (allCountries.length < 10) {
      return res.status(400).json({ error: 'Not enough countries in database' })
    }

    // Select 10 random countries for the quiz
    const shuffledCountries = shuffleArray(allCountries)
    const quizCountries = shuffledCountries.slice(0, 10)

    // Generate questions with 4 options each
    const questions = quizCountries.map(targetCountry => {
      // Get 3 random wrong answers (excluding the correct one)
      const wrongAnswers = shuffleArray(
        allCountries.filter(c => c.cca2 !== targetCountry.cca2)
      ).slice(0, 3).map(c => c.name)

      // Combine and shuffle all 4 options
      const options = shuffleArray([
        targetCountry.name,
        ...wrongAnswers
      ])

      return {
        countryCode: targetCountry.cca2,
        correctAnswer: targetCountry.name,
        options: options
      }
    })

    res.json({
      questions,
      totalQuestions: 10,
      passingScore: 7
    })
  } catch (error) {
    console.error('Error starting quiz:', error)
    res.status(500).json({ error: 'Failed to start quiz' })
  }
})

export default router
