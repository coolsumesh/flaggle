import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbDir = join(__dirname, '../../data')
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const dbPath = process.env.DATABASE_PATH || join(dbDir, 'flaggle.db')
const db = new Database(dbPath)

export function initDatabase() {
  // Countries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cca2 TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      flag_emoji TEXT,
      primary_colors TEXT NOT NULL,
      has_emblem INTEGER DEFAULT 0,
      region TEXT NOT NULL,
      subregion TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      capital TEXT,
      population INTEGER,
      fun_fact TEXT
    )
  `)

  // Games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      target_country_id INTEGER NOT NULL,
      attempts_used INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 6,
      completed INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (target_country_id) REFERENCES countries(id)
    )
  `)

  // Guesses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS guesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      country_id INTEGER NOT NULL,
      similarity INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (country_id) REFERENCES countries(id)
    )
  `)

  // Daily puzzles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_puzzles (
      date TEXT PRIMARY KEY,
      country_id INTEGER NOT NULL,
      FOREIGN KEY (country_id) REFERENCES countries(id)
    )
  `)

  console.log('✓ Database initialized')
}

export default db
