import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './db/database.js'
import gameRoutes from './routes/game.js'
import countryRoutes from './routes/countries.js'
import quizRoutes from './routes/quiz.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
initDatabase()

// Routes
app.use('/api', gameRoutes)
app.use('/api', countryRoutes)
app.use('/api', quizRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flaggle API is running' })
})

app.listen(PORT, () => {
  console.log(`🚩 Flaggle server running on http://localhost:${PORT}`)
})
