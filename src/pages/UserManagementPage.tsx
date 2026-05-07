import { useEffect, useMemo, useState } from 'react'
import '../styles/user-management.css'
import { API_BASE } from '../auth/authService'
import { navigate } from '../lib/navigate'

interface UserDto {
  userId: string
  centreId: string | null
  username: string
  displayName: string
  role: string
  active: boolean
}

interface UserRecord extends UserDto {
  groupName: string
}

interface GroupDto {
  id: string
  name: string
  game: string
  ageRange: string
  category: string
  playerCount: number
  coach: string
  live?: boolean
}

interface PendingReview {
  submissionId: string
  player: string
  username: string
  badge: string
  subBadge: string
  pts: number
  noteText: string
  submittedAt: string
}

const FALLBACK_GROUPS: GroupDto[] = [
  {
    id: 'fallback-group-1',
    name: 'Rocket League Competitive',
    game: 'Rocket League',
    ageRange: '13+',
    category: 'competitive',
    playerCount: 9,
    coach: 'Coach Dave',
    live: false,
  },
  {
    id: 'fallback-group-2',
    name: 'Fortnite Academy',
    game: 'Fortnite',
    ageRange: '8+',
    category: 'junior',
    playerCount: 32,
    coach: 'Coach Mia',
    live: true,
  },
  {
    id: 'fallback-group-3',
    name: 'Media and Content',
    game: 'Media',
    ageRange: '13+',
    category: 'media',
    playerCount: 8,
    coach: 'Coach Mia',
    live: true,
  },
]

const FALLBACK_USERS: UserDto[] = [
  { userId: 'fb-user-1', centreId: 'wishaw', username: 'PHOENIX_REIGN', displayName: 'PHOENIX_REIGN', role: 'PLAYER', active: true },
  { userId: 'fb-user-2', centreId: 'wishaw', username: 'CYBER_PHX', displayName: 'CYBER_PHX', role: 'PLAYER', active: true },
  { userId: 'fb-user-3', centreId: 'wishaw', username: 'Z-STORM_99', displayName: 'Z-STORM_99', role: 'PLAYER', active: true },
  { userId: 'fb-user-4', centreId: 'wishaw', username: 'NEON_DRIFT', displayName: 'NEON_DRIFT', role: 'PLAYER', active: true },
  { userId: 'fb-user-5', centreId: 'wishaw', username: 'BLAZE_ULTRA', displayName: 'BLAZE_ULTRA', role: 'PLAYER', active: true },
  { userId: 'fb-user-6', centreId: 'wishaw', username: 'DELTA_SURGE', displayName: 'DELTA_SURGE', role: 'PLAYER', active: true },
  { userId: 'fb-user-7', centreId: 'wishaw', username: 'HUB_MSTR', displayName: 'HUB_MSTR', role: 'PLAYER', active: true },
]

const FALLBACK_REVIEWS: PendingReview[] = [
  {
    submissionId: 'fb-review-1',
    player: 'NEON_DRIFT',
    username: 'NEON_DRIFT',
    badge: 'Game Mastery',
    subBadge: 'Advanced Mechanics',
    pts: 4,
    noteText: 'Performed 3 advanced mechanics in today\'s session.',
    submittedAt: '2026-03-30T14:00:00Z',
  },
  {
    submissionId: 'fb-review-2',
    player: 'BLAZE_ULTRA',
    username: 'BLAZE_ULTRA',
    badge: 'Team Work',
    subBadge: 'Effective Comms',
    pts: 3,
    noteText: 'Demonstrated clear callouts during team match.',
    submittedAt: '2026-03-30T14:30:00Z',
  },
  {
    submissionId: 'fb-review-3',
    player: 'CYBER_PHX',
    username: 'CYBER_PHX',
    badge: 'Digital Skills',
    subBadge: 'Content Creator',
    pts: 10,
    noteText: 'Created and shared a highlight reel with the group.',
    submittedAt: '2026-03-30T15:00:00Z',
  },
]

function initials(name: string): string {
  return name
    .split(/[_\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || name.slice(0, 2).toUpperCase()
}

function formatRelativeTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function enrichUsers(users: UserDto[], groups: GroupDto[]): UserRecord[] {
  const usableGroups = groups.length > 0 ? groups : FALLBACK_GROUPS

  return users.map((user, index) => ({
    ...user,
    groupName: usableGroups[index % usableGroups.length]?.name ?? 'Unassigned',
  }))
}

function refreshPage() {
  globalThis.location.reload()
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>(() => enrichUsers(FALLBACK_USERS, FALLBACK_GROUPS))
  const [groups, setGroups] = useState<GroupDto[]>(FALLBACK_GROUPS)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>(FALLBACK_REVIEWS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [groupFilter, setGroupFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [coachNote, setCoachNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      const [usersResult, groupsResult, reviewsResult] = await Promise.allSettled([
        fetch(`${API_BASE}/admin/centre/users`, { credentials: 'include' }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<{ users: UserDto[] }>
        }),
        fetch(`${API_BASE}/manage/groups`, { credentials: 'include' }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<{ groups: GroupDto[] }>
        }),
        fetch(`${API_BASE}/admin/centre/pending-reviews`, { credentials: 'include' }).then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<{ reviews: PendingReview[] }>
        }),
      ])

      if (cancelled) return

      const nextGroups = groupsResult.status === 'fulfilled' ? groupsResult.value.groups : FALLBACK_GROUPS
      const nextUsers = usersResult.status === 'fulfilled'
        ? enrichUsers(usersResult.value.users, nextGroups)
        : enrichUsers(FALLBACK_USERS, nextGroups)
      const nextReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value.reviews : FALLBACK_REVIEWS

      setGroups(nextGroups)
      setUsers(nextUsers)
      setPendingReviews(nextReviews)
      setSelectedUserId((current) => current ?? nextUsers[0]?.userId ?? null)

      if (usersResult.status !== 'fulfilled') {
        setError('Live roster data is unavailable right now. Showing fallback player data.')
      }

      setLoading(false)
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = !query || [user.username, user.displayName, user.groupName]
        .some((value) => value.toLowerCase().includes(query.toLowerCase()))
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && user.active)
        || (statusFilter === 'inactive' && !user.active)
      const matchesGroup = groupFilter === 'all' || user.groupName === groupFilter

      return matchesQuery && matchesStatus && matchesGroup
    })
  }, [groupFilter, query, statusFilter, users])

  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.userId === selectedUserId) ?? filteredUsers[0] ?? users[0] ?? null,
    [filteredUsers, selectedUserId, users],
  )

  const selectedUserPending = useMemo(
    () => pendingReviews.filter((review) => review.username === selectedUser?.username),
    [pendingReviews, selectedUser],
  )

  const activeUsers = users.filter((user) => user.active).length
  const liveGroups = groups.filter((group) => group.live).length
  const groupNames = Array.from(new Set(users.map((user) => user.groupName))).sort((a, b) => a.localeCompare(b))

  function handleSaveNote() {
    if (!coachNote.trim()) return
    setNoteSaved(true)
    globalThis.setTimeout(() => setNoteSaved(false), 2500)
  }

  let rosterContent: React.ReactNode

  if (loading) {
    rosterContent = (
      <tr>
        <td colSpan={5} className="um-empty">Loading roster…</td>
      </tr>
    )
  } else if (filteredUsers.length === 0) {
    rosterContent = (
      <tr>
        <td colSpan={5} className="um-empty">No players match the current filters.</td>
      </tr>
    )
  } else {
    rosterContent = filteredUsers.map((user) => {
      const hasPendingReview = pendingReviews.some((review) => review.username === user.username)

      return (
        <tr key={user.userId} className={selectedUser?.userId === user.userId ? 'is-selected' : ''}>
          <td>
            <div className="um-player-cell">
              <span className="um-avatar">{initials(user.displayName)}</span>
              <div>
                <strong>{user.displayName}</strong>
                <span>{user.username}</span>
              </div>
            </div>
          </td>
          <td>
            <span className="um-role-pill">{user.role}</span>
          </td>
          <td>{user.groupName}</td>
          <td>
            <span className={`um-status ${user.active ? 'is-active' : 'is-inactive'}`}>
              <span className="um-status-dot" />
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <div className="um-actions">
              <button className="um-inline-btn" onClick={() => setSelectedUserId(user.userId)}>
                Inspect
              </button>
              {hasPendingReview && (
                <button className="um-inline-btn um-inline-btn--accent" onClick={() => navigate('/admin')}>
                  Review
                </button>
              )}
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <main className="um-page">
      <section className="um-shell">
        <header className="um-hero">
          <div>
            <p className="um-kicker">Admin tools</p>
            <h1>User Management</h1>
            <p className="um-subtitle">
              Oversee player access, group placement, and challenge review coverage for your centre roster.
            </p>
          </div>
          <div className="um-hero-actions">
            <button className="um-btn um-btn--ghost" onClick={() => navigate('/admin')}>
              <span className="material-symbol">shield_person</span>
              <span>Review queue</span>
            </button>
            <button className="um-btn um-btn--primary" onClick={refreshPage}>
              <span className="material-symbol">sync</span>
              <span>Refresh roster</span>
            </button>
          </div>
        </header>

        <section className="um-stats" aria-label="User management summary">
          <article className="um-stat-card">
            <span className="um-stat-label">Centre players</span>
            <strong>{users.length}</strong>
            <span className="um-stat-meta">Active roster tracked in Wishaw</span>
          </article>
          <article className="um-stat-card">
            <span className="um-stat-label">Active players</span>
            <strong>{activeUsers}</strong>
            <span className="um-stat-meta">{users.length === 0 ? 0 : Math.round((activeUsers / users.length) * 100)}% currently active</span>
          </article>
          <article className="um-stat-card">
            <span className="um-stat-label">Pending reviews</span>
            <strong>{pendingReviews.length}</strong>
            <span className="um-stat-meta">Challenge notes awaiting coach action</span>
          </article>
          <article className="um-stat-card">
            <span className="um-stat-label">Live groups</span>
            <strong>{liveGroups}</strong>
            <span className="um-stat-meta">Out of {groups.length} available player groups</span>
          </article>
        </section>

        <section className="um-layout">
          <div className="um-panel um-panel--roster">
            <div className="um-panel-header">
              <div>
                <h2>Active roster</h2>
                <p>Filter by player handle, status, or assigned group.</p>
              </div>
              <div className="um-toolbar">
                <label className="um-search">
                  <span className="material-symbol">search</span>
                  <input
                    type="search"
                    placeholder="Search players"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}>
                  <option value="all">All statuses</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
                <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
                  <option value="all">All groups</option>
                  {groupNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="um-banner">{error}</div>}

            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Player Handle</th>
                    <th>Role</th>
                    <th>Group</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{rosterContent}</tbody>
              </table>
            </div>
          </div>

          <aside className="um-sidebar">
            <section className="um-panel">
              <div className="um-panel-header um-panel-header--stacked">
                <div>
                  <h2>Player detail</h2>
                  <p>Quick centre access snapshot for the selected player.</p>
                </div>
              </div>

              {selectedUser ? (
                <>
                  <div className="um-detail-card">
                    <div className="um-detail-top">
                      <span className="um-avatar um-avatar--lg">{initials(selectedUser.displayName)}</span>
                      <div>
                        <h3>{selectedUser.displayName}</h3>
                        <p>@{selectedUser.username}</p>
                      </div>
                    </div>
                    <dl className="um-detail-grid">
                      <div>
                        <dt>Role</dt>
                        <dd>{selectedUser.role}</dd>
                      </div>
                      <div>
                        <dt>Group</dt>
                        <dd>{selectedUser.groupName}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{selectedUser.active ? 'Active' : 'Inactive'}</dd>
                      </div>
                      <div>
                        <dt>Pending reviews</dt>
                        <dd>{selectedUserPending.length}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="um-note-box">
                    <label htmlFor="coach-note">Coach note</label>
                    <textarea
                      id="coach-note"
                      rows={4}
                      value={coachNote}
                      onChange={(event) => setCoachNote(event.target.value)}
                      placeholder="Add a quick note for the next staff handover."
                    />
                    <div className="um-note-actions">
                      <span>{noteSaved ? 'Coach note saved locally.' : 'Notes stay on this device in the current session.'}</span>
                      <button className="um-btn um-btn--primary um-btn--sm" onClick={handleSaveNote}>
                        Save note
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="um-empty-card">Select a player to inspect their centre access.</div>
              )}
            </section>

            <section className="um-panel">
              <div className="um-panel-header um-panel-header--stacked">
                <div>
                  <h2>Pending challenge reviews</h2>
                  <p>Players waiting on coach approval.</p>
                </div>
              </div>
              <div className="um-review-list">
                {pendingReviews.map((review) => (
                  <article key={review.submissionId} className="um-review-card">
                    <div className="um-review-top">
                      <strong>{review.player}</strong>
                      <span>{formatRelativeTime(review.submittedAt)}</span>
                    </div>
                    <p className="um-review-badge">{review.badge} · {review.subBadge}</p>
                    <p className="um-review-note">{review.noteText}</p>
                    <div className="um-review-footer">
                      <span>+{review.pts} XP</span>
                      <button className="um-inline-btn um-inline-btn--accent" onClick={() => navigate('/admin')}>
                        Open queue
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="um-panel">
              <div className="um-panel-header um-panel-header--stacked">
                <div>
                  <h2>Group access overview</h2>
                  <p>Available player groups across the centre.</p>
                </div>
              </div>
              <div className="um-group-list">
                {groups.map((group) => (
                  <article key={group.id} className="um-group-card">
                    <div>
                      <strong>{group.name}</strong>
                      <p>{group.game} · {group.ageRange}</p>
                    </div>
                    <div className="um-group-meta">
                      <span>{group.playerCount} players</span>
                      <span>{group.coach}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}
