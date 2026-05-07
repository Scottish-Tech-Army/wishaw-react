import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ModuleCard } from '../components/ModuleCard'
import { ProgressBar } from '../components/ProgressBar'
import { StatCard } from '../components/StatCard'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { calculateStats } from '../utils/progress'

export function PlayerDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const modules = useAppStore((state) => state.modules)
  const progress = useAppStore((state) => state.progress)

  const playerProgress = useMemo(
    () => progress.find((entry) => entry.userId === user?.id),
    [progress, user?.id],
  )

  if (!user || !playerProgress) {
    return <p className="card">No player profile found.</p>
  }

  const stats = calculateStats(playerProgress.completedSubBadgeIds)
  const activeModules = modules.filter((module) => playerProgress.activeModuleIds.includes(module.id))
  const completedModules = modules.filter((module) => playerProgress.completedModuleIds.includes(module.id))

  return (
    <section className="stack-lg">
      <div className="card profile-card">
        <div className="avatar" aria-hidden="true">
          {user.displayName.slice(0, 1)}
        </div>
        <div>
          <h2>{user.displayName}</h2>
          <p>Current level: {stats.level}</p>
          <p>
            Total XP: {stats.xp}
            {stats.nextLevel ? ` (Next ${stats.nextLevel.name} at ${stats.nextLevel.minXp})` : ''}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Current Level" value={stats.level} />
        <StatCard label="XP" value={stats.xp.toString()} subtext={`${stats.points} points`} />
        <StatCard label="Completed Modules" value={completedModules.length.toString()} />
        <StatCard label="Completed Sub-badges" value={`${stats.completedSubBadges}/${stats.totalSubBadges}`} />
      </div>

      <section className="card stack-sm">
        <h3>Overall Badge Progress (5 Main Badges)</h3>
        <ProgressBar label="Total completion" value={stats.completedSubBadges} max={stats.totalSubBadges} />
      </section>

      <section className="stack-sm">
        <div className="section-title-row">
          <h3>Active Modules</h3>
          <Link to="/badges" className="text-link">
            View full badge progress
          </Link>
        </div>
        <div className="card-grid">
          {activeModules.map((module) => (
            <ModuleCard key={module.id} module={module} isCompleted={false} />
          ))}
          {activeModules.length === 0 ? <p className="card">No active modules assigned.</p> : null}
        </div>
      </section>

      <section className="stack-sm">
        <h3>Completed Modules</h3>
        <div className="card-grid">
          {completedModules.map((module) => (
            <ModuleCard key={module.id} module={module} isCompleted />
          ))}
          {completedModules.length === 0 ? <p className="card">No modules completed yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
