import { useState, useEffect } from 'react'

function Settings() {
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [pitch, setPitch] = useState(1.1)
  const [rate, setRate] = useState(0.8)
  const [volume, setVolume] = useState(1.0)
  const [testText, setTestText] = useState('India')

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)

      // Load saved settings from localStorage
      const savedSettings = localStorage.getItem('voiceSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setSelectedVoice(settings.voiceName || '')
        setPitch(settings.pitch || 1.1)
        setRate(settings.rate || 0.8)
        setVolume(settings.volume || 1.0)
      } else if (availableVoices.length > 0) {
        // Default to first female voice if available
        const femaleVoice = availableVoices.find(voice =>
          voice.name.includes('Female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Victoria') ||
          voice.name.includes('Zira')
        )
        if (femaleVoice) {
          setSelectedVoice(femaleVoice.name)
        }
      }
    }

    // Load voices immediately if available
    loadVoices()

    // Some browsers load voices asynchronously
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      voiceName: selectedVoice,
      pitch,
      rate,
      volume
    }
    localStorage.setItem('voiceSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  // Test current settings
  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(testText)
      utterance.pitch = pitch
      utterance.rate = rate
      utterance.volume = volume

      if (selectedVoice) {
        const voice = voices.find(v => v.name === selectedVoice)
        if (voice) {
          utterance.voice = voice
        }
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  // Reset to defaults
  const resetSettings = () => {
    setPitch(1.1)
    setRate(0.8)
    setVolume(1.0)

    // Find default female voice
    const femaleVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Victoria') ||
      voice.name.includes('Zira')
    )
    if (femaleVoice) {
      setSelectedVoice(femaleVoice.name)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Voice Settings</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Customize how country pronunciations sound
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Default System Voice</option>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {voices.length} voices available on your system
            </p>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (0.5)</span>
              <span>Normal (1.0)</span>
              <span>High (2.0)</span>
            </div>
          </div>

          {/* Rate (Speed) Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow (0.5x)</span>
              <span>Normal (1.0x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mute (0%)</span>
              <span>Normal (50%)</span>
              <span>Max (100%)</span>
            </div>
          </div>

          {/* Test Section */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Voice
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={testVoice}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                Test
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={saveSettings}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
            >
              💾 Save Settings
            </button>
            <button
              onClick={resetSettings}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md"
            >
              🔄 Reset to Default
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> These settings will be used when you click "Hear Pronunciation" in the Learn mode.
              Your preferences are saved in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
