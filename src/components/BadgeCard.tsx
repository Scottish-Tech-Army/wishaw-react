import type { Badge } from '../types/domain'
import { ProgressBar } from './ProgressBar'
import { Tooltip } from './Tooltip'

interface BadgeCardProps {
  badge: Badge
  completed: number
  total: number
  xp: number
  level: string
  threshold: string
}

export function BadgeCard({ badge, completed, total, xp, level, threshold }: BadgeCardProps) {
  return (
    <article className="card badge-card">
      <div className="card-head">
        <h3>{badge.title}</h3>
        <span className="level-pill">{level}</span>
      </div>
      <p>{badge.description}</p>
      <div className="badge-meta">
        <span>{xp} XP</span>
        <Tooltip text={`Total XP: ${xp}. ${threshold}`} />
      </div>
      <ProgressBar label="Progress" value={completed} max={total} />
    </article>
  )
}
