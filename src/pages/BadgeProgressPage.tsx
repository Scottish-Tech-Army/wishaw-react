import { BadgeCard } from '../components/BadgeCard'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { calculateStats, getBadgeProgress } from '../utils/progress'

export function BadgeProgressPage() {
  const user = useAuthStore((state) => state.user)
  const badges = useAppStore((state) => state.badges)
  const progress = useAppStore((state) => state.progress)

  const playerProgress = progress.find((entry) => entry.userId === user?.id)

  if (!playerProgress) {
    return <p className="card">No progress found.</p>
  }

  const stats = calculateStats(playerProgress.completedSubBadgeIds)

  return (
    <section className="stack-lg">
      <header className="card">
        <h2>Badge and Progress Visualisation</h2>
        <p>
          Level path: Bronze, Silver, Gold, Platinum, and future levels such as Emerald and Diamond.
        </p>
      </header>

      <div className="card-grid">
        {badges.map((badge) => {
          const badgeProgress = getBadgeProgress(badge.id, playerProgress.completedSubBadgeIds)
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              completed={badgeProgress.completed}
              total={badgeProgress.total}
              xp={stats.xp}
              level={stats.level}
              threshold={
                stats.nextLevel
                  ? `Next level threshold: ${stats.nextLevel.name} at ${stats.nextLevel.minXp} XP`
                  : 'Top level reached'
              }
            />
          )
        })}
      </div>
    </section>
  )
}
