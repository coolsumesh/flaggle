import { useState, useEffect, useRef } from 'react'

function CountryInput({ onGuess, disabled, guessedCountries = [] }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [countries, setCountries] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    // Fetch country list for autocomplete
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries:', err))
  }, [])

  useEffect(() => {
    if (input.length > 0) {
      const filtered = countries
        .filter(country =>
          country.name.toLowerCase().startsWith(input.toLowerCase()) &&
          !guessedCountries.includes(country.name)
        )
        .slice(0, 5)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [input, countries, guessedCountries])

  const handleSubmit = (countryName) => {
    const country = countries.find(c =>
      c.name.toLowerCase() === countryName.toLowerCase()
    )

    if (country) {
      onGuess(country.name)
      setInput('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      handleSubmit(suggestions[0].name)
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a country name..."
          disabled={disabled}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        <button
          onClick={() => handleSubmit(input)}
          disabled={disabled || !input}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guess
        </button>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((country, idx) => (
            <button
              key={country.cca2}
              onClick={() => handleSubmit(country.name)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="mr-2">{country.flag}</span>
              {country.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CountryInput
