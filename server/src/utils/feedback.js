// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

// Determine region match level
export function getRegionMatch(guessCountry, targetCountry) {
  if (guessCountry.region === targetCountry.region) {
    if (guessCountry.subregion === targetCountry.subregion) {
      return 'same_subregion'
    }
    return 'same_continent'
  }
  return 'different'
}

// Calculate color overlap
export function getColorFeedback(guessColors, targetColors) {
  const guessSet = new Set(guessColors.split(','))
  const targetSet = new Set(targetColors.split(','))

  const feedback = {}
  for (const color of guessSet) {
    feedback[color] = targetSet.has(color)
  }

  return feedback
}

// Calculate overall similarity score (0-100)
export function calculateSimilarity(guessCountry, targetCountry, distance) {
  let score = 0

  // Region match (30 points)
  if (guessCountry.region === targetCountry.region) {
    score += 20
    if (guessCountry.subregion === targetCountry.subregion) {
      score += 10
    }
  }

  // Color overlap (30 points)
  const guessColors = new Set(guessCountry.primary_colors.split(','))
  const targetColors = new Set(targetCountry.primary_colors.split(','))
  const intersection = new Set([...guessColors].filter(x => targetColors.has(x)))
  const union = new Set([...guessColors, ...targetColors])
  const colorScore = (intersection.size / union.size) * 30
  score += Math.round(colorScore)

  // Emblem match (10 points)
  if (guessCountry.has_emblem === targetCountry.has_emblem) {
    score += 10
  }

  // Distance (30 points) - closer is better
  const maxDistance = 20000 // km
  const distanceScore = Math.max(0, (1 - distance / maxDistance) * 30)
  score += Math.round(distanceScore)

  return Math.min(100, Math.max(0, Math.round(score)))
}

// Generate complete feedback for a guess
export function generateFeedback(guessCountry, targetCountry) {
  const distance = calculateDistance(
    guessCountry.lat,
    guessCountry.lon,
    targetCountry.lat,
    targetCountry.lon
  )

  const similarity = calculateSimilarity(guessCountry, targetCountry, distance)

  return {
    region: getRegionMatch(guessCountry, targetCountry),
    colors: getColorFeedback(guessCountry.primary_colors, targetCountry.primary_colors),
    has_emblem: guessCountry.has_emblem === targetCountry.has_emblem,
    similarity,
    distance_km: distance
  }
}
