import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { badges, centres, evidenceSubmissions, groups, modules, progress, users } from '../data/mockData'
import type {
  Badge,
  Centre,
  EvidenceStatus,
  EvidenceSubmission,
  Group,
  Module,
  User,
  UserProgress,
} from '../types/domain'
import { calculateStats } from '../utils/progress'
import { DEFAULT_LOGIN_PASSWORD } from '../utils/auth'

interface SubmissionInput {
  userId: string
  moduleId: string
  subBadgeId: string
  links: string[]
  fileNames: string[]
  imageNames: string[]
}

interface CreatePlayerInput {
  username: string
  displayName: string
  centreId: string
  groupId?: string
}

interface AppState {
  users: User[]
  centres: Centre[]
  groups: Group[]
  badges: Badge[]
  modules: Module[]
  progress: UserProgress[]
  evidence: EvidenceSubmission[]
  markSubBadgeComplete: (userId: string, subBadgeId: string) => void
  assignModule: (userId: string, moduleId: string) => void
  submitEvidence: (payload: SubmissionInput) => void
  reviewEvidence: (id: string, status: EvidenceStatus, feedback: string) => void
  createCentre: (centre: Centre) => void
  createGroup: (group: Group) => void
  createModule: (module: Module) => void
  createBadge: (badge: Badge) => void
  createPlayer: (payload: CreatePlayerInput) => void
  assignCentreAdmin: (userId: string, centreId: string) => void
  getUserXp: (userId: string) => number
}

function ensureProgress(state: AppState, userId: string): UserProgress {
  return (
    state.progress.find((item) => item.userId === userId) ?? {
      userId,
      activeModuleIds: [],
      completedModuleIds: [],
      completedSubBadgeIds: [],
    }
  )
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users,
      centres,
      groups,
      badges,
      modules,
      progress,
      evidence: evidenceSubmissions,
      markSubBadgeComplete: (userId, subBadgeId) => {
        set((state) => {
          const record = ensureProgress(state, userId)
          const completedSubBadgeIds = Array.from(new Set([...record.completedSubBadgeIds, subBadgeId]))

          const updatedRecord: UserProgress = {
            ...record,
            completedSubBadgeIds,
            completedModuleIds: record.activeModuleIds.filter((moduleId) => {
              const module = state.modules.find((entry) => entry.id === moduleId)
              if (!module) {
                return false
              }
              return module.subBadges.every((subBadge) => completedSubBadgeIds.includes(subBadge.id))
            }),
          }

          updatedRecord.activeModuleIds = updatedRecord.activeModuleIds.filter(
            (moduleId) => !updatedRecord.completedModuleIds.includes(moduleId),
          )

          const others = state.progress.filter((item) => item.userId !== userId)
          return { progress: [...others, updatedRecord] }
        })
      },
      assignModule: (userId, moduleId) => {
        set((state) => {
          const record = ensureProgress(state, userId)
          const updatedRecord: UserProgress = {
            ...record,
            activeModuleIds: Array.from(new Set([...record.activeModuleIds, moduleId])),
          }
          const others = state.progress.filter((item) => item.userId !== userId)
          return { progress: [...others, updatedRecord] }
        })
      },
      submitEvidence: (payload) => {
        set((state) => ({
          evidence: [
            {
              id: `ev-${crypto.randomUUID()}`,
              status: 'pending',
              createdAt: new Date().toISOString(),
              ...payload,
            },
            ...state.evidence,
          ],
        }))
      },
      reviewEvidence: (id, status, feedback) => {
        set((state) => ({
          evidence: state.evidence.map((submission) =>
            submission.id === id ? { ...submission, status, feedback } : submission,
          ),
        }))
      },
      createCentre: (centre) => set((state) => ({ centres: [...state.centres, centre] })),
      createGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
      createModule: (module) => set((state) => ({ modules: [...state.modules, module] })),
      createBadge: (badge) => set((state) => ({ badges: [...state.badges, badge] })),
      createPlayer: (payload) => {
        set((state) => ({
          users: [
            ...state.users,
            {
              id: `u-${crypto.randomUUID()}`,
              role: 'user',
              password: DEFAULT_LOGIN_PASSWORD,
              username: payload.username,
              displayName: payload.displayName,
              centreId: payload.centreId,
              groupId: payload.groupId,
            },
          ],
        }))
      },
      assignCentreAdmin: (userId, centreId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId && user.role === 'centre_admin' ? { ...user, centreId } : user,
          ),
        }))
      },
      getUserXp: (userId) => {
        const record = get().progress.find((entry) => entry.userId === userId)
        if (!record) {
          return 0
        }
        return calculateStats(record.completedSubBadgeIds).xp
      },
    }),
    {
      name: 'wishaw-app-data',
      partialize: (state) => ({
        users: state.users,
        centres: state.centres,
        groups: state.groups,
        badges: state.badges,
        modules: state.modules,
        progress: state.progress,
        evidence: state.evidence,
      }),
    },
  ),
)
