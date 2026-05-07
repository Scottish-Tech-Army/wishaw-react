import { API_BASE } from '../auth/authService'

// ─── DTO types matching the backend /badges/manage endpoints ──────────────────

export interface BadgeDto {
  badgeId: string
  title: string
  description: string
  image: string | null
  icon: string
  sequentialUnlock: boolean
  subBadgeCount: number
}

export interface BadgeDetailDto extends BadgeDto {
  subBadges: SubBadgeDto[]
}

export interface SubBadgeDto {
  subBadgeId: string
  badgeId: string
  title: string
  info: string
  description: string
  category: string
  xp: number
  image: string | null
  sortOrder: number
  challengeCount: number
}

export interface SubBadgeDetailDto extends SubBadgeDto {
  challenges: ChallengeDto[]
}

export interface ChallengeDto {
  challengeId: string
  subBadgeId: string
  title: string
  description: string
  pts: number
  sortOrder: number
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════════════════════

export function listBadges(): Promise<BadgeDto[]> {
  return apiFetch('/badges/manage')
}

export function getBadge(badgeId: string): Promise<BadgeDetailDto> {
  return apiFetch(`/badges/manage/${badgeId}`)
}

export function createBadge(body: {
  title: string
  description?: string
  icon?: string
  sequentialUnlock?: boolean
}): Promise<BadgeDto> {
  return apiFetch('/badges/manage', { method: 'POST', body: JSON.stringify(body) })
}

export function updateBadge(
  badgeId: string,
  body: { title?: string; description?: string; icon?: string; sequentialUnlock?: boolean },
): Promise<BadgeDto> {
  return apiFetch(`/badges/manage/${badgeId}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteBadge(badgeId: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/badges/manage/${badgeId}`, { method: 'DELETE' })
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-BADGES
// ═══════════════════════════════════════════════════════════════════════════════

export function listSubBadges(badgeId: string): Promise<SubBadgeDto[]> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges`)
}

export function getSubBadge(badgeId: string, subBadgeId: string): Promise<SubBadgeDetailDto> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}`)
}

export function createSubBadge(
  badgeId: string,
  body: { title: string; description?: string; info?: string; xp?: number },
): Promise<SubBadgeDto> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges`, { method: 'POST', body: JSON.stringify(body) })
}

export function updateSubBadge(
  badgeId: string,
  subBadgeId: string,
  body: { title?: string; description?: string; info?: string; xp?: number; sortOrder?: number },
): Promise<SubBadgeDto> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteSubBadge(badgeId: string, subBadgeId: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}`, { method: 'DELETE' })
}

export function reorderSubBadges(badgeId: string, order: string[]): Promise<SubBadgeDto[]> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges-order`, { method: 'PUT', body: JSON.stringify({ order }) })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHALLENGES
// ═══════════════════════════════════════════════════════════════════════════════

export function listChallenges(badgeId: string, subBadgeId: string): Promise<ChallengeDto[]> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}/challenges`)
}

export function createChallenge(
  badgeId: string,
  subBadgeId: string,
  body: { title: string; description?: string; pts?: number },
): Promise<ChallengeDto> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}/challenges`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateChallenge(
  badgeId: string,
  subBadgeId: string,
  challengeId: string,
  body: { title?: string; description?: string; pts?: number },
): Promise<ChallengeDto> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}/challenges/${challengeId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteChallenge(
  badgeId: string,
  subBadgeId: string,
  challengeId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch(`/badges/manage/${badgeId}/sub-badges/${subBadgeId}/challenges/${challengeId}`, {
    method: 'DELETE',
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL TREE  — fetches all badges with nested sub-badges + challenges in one go
// ═══════════════════════════════════════════════════════════════════════════════

export interface BadgeTree {
  badgeId: string
  title: string
  description: string
  icon: string
  sequentialUnlock: boolean
  subBadges: {
    subBadgeId: string
    badgeId: string
    title: string
    description: string
    info: string
    xp: number
    sortOrder: number
    challengeCount: number
    challenges: ChallengeDto[]
  }[]
}

/**
 * Loads the full badge tree by fetching each badge's detail endpoint.
 * Falls back to using the public /badges endpoint which already returns the full tree.
 */
export async function loadFullBadgeTree(): Promise<BadgeTree[]> {
  // The public GET /badges returns the full nested tree
  return apiFetch<BadgeTree[]>('/badges')
}
