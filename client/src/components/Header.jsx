import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🚩</span>
            <h1 className="text-2xl font-bold text-primary">Flagle</h1>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              Play
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
