import express from 'express'
import { getAllCountries, seedCountries } from '../db/countries.js'
import db from '../db/database.js'

const router = express.Router()

// Get all countries (for autocomplete)
router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries()

    // If no countries in DB, seed them first
    if (countries.length === 0) {
      seedCountries()
      const newCountries = getAllCountries()
      return res.json(
        newCountries.map(c => ({
          cca2: c.cca2,
          name: c.name,
          flag: c.flag_emoji,
          region: c.region
        }))
      )
    }

    res.json(
      countries.map(c => ({
        cca2: c.cca2,
        name: c.name,
        flag: c.flag_emoji,
        region: c.region
      }))
    )
  } catch (error) {
    console.error('Error fetching countries:', error)
    res.status(500).json({ error: 'Failed to fetch countries' })
  }
})

// Get individual country by code
router.get('/countries/:code', (req, res) => {
  try {
    const { code } = req.params
    const country = db.prepare('SELECT * FROM countries WHERE cca2 = ?').get(code)

    if (!country) {
      return res.status(404).json({ error: 'Country not found' })
    }

    res.json(country)
  } catch (error) {
    console.error('Error fetching country:', error)
    res.status(500).json({ error: 'Failed to fetch country' })
  }
})

// Seed countries (development endpoint)
router.post('/seed', (req, res) => {
  try {
    seedCountries()
    res.json({ message: 'Countries seeded successfully' })
  } catch (error) {
    console.error('Error seeding countries:', error)
    res.status(500).json({ error: 'Failed to seed countries' })
  }
})

export default router
