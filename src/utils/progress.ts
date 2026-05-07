import { badges, levelDefinitions, modules } from '../data/mockData'
import type { LevelDefinition, LevelName } from '../types/domain'

export interface ComputedStats {
  xp: number
  points: number
  level: LevelName
  nextLevel?: LevelDefinition
  completedSubBadges: number
  totalSubBadges: number
}

function flattenSubBadges() {
  return modules.flatMap((module) => module.subBadges)
}

export function calculateStats(completedSubBadgeIds: string[]): ComputedStats {
  const allSubBadges = flattenSubBadges()
  const completed = allSubBadges.filter((subBadge) => completedSubBadgeIds.includes(subBadge.id))

  const xp = completed.reduce((sum, item) => sum + item.xp, 0)
  const points = completed.reduce((sum, item) => sum + item.points, 0)

  const level =
    [...levelDefinitions].reverse().find((candidate) => xp >= candidate.minXp)?.name ?? levelDefinitions[0].name

  const nextLevel = levelDefinitions.find((candidate) => candidate.minXp > xp)

  return {
    xp,
    points,
    level,
    nextLevel,
    completedSubBadges: completed.length,
    totalSubBadges: allSubBadges.length,
  }
}

export function getBadgeProgress(badgeId: string, completedSubBadgeIds: string[]): { completed: number; total: number } {
  const relatedModules = modules.filter((module) => module.badgeId === badgeId)
  const total = relatedModules.reduce((sum, module) => sum + module.subBadges.length, 0)
  const completed = relatedModules
    .flatMap((module) => module.subBadges)
    .filter((subBadge) => completedSubBadgeIds.includes(subBadge.id)).length

  return { completed, total }
}

export function getBadgeTitleById(badgeId: string): string {
  return badges.find((badge) => badge.id === badgeId)?.title ?? 'Unknown Badge'
}
