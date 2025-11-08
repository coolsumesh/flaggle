import express from 'express'
import { randomUUID } from 'crypto'
import db from '../db/database.js'
import {
  getRandomCountry,
  getCountryByName,
  getCountryById
} from '../db/countries.js'
import { generateFeedback } from '../utils/feedback.js'

const router = express.Router()

// Get or create today's daily puzzle
router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  let puzzle = db
    .prepare('SELECT * FROM daily_puzzles WHERE date = ?')
    .get(today)

  if (!puzzle) {
    const randomCountry = getRandomCountry()
    db.prepare('INSERT INTO daily_puzzles (date, country_id) VALUES (?, ?)').run(
      today,
      randomCountry.id
    )
    puzzle = { date: today, country_id: randomCountry.id }
  }

  const gameId = `daily-${today}`

  let game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)

  if (!game) {
    db.prepare(
      'INSERT INTO games (id, mode, target_country_id) VALUES (?, ?, ?)'
    ).run(gameId, 'daily', puzzle.country_id)
  }

  // Get target country code for flag display
  const targetCountry = getCountryById(puzzle.country_id)

  res.json({ gameId, date: today, targetCode: targetCountry.cca2 })
})

// Start a new game
router.post('/new-game', (req, res) => {
  const { mode } = req.body

  if (!['daily', 'practice'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' })
  }

  const randomCountry = getRandomCountry()
  const gameId = `${mode}-${randomUUID()}`

  db.prepare(
    'INSERT INTO games (id, mode, target_country_id) VALUES (?, ?, ?)'
  ).run(gameId, mode, randomCountry.id)

  res.json({ gameId, targetCode: randomCountry.cca2 })
})

// Submit a guess
router.post('/guess', (req, res) => {
  const { gameId, guess } = req.body

  if (!gameId || !guess) {
    return res.status(400).json({ error: 'Missing gameId or guess' })
  }

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  if (game.completed) {
    return res.status(400).json({ error: 'Game already completed' })
  }

  const guessCountry = getCountryByName(guess)

  if (!guessCountry) {
    return res.status(400).json({ error: 'Invalid country name' })
  }

  const targetCountry = getCountryById(game.target_country_id)

  const correct = guessCountry.id === targetCountry.id
  const feedback = generateFeedback(guessCountry, targetCountry)

  // Save guess
  db.prepare(
    'INSERT INTO guesses (game_id, country_id, similarity) VALUES (?, ?, ?)'
  ).run(gameId, guessCountry.id, feedback.similarity)

  // Update game
  const newAttemptsUsed = game.attempts_used + 1
  const attemptsLeft = game.max_attempts - newAttemptsUsed

  if (correct || attemptsLeft === 0) {
    db.prepare(
      'UPDATE games SET attempts_used = ?, completed = 1, won = ? WHERE id = ?'
    ).run(newAttemptsUsed, correct ? 1 : 0, gameId)
  } else {
    db.prepare('UPDATE games SET attempts_used = ? WHERE id = ?').run(
      newAttemptsUsed,
      gameId
    )
  }

  const response = {
    correct,
    feedback,
    attemptsLeft,
    targetCountry: correct || attemptsLeft === 0 ? targetCountry : undefined
  }

  res.json(response)
})

// Get game state
router.get('/game/:gameId', (req, res) => {
  const { gameId } = req.params

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  const guesses = db
    .prepare(
      `SELECT g.*, c.name, c.cca2
       FROM guesses g
       JOIN countries c ON g.country_id = c.id
       WHERE g.game_id = ?
       ORDER BY g.created_at`
    )
    .all(gameId)

  res.json({
    game,
    guesses,
    attemptsLeft: game.max_attempts - game.attempts_used
  })
})

// Get target country for a game (for give up feature)
router.get('/game/:gameId/target', (req, res) => {
  const { gameId } = req.params

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  const targetCountry = getCountryById(game.target_country_id)

  res.json({ targetCountry })
})

export default router
