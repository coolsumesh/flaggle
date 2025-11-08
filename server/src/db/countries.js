import db from './database.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load comprehensive country data
const countriesData = JSON.parse(
  readFileSync(join(__dirname, '../../data/countries-data.json'), 'utf-8')
)

// Load country facts
const countryFacts = JSON.parse(
  readFileSync(join(__dirname, '../../data/country-facts.json'), 'utf-8')
)

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Convert loaded data to the format needed for the database
export const sampleCountries = countriesData.map(country => {
  const facts = countryFacts[country.cca2] || { capital: null, population: null, fact: null }
  return {
    cca2: country.cca2,
    name: country.name,
    flag: getFlagEmoji(country.cca2),
    primary_colors: country.colors,
    has_emblem: country.emblem,
    region: country.region,
    subregion: country.subregion,
    lat: country.lat,
    lon: country.lon,
    capital: facts.capital,
    population: facts.population,
    fun_fact: facts.fact
  }
})

export function seedCountries() {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO countries (cca2, name, flag_emoji, primary_colors, has_emblem, region, subregion, lat, lon, capital, population, fun_fact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((countries) => {
    for (const country of countries) {
      stmt.run(
        country.cca2,
        country.name,
        country.flag,
        country.primary_colors,
        country.has_emblem,
        country.region,
        country.subregion,
        country.lat,
        country.lon,
        country.capital,
        country.population,
        country.fun_fact
      )
    }
  })

  insertMany(sampleCountries)
  console.log(`✓ Seeded ${sampleCountries.length} countries`)
}

export function getAllCountries() {
  return db.prepare('SELECT * FROM countries ORDER BY name').all()
}

export function getCountryById(id) {
  return db.prepare('SELECT * FROM countries WHERE id = ?').get(id)
}

export function getCountryByCode(cca2) {
  return db.prepare('SELECT * FROM countries WHERE cca2 = ?').get(cca2)
}

export function getCountryByName(name) {
  return db.prepare('SELECT * FROM countries WHERE name = ?').get(name)
}

export function getRandomCountry() {
  return db.prepare('SELECT * FROM countries ORDER BY RANDOM() LIMIT 1').get()
}
