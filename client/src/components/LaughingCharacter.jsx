import { useEffect, useState } from 'react'

function LaughingCharacter({ show, onComplete }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-20 animate-fade-in" />

      {/* Laughing character */}
      <div className="relative animate-bounce-laugh">
        {/* Main character */}
        <div className="text-center">
          {/* Character face */}
          <div className="text-9xl animate-shake mb-4">
            😂
          </div>

          {/* Speech bubble */}
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 relative animate-pop-in">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-white"></div>
            <p className="text-2xl font-bold text-gray-800 whitespace-nowrap">
              Ha Ha Ha! Try Again!
            </p>
          </div>
        </div>

        {/* Laughing tears */}
        <div className="absolute top-20 left-8 text-4xl animate-tear-fall-left">
          💧
        </div>
        <div className="absolute top-20 right-8 text-4xl animate-tear-fall-right">
          💧
        </div>
      </div>

      {/* Add custom animations via inline style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-10deg); }
          20% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          40% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          60% { transform: rotate(10deg); }
          70% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
          90% { transform: rotate(-10deg); }
        }

        @keyframes bounce-laugh {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-30px) scale(1.1); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(-15px) scale(1.05); }
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

        @keyframes tear-fall-left {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(100px) translateX(-20px); opacity: 0; }
        }

        @keyframes tear-fall-right {
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(100px) translateX(20px); opacity: 0; }
        }

        .animate-shake {
          animation: shake 1s ease-in-out infinite;
        }

        .animate-bounce-laugh {
          animation: bounce-laugh 0.6s ease-in-out 3;
        }

        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }

        .animate-tear-fall-left {
          animation: tear-fall-left 1.5s ease-in forwards;
        }

        .animate-tear-fall-right {
          animation: tear-fall-right 1.5s ease-in forwards;
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  )
}

export default LaughingCharacter
