# 🚩 Flaggle

A Wordle-style flag-guessing game where players have 6 attempts to identify a country's flag based on geographic and visual feedback.

## Features

- **Daily Puzzle**: A new flag to guess every day
- **Practice Mode**: Unlimited games to improve your geography skills
- **Smart Feedback**: Get hints about region, distance, colors, and symbols
- **Similarity Score**: See how close your guess is (0-100 scale)
- **Mobile-First Design**: Optimized for play on any device

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Start both client and server
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Building for Production

```bash
# Build client
npm run build

# Start production server
npm start
```

## Game Rules

1. You have **6 attempts** to guess the correct country's flag
2. Each guess provides feedback on:
   - **Region Match**: Same continent, subregion, or different
   - **Colors**: Which colors from your guess appear on the target flag
   - **Emblem**: Whether the flag has a coat of arms or emblem
   - **Distance**: How far (in km) your guess is from the target
   - **Similarity**: Overall similarity score (0-100)

3. Use the feedback to narrow down your next guess!

## Project Structure

```
flaggle/
├── client/          # React frontend
├── server/          # Express backend
└── package.json     # Workspace configuration
```

## API Endpoints

- `GET /api/today` - Get today's daily puzzle
- `POST /api/new-game` - Start a practice game
- `POST /api/guess` - Submit a guess
- `GET /api/countries` - Get country list for autocomplete

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
