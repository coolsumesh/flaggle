import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Play from './pages/Play'
import Quiz from './pages/Quiz'
import Learn from './pages/Learn'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Play />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
