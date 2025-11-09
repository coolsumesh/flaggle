import { useState, useEffect } from 'react'
import FlagDisplay from '../components/FlagDisplay'
import PronunciationCharacter from '../components/PronunciationCharacter'
import { getPronunciation } from '../utils/pronunciations'

function Learn() {
  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showPronunciation, setShowPronunciation] = useState(false)

  const fetchCountryDetails = async (country) => {
    try {
      const response = await fetch(`/api/countries/${country.cca2}`)
      const data = await response.json()
      setSelectedCountry(data)
    } catch (err) {
      console.error('Failed to fetch country details:', err)
    }
  }

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data)
        setFilteredCountries(data)
        setLoading(false)

        // Select a random country by default
        if (data.length > 0) {
          const randomCountry = data[Math.floor(Math.random() * data.length)]
          fetchCountryDetails(randomCountry)
        }
      })
      .catch(err => {
        console.error('Failed to fetch countries:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = countries

    if (searchQuery) {
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(country => country.region === selectedRegion)
    }

    setFilteredCountries(filtered)
  }, [searchQuery, selectedRegion, countries])

  const regions = ['All', ...new Set(countries.map(c => c.region).filter(Boolean))]

  const handleNext = () => {
    if (!selectedCountry || filteredCountries.length === 0) return
    const currentIndex = filteredCountries.findIndex(c => c.cca2 === selectedCountry.cca2)
    const nextIndex = (currentIndex + 1) % filteredCountries.length
    fetchCountryDetails(filteredCountries[nextIndex])
  }

  const handlePrevious = () => {
    if (!selectedCountry || filteredCountries.length === 0) return
    const currentIndex = filteredCountries.findIndex(c => c.cca2 === selectedCountry.cca2)
    const previousIndex = currentIndex === 0 ? filteredCountries.length - 1 : currentIndex - 1
    fetchCountryDetails(filteredCountries[previousIndex])
  }

  const handleRandom = () => {
    if (filteredCountries.length === 0) return
    const randomCountry = filteredCountries[Math.floor(Math.random() * filteredCountries.length)]
    fetchCountryDetails(randomCountry)
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Learn About Flags</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Explore flags from around the world and learn about different countries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side - Country list */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
            <h3 className="text-lg font-bold mb-4">Countries</h3>

            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {loading ? (
                <p className="text-gray-500 text-sm text-center py-4">Loading...</p>
              ) : filteredCountries.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No countries found</p>
              ) : (
                filteredCountries.map(country => (
                  <button
                    key={country.cca2}
                    onClick={() => fetchCountryDetails(country)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCountry?.cca2 === country.cca2
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-sm font-medium">{country.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Showing {filteredCountries.length} of {countries.length} countries
            </div>
          </div>
        </div>

        {/* Middle - Flag display */}
        <div className="lg:col-span-4">
          {!selectedCountry ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Loading...</h3>
              <p className="text-gray-600">
                Please wait while we load country information
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation buttons */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    {filteredCountries.findIndex(c => c.cca2 === selectedCountry.cca2) + 1} of {filteredCountries.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleRandom}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                >
                  🎲 Random Country
                </button>
              </div>

              {/* Flag display */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-2 text-center">{selectedCountry.name}</h3>

                {/* Pronunciation display */}
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm italic mb-2">
                    {getPronunciation(selectedCountry.name)}
                  </p>
                  <button
                    onClick={() => setShowPronunciation(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-md text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    Hear Pronunciation
                  </button>
                </div>

                <FlagDisplay countryCode={selectedCountry.cca2} blurred={false} />
              </div>
            </div>
          )}
        </div>

        {/* Right side - Country information */}
        <div className="lg:col-span-5">
          {selectedCountry && (
            <div className="space-y-6">
              {/* Country information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-indigo-900">
                  📍 Country Information
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold block text-indigo-900">Region:</span>
                    <span>{selectedCountry.region}</span>
                  </div>
                  {selectedCountry.subregion && (
                    <div>
                      <span className="font-semibold block text-indigo-900">Subregion:</span>
                      <span>{selectedCountry.subregion}</span>
                    </div>
                  )}
                  {selectedCountry.capital && (
                    <div>
                      <span className="font-semibold block text-indigo-900">Capital:</span>
                      <span>{selectedCountry.capital}</span>
                    </div>
                  )}
                  {selectedCountry.population && (
                    <div>
                      <span className="font-semibold block text-indigo-900">Population:</span>
                      <span>{(selectedCountry.population / 1000000).toFixed(1)} million</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold block text-indigo-900">Flag Colors:</span>
                    <span className="capitalize">{selectedCountry.primary_colors?.replace(/,/g, ', ')}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-indigo-900">Has Emblem:</span>
                    <span>{selectedCountry.has_emblem ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedCountry.lat && selectedCountry.lon && (
                    <div>
                      <span className="font-semibold block text-indigo-900">Coordinates:</span>
                      <span>{selectedCountry.lat.toFixed(2)}°, {selectedCountry.lon.toFixed(2)}°</span>
                    </div>
                  )}
                </div>

                {selectedCountry.fun_fact && (
                  <div className="mt-6 pt-4 border-t border-indigo-200">
                    <p className="font-semibold mb-2 text-indigo-900">💡 Did you know?</p>
                    <p className="text-gray-700 italic">{selectedCountry.fun_fact}</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-indigo-200">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(selectedCountry.name + ' country facts')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    🔍 Search more facts about {selectedCountry.name}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Map */}
              {selectedCountry.lat && selectedCountry.lon && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🗺️ Location Map
                  </h3>
                  <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCountry.lon - 10},${selectedCountry.lat - 10},${selectedCountry.lon + 10},${selectedCountry.lat + 10}&layer=mapnik&marker=${selectedCountry.lat},${selectedCountry.lon}`}
                      style={{ border: 0 }}
                      title={`Map of ${selectedCountry.name}`}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selectedCountry.lat}&mlon=${selectedCountry.lon}#map=5/${selectedCountry.lat}/${selectedCountry.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View larger map
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Practice with this country</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Test your knowledge by playing the game modes featuring this country
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/"
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    🎮 Play Mode
                  </a>
                  <a
                    href="/quiz"
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors"
                  >
                    🎯 Quiz Mode
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pronunciation Character */}
      {selectedCountry && (
        <PronunciationCharacter
          show={showPronunciation}
          countryName={selectedCountry.name}
          pronunciation={getPronunciation(selectedCountry.name)}
          onComplete={() => setShowPronunciation(false)}
        />
      )}
    </div>
  )
}

export default Learn
