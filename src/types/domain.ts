export type Role = 'main_admin' | 'centre_admin' | 'user'

export type LevelName =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Emerald'
  | 'Diamond'

export interface LevelDefinition {
  name: LevelName
  minXp: number
}

export interface Centre {
  id: string
  name: string
  region: string
}

export interface Group {
  id: string
  centreId: string
  name: string
}

export interface User {
  id: string
  username: string
  password: string
  displayName: string
  role: Role
  centreId: string
  groupId?: string
  avatarUrl?: string
}

export interface Badge {
  id: string
  title: string
  description: string
}

export interface SubBadge {
  id: string
  title: string
  points: number
  xp: number
  skills: string[]
}

export interface ModuleResource {
  id: string
  type: 'pdf' | 'ppt' | 'video' | 'link'
  title: string
  url: string
}

export interface Module {
  id: string
  badgeId: string
  title: string
  description: string
  learningOutcomes: string[]
  subBadges: SubBadge[]
  resources: ModuleResource[]
}

export interface UserProgress {
  userId: string
  activeModuleIds: string[]
  completedModuleIds: string[]
  completedSubBadgeIds: string[]
}

export type EvidenceStatus = 'pending' | 'approved' | 'rejected'

export interface EvidenceSubmission {
  id: string
  userId: string
  moduleId: string
  subBadgeId: string
  links: string[]
  fileNames: string[]
  imageNames: string[]
  status: EvidenceStatus
  feedback?: string
  createdAt: string
}

export interface SessionTokenPayload {
  sub: string
  role: Role
  exp: number
}
