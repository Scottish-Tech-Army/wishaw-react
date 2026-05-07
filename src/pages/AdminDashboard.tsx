import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { ACADEMY_GROUPS, BADGE_TIERS, BADGE_CATEGORIES, getTier, MOCK_PLAYER_POINTS } from '../lib/badge-tiers'
import { API_BASE } from '../auth/authService'
import { navigate } from '../lib/navigate'

interface TierDto {
  id: string
  name: string
  minPts: number
  maxPts: number | null
  colour: string
  label: string
}

interface LeaderboardRow {
  rank: number
  username: string
  displayName: string
  totalXp: number
  centreName: string | null
  topBadge: string | null
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

interface GroupDto {
  id: string
  name: string
  game: string
  ageRange: string
  category: string
  playerCount: number
  coach: string
  label?: string
  labelVariant?: string
  members?: number
  maxMembers?: number | null
  schedule?: string | null
  description?: string
  icon?: string
  featured?: boolean
  live?: boolean
}

interface BadgeOverviewCategory {
  id: string
  title: string
  description: string
  pts: number
  tier: {
    name: string
    colour: string
  }
}

/** Tier-specific badge images from /public/downloaded-images/badges/ */
const BADGE_TIER_IMAGES: Record<string, Record<string, string>> = {
  'Game Mastery': {
    bronze: '/downloaded-images/badges/game-mastry-bronze-.png',
    silver: '/downloaded-images/badges/game-mastry-silver.png',
    gold:   '/downloaded-images/badges/game-mastry-gold.png',
  },
  'Team Work': {
    bronze: '/downloaded-images/badges/team-work-bronze.png',
    silver: '/downloaded-images/badges/team-work-silver.png',
    gold:   '/downloaded-images/badges/team-work-gold.png',
  },
  'Esports Citizen': {
    bronze: '/downloaded-images/badges/esports-citizen-bronze.png',
    silver: '/downloaded-images/badges/esports-citizen-silver.png',
    gold:   '/downloaded-images/badges/esports-citizen-gold.png',
  },
  'Personal Development': {
    bronze: '/downloaded-images/badges/personal-development-bronze.png',
    silver: '/downloaded-images/badges/personal-development-silver.png',
    gold:   '/downloaded-images/badges/personal-development-gold.png',
  },
  'Digital Skills': {
    bronze: '/downloaded-images/badges/digitatl-skills-bronze.png',
    silver: '/downloaded-images/badges/digitatl-skills-silver.png',
    gold:   '/downloaded-images/badges/digitatl-skills-gold.png',
  },
}

const FALLBACK_LEADERBOARD = [
  { rank: 1, username: 'PHOENIX_REIGN', displayName: 'PHOENIX_REIGN', totalXp: 236, centreName: 'Wishaw', topBadge: null },
  { rank: 2, username: 'GhostScope',    displayName: 'GhostScope',    totalXp: 198, centreName: 'Wishaw', topBadge: null },
  { rank: 3, username: 'YMCA_Racer',    displayName: 'YMCA_Racer',    totalXp: 145, centreName: 'Wishaw', topBadge: null },
  { rank: 4, username: 'NeonPulse',     displayName: 'NeonPulse',     totalXp: 112, centreName: 'Wishaw', topBadge: null },
  { rank: 5, username: 'StormByte',     displayName: 'StormByte',     totalXp: 87,  centreName: 'Wishaw', topBadge: null },
]

const FALLBACK_REVIEWS: PendingReview[] = [
  { submissionId: 'fb-1', player: 'NeonPulse',  username: 'NeonPulse',  badge: 'Game Mastery',   subBadge: 'Advanced Mechanics', pts: 4,  noteText: '', submittedAt: '' },
  { submissionId: 'fb-2', player: 'StormByte',  username: 'StormByte',  badge: 'Team Work',      subBadge: 'Communicator',       pts: 10, noteText: '', submittedAt: '' },
  { submissionId: 'fb-3', player: 'GhostScope', username: 'GhostScope', badge: 'Digital Skills',  subBadge: 'Content Creator',    pts: 10, noteText: '', submittedAt: '' },
]

const CATEGORY_ICONS: Record<string, string> = {
  junior: 'child_care',
  competitive: 'emoji_events',
  media: 'videocam',
  casual: 'sports_esports',
}

function AdminDashboard() {
  const [apiTiers, setApiTiers] = useState<TierDto[] | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(FALLBACK_LEADERBOARD)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>(FALLBACK_REVIEWS)
  const [groups, setGroups] = useState<GroupDto[] | null>(null)
  const [badgeOverview, setBadgeOverview] = useState<BadgeOverviewCategory[] | null>(null)
  const [showGroupFilters, setShowGroupFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [filterGame, setFilterGame] = useState('')

  /* Award sub-badge form state */
  const [awardGroup, setAwardGroup] = useState('')
  const [awardPlayer, setAwardPlayer] = useState('')
  const [awardBadge, setAwardBadge] = useState('')
  const [awardSubBadge, setAwardSubBadge] = useState('')
  const [showAwardSuccess, setShowAwardSuccess] = useState(false)
  const [awardSummary, setAwardSummary] = useState({ player: '', subBadge: '' })

  const handleAwardSubBadge = () => {
    if (!awardGroup || !awardPlayer || !awardBadge || !awardSubBadge) return
    setAwardSummary({ player: awardPlayer, subBadge: awardSubBadge })
    setShowAwardSuccess(true)
    // Reset form
    setAwardGroup('')
    setAwardPlayer('')
    setAwardBadge('')
    setAwardSubBadge('')
    // Auto-dismiss after 3 seconds
    setTimeout(() => setShowAwardSuccess(false), 3000)
  }

  const fetchPendingReviews = () => {
    fetch(`${API_BASE}/admin/centre/pending-reviews`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { reviews: PendingReview[] }) => setPendingReviews(data.reviews))
      .catch(() => { /* keep fallback */ })
  }

  const handleReview = (submissionId: string, action: 'approve' | 'reject') => {
    fetch(`${API_BASE}/admin/submissions/${submissionId}/${action}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerComment: '' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        // Remove from list on success
        setPendingReviews((prev) => prev.filter((r) => r.submissionId !== submissionId))
      })
      .catch(() => { /* silently fail for now */ })
  }

  useEffect(() => {
    fetch(`${API_BASE}/badges/tiers`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { tiers: TierDto[] }) => setApiTiers(data.tiers))
      .catch(() => setApiTiers(null))

    fetch(`${API_BASE}/leaderboards/centre`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { rows: LeaderboardRow[] }) => setLeaderboard(data.rows.slice(0, 5)))
      .catch(() => { /* keep fallback */ })

    fetchPendingReviews()

    fetch(`${API_BASE}/manage/groups`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { groups: GroupDto[] }) => setGroups(data.groups))
      .catch(() => { /* keep fallback */ })

    fetch(`${API_BASE}/badges/overview?username=PHOENIX_REIGN`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { categories: BadgeOverviewCategory[] }) => setBadgeOverview(data.categories))
      .catch(() => { /* keep fallback */ })
  }, [])

  const handleTopNav = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault()
    navigate(path)
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-icon-btn" aria-label="Open menu">
            <span className="material-symbol">menu</span>
          </button>
          <h1>WISHAW YMCA</h1>
        </div>

        <div className="admin-topbar-right">
          <nav className="admin-nav-desktop" aria-label="Admin sections">
            <a href="/dashboard" onClick={(event) => handleTopNav(event, '/dashboard')}>Dashboard</a>
            <a href="/badges" onClick={(event) => handleTopNav(event, '/badges')}>Badges</a>
            <a href="/leaderboard" onClick={(event) => handleTopNav(event, '/leaderboard')}>Leaderboard</a>
            <a href="/admin/badges" onClick={(event) => handleTopNav(event, '/admin/badges')}>Badge Management</a>
            <a className="is-active" href="/admin" onClick={(event) => handleTopNav(event, '/admin')}>Admin</a>
          </nav>
          <div className="admin-avatar" aria-hidden="true">A</div>
        </div>
      </header>

      <main className="admin-main">
        {/* ── Hero ───────────────────────────────────── */}
        <section className="admin-hero">
          <div className="admin-hero-glow" />
          <div>
            <span className="admin-kicker">Academy Control Center</span>
            <h2>
              ADMIN <br />
              <span>DASHBOARD</span>
            </h2>
          </div>

          <article className="admin-live-card">
            <div>
              <p>Total Players</p>
              <strong>82 Members</strong>
            </div>
            <div className="divider" />
            <div>
              <p>Active Groups</p>
              <strong>{(groups ?? ACADEMY_GROUPS).length}</strong>
            </div>
            <div className="divider" />
            <div>
              <p>Pending Reviews</p>
              <strong>{pendingReviews.length}</strong>
            </div>
          </article>
        </section>

        {/* ── Tier Scale Reference ────────────────────── */}
        <section className="admin-tier-scale">
          <h3>
            <span className="material-symbol">workspace_premium</span>
            BADGE TIER SCALE
          </h3>
          <div className="tier-scale-bar">
            {apiTiers
              ? apiTiers.map((t) => (
                  <div key={t.id} className="tier-scale-segment" style={{ borderColor: t.colour }}>
                    <strong style={{ color: t.colour }}>{t.name}</strong>
                    <small>{t.label}</small>
                  </div>
                ))
              : BADGE_TIERS.map((t) => (
                  <div key={t.name} className="tier-scale-segment" style={{ borderColor: t.color }}>
                    <strong style={{ color: t.color }}>{t.name}</strong>
                    <small>{t.min} – {t.max ?? '∞'} pts</small>
                  </div>
                ))
            }
          </div>
        </section>

        <section className="admin-grid">
          {/* ── Award Sub-Badge Panel ──────────────────── */}
          <article className="admin-panel admin-panel-wide">
            <h3>
              <span className="material-symbol">military_tech</span>
              AWARD SUB-BADGE
            </h3>

            <div className="admin-form-grid">
              <label>
                <span>Select Group</span>
                <select value={awardGroup} onChange={(e) => setAwardGroup(e.target.value)}>
                  <option value="" disabled>Choose a group…</option>
                  {(groups ?? ACADEMY_GROUPS).map((g) => (
                    <option key={g.name} value={g.name}>{g.name} ({g.ageRange})</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Select Player</span>
                <select value={awardPlayer} onChange={(e) => setAwardPlayer(e.target.value)}>
                  <option value="" disabled>Choose a player…</option>
                  <option value="PHOENIX_REIGN">PHOENIX_REIGN</option>
                  <option value="GhostScope">GhostScope</option>
                  <option value="NeonPulse">NeonPulse</option>
                  <option value="StormByte">StormByte</option>
                  <option value="YMCA_Racer">YMCA_Racer</option>
                </select>
              </label>

              <label>
                <span>Badge Category</span>
                <select value={awardBadge} onChange={(e) => setAwardBadge(e.target.value)}>
                  <option value="" disabled>Choose badge…</option>
                  {BADGE_CATEGORIES.map((c) => (
                    <option key={c.title} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sub-Badge / Challenge</span>
                <select value={awardSubBadge} onChange={(e) => setAwardSubBadge(e.target.value)}>
                  <option value="" disabled>Choose sub-badge…</option>
                  <option value="Advanced Mechanics (4 pts)">Advanced Mechanics (4 pts)</option>
                  <option value="Analyst (10 pts)">Analyst (10 pts)</option>
                  <option value="Average Scorer (4 pts)">Average Scorer (4 pts)</option>
                  <option value="Communicator (10 pts)">Communicator (10 pts)</option>
                </select>
              </label>

              <button
                type="button"
                className="admin-primary-btn"
                disabled={!awardGroup || !awardPlayer || !awardBadge || !awardSubBadge}
                onClick={handleAwardSubBadge}
              >
                <span className="material-symbol" style={{ fontSize: '1rem' }}>check_circle</span>
                Award Sub-Badge
              </button>
            </div>
          </article>

          {/* ── Centre Leaderboard ──────────────────────── */}
          <article className="admin-panel admin-panel-side">
            <h3>
              <span className="material-symbol">leaderboard</span>
              CENTRE LEADERBOARD
            </h3>

            <div className="leaderboard-list">
              {leaderboard.map((entry) => {
                const tier = getTier(entry.totalXp)
                return (
                  <div key={entry.rank} className={`leaderboard-row${entry.rank === 1 ? ' top' : ''}`}>
                    <div>
                      <strong>{String(entry.rank).padStart(2, '0')}</strong>
                      <span>{entry.displayName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        className="tier-pip"
                        style={{ background: tier.color, fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}
                      >
                        {tier.name.toUpperCase()}
                      </span>
                      <p style={{ margin: 0 }}>{entry.totalXp} pts</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <a href="/leaderboard" className="admin-link-btn" style={{ textDecoration: 'none' }}>
              View Full Centre Standings
            </a>
          </article>
        </section>

        {/* ── Pending Reviews ─────────────────────────── */}
        <section className="admin-reviews-section">
          <h3>
            <span className="material-symbol">rate_review</span>
            PENDING REVIEWS
          </h3>
          <div className="admin-reviews-list">
            {pendingReviews.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No pending reviews</p>
            )}
            {pendingReviews.map((r) => (
              <article key={r.submissionId} className="admin-review-card">
                <div className="admin-review-info">
                  <strong>{r.player}</strong>
                  <small>{r.badge} → {r.subBadge} (+{r.pts} pts)</small>
                </div>
                <div className="admin-review-actions">
                  <button type="button" className="admin-approve-btn" onClick={() => handleReview(r.submissionId, 'approve')}>
                    <span className="material-symbol" style={{ fontSize: '1rem' }}>check</span>
                    Approve
                  </button>
                  <button type="button" className="admin-reject-btn" onClick={() => handleReview(r.submissionId, 'reject')}>
                    <span className="material-symbol" style={{ fontSize: '1rem' }}>close</span>
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Group Management ────────────────────────── */}
        <section className="groups-section">
          <div className="groups-header">
            <h3>GROUP MANAGEMENT</h3>
            <div>
              <button
                className={`admin-icon-btn${showGroupFilters ? ' is-active' : ''}`}
                aria-label="Filter groups"
                onClick={() => setShowGroupFilters((v) => !v)}
              >
                <span className="material-symbol">filter_list</span>
              </button>
              <button className="admin-icon-btn" aria-label="Add group" onClick={() => navigate('/groups')}>
                <span className="material-symbol">add</span>
              </button>
            </div>
          </div>

          {showGroupFilters && (
            <div className="group-filters">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {[...new Set((groups ?? ACADEMY_GROUPS).map((g) => g.category))].map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>

              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
              >
                <option value="">All Ages</option>
                {[...new Set((groups ?? ACADEMY_GROUPS).map((g) => g.ageRange))].map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>

              <select
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value)}
              >
                <option value="">All Games</option>
                {[...new Set((groups ?? ACADEMY_GROUPS).map((g) => g.game))].map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
          )}

          <div className="group-grid">
            {(groups ?? ACADEMY_GROUPS)
              .filter((g) => !filterCategory || g.category === filterCategory)
              .filter((g) => !filterAge || g.ageRange === filterAge)
              .filter((g) => !filterGame || g.game === filterGame)
              .map((group) => (
              <article key={group.name} className="group-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbol" style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                    {CATEGORY_ICONS[group.category] ?? 'group'}
                  </span>
                  <span>{group.category.charAt(0).toUpperCase() + group.category.slice(1)}</span>
                </div>
                <h4>{group.name}</h4>
                <p>{group.playerCount} players · Ages {group.ageRange} · {group.coach}</p>
                <button type="button">Manage Group</button>
              </article>
            ))}
          </div>
        </section>

        {/* ── Badge Overview for all 5 categories ──────── */}
        <section className="admin-badge-overview">
          <h3>
            <span className="material-symbol">workspace_premium</span>
            BADGE SYSTEM OVERVIEW
          </h3>
          <div className="admin-badge-grid">
            {badgeOverview
              ? badgeOverview.map((cat) => (
                  <article key={cat.id} className="admin-badge-card">
                    <img
                      src={BADGE_TIER_IMAGES[cat.title]?.[cat.tier.name.toLowerCase()] ?? BADGE_CATEGORIES.find((c) => c.title === cat.title)?.image ?? ''}
                      alt={`${cat.title} – ${cat.tier.name}`}
                      className="admin-badge-card-img"
                    />
                    <div>
                      <h4>{cat.title}</h4>
                      <span className="tier-pip" style={{ background: cat.tier.colour }}>
                        {cat.tier.name.toUpperCase()}
                      </span>
                    </div>
                  </article>
                ))
              : BADGE_CATEGORIES.map((cat) => {
                  const pts = MOCK_PLAYER_POINTS[cat.title] ?? 0
                  const tier = getTier(pts)
                  return (
                    <article key={cat.title} className="admin-badge-card">
                      <img
                        src={BADGE_TIER_IMAGES[cat.title]?.[tier.name.toLowerCase()] ?? cat.image}
                        alt={`${cat.title} – ${tier.name}`}
                        className="admin-badge-card-img"
                      />
                      <div>
                        <h4>{cat.title}</h4>
                        <span className="tier-pip" style={{ background: tier.color }}>
                          {tier.name.toUpperCase()}
                        </span>
                      </div>
                    </article>
                  )
                })
            }
          </div>
        </section>
      </main>

      {/* ── Award Success Dialog ─────────────────────────── */}
      {showAwardSuccess && (
        <div className="admin-success-overlay" onClick={() => setShowAwardSuccess(false)}>
          <div className="admin-success-card" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbol admin-success-icon" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3>SUB-BADGE AWARDED!</h3>
            <p><strong>{awardSummary.subBadge}</strong> has been awarded to <strong>{awardSummary.player}</strong>.</p>
            <button type="button" className="admin-primary-btn" onClick={() => setShowAwardSuccess(false)}>Done</button>
          </div>
        </div>
      )}

      <nav className="admin-bottom-nav" aria-label="Bottom navigation">
        <a href="/dashboard">
          <span className="material-symbol">dashboard</span>
          <small>Dashboard</small>
        </a>
        <a href="/badges">
          <span className="material-symbol">military_tech</span>
          <small>Badges</small>
        </a>
        <a href="/leaderboard">
          <span className="material-symbol">leaderboard</span>
          <small>Leaderboard</small>
        </a>
        <a href="/admin" className="is-active">
          <span className="material-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <small>Admin</small>
        </a>
      </nav>
    </div>
  )
}

export default AdminDashboard