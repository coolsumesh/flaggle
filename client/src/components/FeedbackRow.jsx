function FeedbackRow({ guess }) {
  const { country, feedback } = guess

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Country name and similarity score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h4 className="font-bold text-lg">{country}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-600">Similarity:</span>
          <span className="bg-primary text-white px-3 py-1 rounded-full font-bold text-sm">
            {feedback.similarity}%
          </span>
        </div>
      </div>

      {/* Feedback details */}
      <div className="space-y-2">
        {/* Region feedback */}
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
          <span className="text-sm text-gray-600 min-w-[80px]">Region:</span>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${
            feedback.region === 'exact' ? 'bg-correct text-white' :
            feedback.region === 'same_continent' ? 'bg-present text-white' :
            'bg-absent text-white'
          }`}>
            {feedback.region === 'exact' ? '✓ Match' :
             feedback.region === 'same_continent' ? '~ Continent' :
             '✗ Different'}
          </span>
        </div>

        {/* Distance */}
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
          <span className="text-sm text-gray-600 min-w-[80px]">Distance:</span>
          <span className="font-semibold text-gray-800 text-sm">
            {feedback.distance_km.toLocaleString()} km
          </span>
        </div>

        {/* Emblem */}
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
          <span className="text-sm text-gray-600 min-w-[80px]">Emblem:</span>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${
            feedback.has_emblem ? 'bg-correct text-white' : 'bg-absent text-white'
          }`}>
            {feedback.has_emblem ? '✓ Yes' : '✗ No'}
          </span>
        </div>
      </div>

      {/* Color chips */}
      {feedback.colors && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-gray-600 font-semibold min-w-[80px]">Colors:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(feedback.colors).map(([color, present]) => (
                <div
                  key={color}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    present ? 'bg-correct text-white' : 'bg-absent text-white'
                  }`}
                >
                  {color}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackRow
