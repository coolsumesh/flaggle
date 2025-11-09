function Profile() {
  // Placeholder for now - will implement with local storage or backend
  const stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0
  }

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Your Profile</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Games Played" value={stats.gamesPlayed} />
        <StatCard label="Win Rate" value={`${winRate}%`} />
        <StatCard label="Current Streak" value={stats.currentStreak} icon="🔥" />
        <StatCard label="Max Streak" value={stats.maxStreak} icon="⭐" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
        <ul className="space-y-2 text-gray-600">
          <li>📊 Detailed statistics and guess distribution</li>
          <li>🏆 Achievements and milestones</li>
          <li>📈 Performance graphs over time</li>
          <li>🌍 Regional expertise breakdown</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

export default Profile
