import { useEffect, useState } from 'react'

function PronunciationCharacter({ show, countryName, pronunciation, onComplete }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)

      // Function to speak with voice settings
      const speakWithVoiceSettings = () => {
        if ('speechSynthesis' in window) {
          // Load saved settings from localStorage
          const savedSettings = localStorage.getItem('voiceSettings')
          let pitch = 1.1
          let rate = 0.8
          let volume = 1.0
          let selectedVoiceName = null

          if (savedSettings) {
            const settings = JSON.parse(savedSettings)
            pitch = settings.pitch || 1.1
            rate = settings.rate || 0.8
            volume = settings.volume || 1.0
            selectedVoiceName = settings.voiceName
          }

          const utterance = new SpeechSynthesisUtterance(countryName)
          utterance.rate = rate
          utterance.pitch = pitch
          utterance.volume = volume

          // Get voices and select the appropriate voice
          const voices = window.speechSynthesis.getVoices()

          if (selectedVoiceName) {
            // Use the user's selected voice
            const selectedVoice = voices.find(voice => voice.name === selectedVoiceName)
            if (selectedVoice) {
              utterance.voice = selectedVoice
            }
          } else {
            // Default to female voice if no preference saved
            const femaleVoice = voices.find(voice =>
              voice.name.includes('Female') ||
              voice.name.includes('Samantha') ||
              voice.name.includes('Victoria') ||
              voice.name.includes('Zira') ||
              voice.name.includes('woman') ||
              voice.gender === 'female'
            )

            if (femaleVoice) {
              utterance.voice = femaleVoice
            }
          }

          window.speechSynthesis.speak(utterance)
        }
      }

      // Wait for voices to load before speaking
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices()

        if (voices.length > 0) {
          // Voices already loaded
          speakWithVoiceSettings()
        } else {
          // Wait for voices to load
          const voicesChangedHandler = () => {
            speakWithVoiceSettings()
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler)
          }
          window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler)
        }
      }

      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.speechSynthesis?.cancel()
      }
    }
  }, [show, countryName, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-20 animate-fade-in" />

      {/* Pronunciation character */}
      <div className="relative animate-bounce-speak">
        {/* Main character */}
        <div className="text-center">
          {/* Character face - Female Teacher/Speaker */}
          <div className="text-9xl animate-talk mb-4">
            👩‍🏫
          </div>

          {/* Speech bubble */}
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 relative animate-pop-in max-w-md">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-white"></div>
            <p className="text-3xl font-bold text-primary mb-2">
              {countryName}
            </p>
            <p className="text-lg text-gray-600 italic">
              {pronunciation}
            </p>
          </div>
        </div>

        {/* Sound waves */}
        <div className="absolute top-16 -left-16 text-3xl animate-wave-left">
          🔊
        </div>
        <div className="absolute top-16 -right-16 text-3xl animate-wave-right">
          🔊
        </div>
      </div>

      {/* Add custom animations via inline style */}
      <style>{`
        @keyframes talk {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05) rotate(-3deg); }
          50% { transform: scale(1.1) rotate(3deg); }
          75% { transform: scale(1.05) rotate(-3deg); }
        }

        @keyframes bounce-speak {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-20px) scale(1.05); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(-10px) scale(1.02); }
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes wave-left {
          0% { transform: translateX(0) scale(0.5); opacity: 0.5; }
          50% { transform: translateX(-30px) scale(1); opacity: 1; }
          100% { transform: translateX(-60px) scale(0.5); opacity: 0; }
        }

        @keyframes wave-right {
          0% { transform: translateX(0) scale(0.5); opacity: 0.5; }
          50% { transform: translateX(30px) scale(1); opacity: 1; }
          100% { transform: translateX(60px) scale(0.5); opacity: 0; }
        }

        .animate-talk {
          animation: talk 1s ease-in-out infinite;
        }

        .animate-bounce-speak {
          animation: bounce-speak 0.6s ease-in-out 4;
        }

        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }

        .animate-wave-left {
          animation: wave-left 1.5s ease-out infinite;
        }

        .animate-wave-right {
          animation: wave-right 1.5s ease-out infinite;
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  )
}

export default PronunciationCharacter
