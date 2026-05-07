import { useMemo, useState } from 'react'
import { DataTable } from '../components/DataTable'
import { useAppStore } from '../store/appStore'
import { calculateStats, getBadgeTitleById } from '../utils/progress'

interface LeaderboardRow {
  player: string
  centre: string
  xp: number
  completedModules: number
  topBadge: string
}

export function LeaderboardPage() {
  const [showGlobal, setShowGlobal] = useState(false)
  const [selectedCentre, setSelectedCentre] = useState('all')
  const users = useAppStore((state) => state.users)
  const progress = useAppStore((state) => state.progress)
  const centres = useAppStore((state) => state.centres)
  const modules = useAppStore((state) => state.modules)

  const rows = useMemo<LeaderboardRow[]>(() => {
    const players = users.filter((user) => user.role === 'user')
    return players
      .filter((player) => showGlobal || selectedCentre === 'all' || player.centreId === selectedCentre)
      .map((player) => {
        const playerProgress = progress.find((entry) => entry.userId === player.id)
        const completedSubBadgeIds = playerProgress?.completedSubBadgeIds ?? []
        const stats = calculateStats(completedSubBadgeIds)
        const topModule = modules.find((module) =>
          module.subBadges.some((subBadge) => completedSubBadgeIds.includes(subBadge.id)),
        )
        return {
          player: player.displayName,
          centre: centres.find((centre) => centre.id === player.centreId)?.name ?? 'Unknown',
          xp: stats.xp,
          completedModules: playerProgress?.completedModuleIds.length ?? 0,
          topBadge: topModule ? getBadgeTitleById(topModule.badgeId) : 'None yet',
        }
      })
      .sort((a, b) => b.xp - a.xp)
  }, [centres, modules, progress, selectedCentre, showGlobal, users])

  return (
    <section className="stack-lg">
      <header className="card">
        <h2>Leaderboards</h2>
        <div className="filters-row">
          <label>
            Scope
            <select value={showGlobal ? 'global' : 'centre'} onChange={(event) => setShowGlobal(event.target.value === 'global')}>
              <option value="centre">Centre leaderboard</option>
              <option value="global">Global leaderboard</option>
            </select>
          </label>
          <label>
            Centre filter
            <select value={selectedCentre} onChange={(event) => setSelectedCentre(event.target.value)}>
              <option value="all">All centres</option>
              {centres.map((centre) => (
                <option key={centre.id} value={centre.id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <DataTable
        title="XP and Module Rankings"
        rows={rows}
        columns={[
          { key: 'player', label: 'Player' },
          { key: 'centre', label: 'Centre' },
          { key: 'xp', label: 'Total XP' },
          { key: 'completedModules', label: 'Completed Modules' },
          { key: 'topBadge', label: 'Top Badge Category' },
        ]}
      />
    </section>
  )
}
