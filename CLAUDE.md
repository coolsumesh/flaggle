# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Commands

### Setup
```bash
# Install all dependencies (root + client + server)
npm install

# Seed the database with sample countries
cd server && npm run dev
# Then call POST /api/seed or the countries will auto-seed on first /api/countries call
```

### Running the Application
```bash
# Run both client and server concurrently from root
npm run dev

# Or run separately:
npm run dev:client  # Client runs on http://localhost:3000
npm run dev:server  # Server runs on http://localhost:3001
```

### Building for Production
```bash
npm run build     # Builds client for production
npm start         # Starts production server
```

---

## Architecture Overview

**Tech Stack:**
- Frontend: React + Vite with Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Monorepo: npm workspaces

**Project Structure:**
```
flaggle/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── CountryInput.jsx    # Autocomplete country input
│   │   │   ├── FeedbackRow.jsx     # Displays guess feedback
│   │   │   ├── FlagDisplay.jsx     # Flag image (blurred/revealed)
│   │   │   ├── GameBoard.jsx       # Main game logic component
│   │   │   └── Header.jsx          # Navigation header
│   │   ├── pages/       # Route pages
│   │   │   ├── Home.jsx      # Daily puzzle
│   │   │   ├── Practice.jsx  # Practice mode
│   │   │   └── Profile.jsx   # User stats
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js   # Proxy /api to backend
│
└── server/              # Express backend
    ├── src/
    │   ├── db/
    │   │   ├── database.js   # SQLite setup & schema
    │   │   └── countries.js  # Country CRUD operations
    │   ├── routes/
    │   │   ├── game.js       # Game endpoints
    │   │   └── countries.js  # Country list endpoints
    │   ├── utils/
    │   │   └── feedback.js   # Similarity calculation logic
    │   └── index.js     # Express app entry
    └── data/            # SQLite database files (gitignored)
```

**Database Schema:**
- `countries`: Country data (name, flag, colors, region, coordinates)
- `games`: Game sessions (mode, target country, attempts, completion status)
- `guesses`: Individual guess records with similarity scores
- `daily_puzzles`: One puzzle per day mapping

**Key API Endpoints:**
- `GET /api/today` - Get/create today's daily puzzle
- `POST /api/new-game` - Start a practice game
- `POST /api/guess` - Submit a guess and get feedback
- `GET /api/countries` - Get all countries for autocomplete
- `POST /api/seed` - Seed database with sample countries (dev only)

**Feedback Calculation:**
Located in `server/src/utils/feedback.js`:
- Similarity score (0-100) calculated from: region match (30pts), color overlap (30pts), emblem match (10pts), geographic distance (30pts)
- Haversine formula for distance calculation
- Color matching uses set intersection

**Frontend State Management:**
- Component-level state with React hooks
- No global state management (yet)
- API calls directly from components

---

# Flagle — Game Design Document

> A Wordle-style flag-guessing game with geography-based feedback.

---

## 1. Project summary

**Flagle** is a single-player (and optionally social) geography puzzle: the player has to guess a national flag in 6 attempts. Each guess is a country; the UI shows feedback about how close the guess is to the target based on geography, region, colors, and other heuristics.

Goals:

* Fast, mobile-first web game inspired by Wordle.
* Fun daily puzzles + unlimited practice mode.
* Optional AI-powered hinting using Claude (or any LLM).

---

## 2. Rules & feedback model

* Player has **6 guesses** to identify the target country's flag.
* Each guess yields feedback in several categories:

  * **Continent / Region**: match / nearby / wrong (e.g., same continent or neighboring country).
  * **Primary colors**: which of the major colors on the guessed flag appear on the target flag (color chips).
  * **Emblem presence**: whether the flag contains an emblem/coat of arms (correct/incorrect).
  * **Similarity score (0-100)**: numerical similarity measuring overall closeness (geographic + color + symbols).

Feedback visualizations:

* Color chips (green = present, gray = absent).
* Icons for emblem match.
* A mini-map heat indicator showing geographic proximity.
* A numeric similarity badge.

Scoring:

* Base score: `max(0, 100 - 10 * attempts_used)` for a correct guess.
* Bonus for streaks and fast answers (time multiplier).

---

## 3. Data model

### Country object (JSON)

```json
{
  "cca2": "IN",
  "name": "India",
  "flag_svg": "india.svg",
  "primary_colors": ["saffron","white","green"],
  "has_emblem": true,
  "region": "Asia",
  "lat": 20.5937,
  "lon": 78.9629
}
```

Notes:

* `primary_colors` should be normalized to a small palette (e.g., red, blue, green, white, black, yellow, orange, purple, brown).
* Use `flag_svg` or `flag_png` asset paths.

---

## 4. API design (REST)

`GET /api/today` — returns today's puzzle id and minimal metadata.

`POST /api/new-game` — start a new random or practice game. Body: `{ "mode": "practice" | "daily" }`.

`POST /api/guess` — submit a guess. Body: `{ "gameId": "...", "guess": "India" }`. Response: feedback object (see example below).

`GET /api/leaderboard?period=daily|all` — top scores.

`POST /api/hint` — request an AI hint. Body: `{ "gameId": "...", "hintLevel": 1|2|3 }`. Returns an AI-generated hint string.

Example guess response:

```json
{
  "correct": false,
  "feedback": {
    "region": "same_continent",
    "colors": { "saffron": true, "white": true, "green": true, "blue": false },
    "has_emblem": false,
    "similarity": 68,
    "distance_km": 1200
  },
  "attemptsLeft": 4
}
```

---

## 5. UI / UX

Pages & components:

* **Home / Daily**: big flag silhouette masked (or blurred) + input box for country name + keyboard autocomplete.
* **Practice**: pick region/difficulty.
* **Results**: shareable result card with emoji grid (like Wordle) and stats.
* **Profile**: streak, total wins, accuracy.

Accessibility:

* Large color contrast, screen-reader labels for color chips, and keyboard navigation.

Mobile-first tips:

* Keep interactions single-tap, avoid long forms.
* Use inline SVGs for flags for crisp rendering.

---

## 6. Claude / LLM integration ideas

Use a Claude-style assistant for:

* **Dynamic hints** (progressive): e.g., "The flag contains two of these colors: white and blue" or "The country is on the Iberian Peninsula".
* **Contextual explanations**: after the round, provide interesting trivia about the country/flag (short 1–2 sentences).
* **Difficulty scaling**: create hints of varying specificity based on `hintLevel`.

### Example system prompt (for hint generation)

```
You are a helpful geography assistant. The user is playing a flag-guessing game. Input: target country JSON and hint level (1=very vague, 3=very specific). Output: a single short hint (max 25 words) that helps but does not directly reveal the country. Use neutral tone.
```

### Example user input to Claude

```
Target: { "name": "Portugal", "region": "Europe", "primary_colors": ["green","red"], "has_emblem": true }
HintLevel: 2
```

Expected short hint output:

> "The flag's two main colors appear in a vertical split and the country sits on the Iberian Peninsula."

---

## 7. MVP feature list (2-week sprint)

**Week 1**

* Data: compile country list + flags (SVGs) and normalize color tags.
* Backend: simple REST endpoints (`new-game`, `guess`, `today`).
* Frontend: single-player practice mode UI, guess input, and feedback display.

**Week 2**

* Add daily puzzle logic and sharing result card.
* Implement local leaderboard & basic profile with streak.
* Integrate simple Claude hint endpoint (optional).

---

## 8. Monetization & growth

* Non-intrusive ads (banner) in practice mode.
* Premium: unlimited hints, turn off ads, create private daily puzzles for friends.
* Social: shareable results, invite friends to compete, and weekly tournaments.

---

## 9. Sample prompts for Claude (saved in repo)

* `hint_prom
