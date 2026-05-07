// ─── Badge Tier System ──────────────────────────────────────────
// Points thresholds for each of the 5 main badges.
// Points carry across modules and are cumulative.

export interface BadgeTier {
  name: string
  min: number
  max: number | null // null = no cap
  color: string      // CSS color for the tier
  icon: string       // Material symbol
}

export const BADGE_TIERS: BadgeTier[] = [
  { name: 'Bronze',   min: 0,   max: 30,   color: '#cd7f32', icon: 'shield' },
  { name: 'Silver',   min: 31,  max: 70,   color: '#a8b4be', icon: 'shield' },
  { name: 'Gold',     min: 71,  max: 120,  color: '#ffd700', icon: 'shield' },
  { name: 'Platinum', min: 121, max: null,  color: '#6ee7f9', icon: 'diamond' },
]

/** Returns the tier for a given points total */
export function getTier(points: number): BadgeTier {
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (points >= BADGE_TIERS[i].min) return BADGE_TIERS[i]
  }
  return BADGE_TIERS[0]
}

/** Returns progress % towards the *next* tier (100 if max tier reached) */
export function getTierProgress(points: number): number {
  const tier = getTier(points)
  const idx = BADGE_TIERS.indexOf(tier)
  if (idx === BADGE_TIERS.length - 1) return 100 // already at max tier
  const next = BADGE_TIERS[idx + 1]
  const range = next.min - tier.min
  const progress = points - tier.min
  return Math.min(100, Math.round((progress / range) * 100))
}

/** Returns the next tier (or null if already at max) */
export function getNextTier(points: number): BadgeTier | null {
  const tier = getTier(points)
  const idx = BADGE_TIERS.indexOf(tier)
  if (idx === BADGE_TIERS.length - 1) return null
  return BADGE_TIERS[idx + 1]
}

/** Points needed to reach next tier (0 if at max) */
export function pointsToNextTier(points: number): number {
  const next = getNextTier(points)
  if (!next) return 0
  return next.min - points
}

// ─── Mock player badge points ──────────────────────────────────
// In a real app these come from the API. Keyed by badge title.
export const MOCK_PLAYER_POINTS: Record<string, number> = {
  'Game Mastery':        78,
  'Team Work':           45,
  'Esports Citizen':     18,
  'Personal Development': 62,
  'Digital Skills':      33,
}

// ─── Academy groups ────────────────────────────────────────────
export interface AcademyGroup {
  name: string
  game: string
  ageRange: string
  category: 'junior' | 'competitive' | 'media' | 'casual'
  playerCount: number
  coach: string
}

export const ACADEMY_GROUPS: AcademyGroup[] = [
  { name: 'Minecraft Juniors',          game: 'Minecraft',     ageRange: '8-14',  category: 'junior',      playerCount: 14, coach: 'Coach Dave' },
  { name: 'Rocket League Juniors',      game: 'Rocket League', ageRange: '8-14',  category: 'junior',      playerCount: 12, coach: 'Coach Dave' },
  { name: 'Fortnite Juniors',           game: 'Fortnite',      ageRange: '8-14',  category: 'junior',      playerCount: 16, coach: 'Coach Mia' },
  { name: 'Fortnite Competitive',       game: 'Fortnite',      ageRange: '13+',   category: 'competitive', playerCount: 8,  coach: 'Coach Mia' },
  { name: 'Rocket League Competitive',  game: 'Rocket League', ageRange: '13+',   category: 'competitive', playerCount: 6,  coach: 'Coach Dave' },
  { name: 'YEsports Tournament Group',  game: 'Mixed',         ageRange: '13+',   category: 'competitive', playerCount: 10, coach: 'Coach Dave' },
  { name: 'Broadcast & Podcast',        game: 'Media',         ageRange: '13+',   category: 'media',       playerCount: 8,  coach: 'Coach Mia' },
  { name: 'Esports Drop-In',            game: 'Mixed',         ageRange: '8+',    category: 'casual',      playerCount: 18, coach: 'Volunteer' },
  { name: 'Reset & Respawn',            game: 'Mixed',         ageRange: '8+',    category: 'casual',      playerCount: 6,  coach: 'Volunteer' },
]

// ─── Badge category mapping ────────────────────────────────────
export const BADGE_CATEGORIES = [
  { title: 'Game Mastery',         icon: 'sports_esports', image: '/downloaded-images/game-mastery/game-mastery-silver-1.png' },
  { title: 'Team Work',            icon: 'groups',         image: '/downloaded-images/team-work/teamwork-silver.png' },
  { title: 'Esports Citizen',      icon: 'verified_user',  image: '/downloaded-images/esports-citizen/esports-citizen-silver.png' },
  { title: 'Personal Development', icon: 'psychology',     image: '/downloaded-images/personal-development/personal-development-silver.png' },
  { title: 'Digital Skills',       icon: 'terminal',       image: '/downloaded-images/digital-skills/digital-skills-silver.png' },
] as const

// ─── Challenge System ──────────────────────────────────────────
// Each sub-badge can have multiple challenges/activities.
// Players complete challenges and submit them to admin for review.
// Once all challenges in a sub-badge are approved, the sub-badge is awarded.

export type ChallengeStatus = 'not-started' | 'submitted' | 'approved' | 'rejected'

export interface Challenge {
  id: string
  subBadgeUrl: string
  title: string
  description: string
  pts: number
  status: ChallengeStatus
  awardType: 'individual' | 'team'
}

// Mock challenges keyed by sub-badge URL
export const SUB_BADGE_CHALLENGES: Record<string, Omit<Challenge, 'status'>[]> = {
  'https://wymcaesports.co.uk/sub-badge/advanced-mechanics/': [
    { id: 'am-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/advanced-mechanics/', title: 'Perfect Timing Challenge', description: 'Hit 5 consecutive perfect ability procs in a practice session.', pts: 2, awardType: 'individual' },
    { id: 'am-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/advanced-mechanics/', title: 'Movement Optimization', description: 'Complete the obstacle course under 45 seconds.', pts: 2, awardType: 'individual' },
  ],
  'https://wymcaesports.co.uk/sub-badge/analyst/': [
    { id: 'an-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/analyst/', title: 'VOD Breakdown: Positioning', description: "Complete the 'Loss Analysis' lesson and identify 3 positioning errors.", pts: 5, awardType: 'individual' },
    { id: 'an-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/analyst/', title: 'Match Review Presentation', description: 'Present your VOD review findings to the group.', pts: 5, awardType: 'individual' },
  ],
  'https://wymcaesports.co.uk/sub-badge/average-scorer/': [
    { id: 'as-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/average-scorer/', title: 'Average Score Match 1', description: 'Achieve an average score in a competitive match.', pts: 1, awardType: 'individual' },
    { id: 'as-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/average-scorer/', title: 'Average Score Match 2', description: 'Achieve an average score in a 2nd match. Show evidence.', pts: 1, awardType: 'individual' },
    { id: 'as-3', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/average-scorer/', title: 'Average Score Match 3', description: 'Achieve an average score in a 3rd match. Show evidence.', pts: 2, awardType: 'individual' },
  ],
  'https://wymcaesports.co.uk/sub-badge/ggwp/': [
    { id: 'gg-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/ggwp/', title: 'Good Sportsmanship', description: 'Demonstrate good sportsmanship after a competitive match.', pts: 2, awardType: 'individual' },
    { id: 'gg-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/ggwp/', title: 'Positive Comms', description: 'Use positive communication throughout a full team match.', pts: 2, awardType: 'team' },
  ],
  'https://wymcaesports.co.uk/sub-badge/good-sport/': [
    { id: 'gs-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/good-sport/', title: 'Sportsmanship Lesson', description: 'Attend the sportsmanship lesson and complete the quiz.', pts: 5, awardType: 'team' },
    { id: 'gs-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/good-sport/', title: 'Fair Play Demo', description: 'Demonstrate fair play during a tournament match. Coach observed.', pts: 5, awardType: 'individual' },
  ],
  'https://wymcaesports.co.uk/sub-badge/catch-that-moment/': [
    { id: 'ct-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/catch-that-moment/', title: 'Screenshot Challenge', description: 'Take a gameplay screenshot and share with the group.', pts: 1, awardType: 'individual' },
    { id: 'ct-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/catch-that-moment/', title: 'Best Moment', description: 'Capture and describe your best gaming moment of the session.', pts: 2, awardType: 'individual' },
  ],
  'https://wymcaesports.co.uk/sub-badge/activity-planner/': [
    { id: 'ap-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/activity-planner/', title: 'Plan a Team Activity', description: 'Design and write up a team activity plan for your group.', pts: 5, awardType: 'individual' },
    { id: 'ap-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/activity-planner/', title: 'Run the Activity', description: 'Lead and deliver the planned activity with your team.', pts: 5, awardType: 'team' },
  ],
  'https://wymcaesports.co.uk/sub-badge/cheerleader/': [
    { id: 'ch-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/cheerleader/', title: 'Positive Encouragement', description: 'Keep morale high and encourage teammates during a full match.', pts: 3, awardType: 'individual' },
    { id: 'ch-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/cheerleader/', title: 'Team Motivator', description: 'Lead a pre-match team huddle with positive callouts.', pts: 3, awardType: 'team' },
  ],
  'https://wymcaesports.co.uk/sub-badge/communicator/': [
    { id: 'co-1', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/communicator/', title: 'Comms Lesson', description: 'Attend the effective communications lesson.', pts: 5, awardType: 'team' },
    { id: 'co-2', subBadgeUrl: 'https://wymcaesports.co.uk/sub-badge/communicator/', title: 'Comms in Action', description: 'Demonstrate clear callouts and communication during a match.', pts: 5, awardType: 'individual' },
  ],
}

// Mock progress on challenges (which challenges this player has completed/submitted)
export const MOCK_CHALLENGE_STATUS: Record<string, ChallengeStatus> = {
  'am-1': 'approved',
  'am-2': 'approved',
  'an-1': 'submitted',
  'an-2': 'not-started',
  'as-1': 'not-started',
  'as-2': 'not-started',
  'as-3': 'not-started',
  'gg-1': 'approved',
  'gg-2': 'approved',
  'gs-1': 'not-started',
  'gs-2': 'not-started',
  'ct-1': 'approved',
  'ct-2': 'approved',
  'ap-1': 'not-started',
  'ap-2': 'not-started',
  'ch-1': 'not-started',
  'ch-2': 'not-started',
  'co-1': 'not-started',
  'co-2': 'not-started',
}

/** Get challenges for a sub-badge with player status */
export function getChallengesForSubBadge(subBadgeUrl: string): Challenge[] {
  const templates = SUB_BADGE_CHALLENGES[subBadgeUrl] ?? []
  return templates.map(t => ({
    ...t,
    status: MOCK_CHALLENGE_STATUS[t.id] ?? 'not-started',
  }))
}

/** Check if a sub-badge is fully completed (all challenges approved) */
export function isSubBadgeComplete(subBadgeUrl: string): boolean {
  const challenges = getChallengesForSubBadge(subBadgeUrl)
  if (challenges.length === 0) return false
  return challenges.every(c => c.status === 'approved')
}

/** Count approved / total challenges for a sub-badge */
export function getChallengeProgress(subBadgeUrl: string): { approved: number; total: number } {
  const challenges = getChallengesForSubBadge(subBadgeUrl)
  return {
    approved: challenges.filter(c => c.status === 'approved').length,
    total: challenges.length,
  }
}

/** Get all challenges across all sub-badges that are submittable (not-started or rejected) */
export function getSubmittableChallenges(): Challenge[] {
  const all: Challenge[] = []
  for (const url of Object.keys(SUB_BADGE_CHALLENGES)) {
    all.push(...getChallengesForSubBadge(url).filter(c => c.status === 'not-started' || c.status === 'rejected'))
  }
  return all
}

/** Get all submitted challenges awaiting review */
export function getPendingChallenges(): Challenge[] {
  const all: Challenge[] = []
  for (const url of Object.keys(SUB_BADGE_CHALLENGES)) {
    all.push(...getChallengesForSubBadge(url).filter(c => c.status === 'submitted'))
  }
  return all
}
