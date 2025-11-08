function FlagDisplay({ countryCode, blurred }) {
  if (!countryCode && blurred) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg flex items-center justify-center">
          <span className="text-6xl">🚩</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className={`relative w-full max-w-md aspect-[3/2] ${blurred ? 'blur-xl' : ''}`}>
        <img
          src={`https://flagcdn.com/w640/${countryCode?.toLowerCase()}.png`}
          alt="Flag"
          className="w-full h-full object-cover rounded-lg shadow-lg"
          onError={(e) => {
            // Fallback to placeholder if flag not found
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="213"><rect width="320" height="213" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="48">🚩</text></svg>'
          }}
        />
      </div>
    </div>
  )
}

export default FlagDisplay
