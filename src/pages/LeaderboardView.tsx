import { useState, useEffect, useCallback } from 'react'
import '../styles/leaderboard.css'
import { getTier, BADGE_TIERS } from '../lib/badge-tiers'
import { useAuth } from '../auth/AuthContext'
import { API_BASE } from '../auth/authService'

const CATEGORY_FILTERS = ['ALL BADGES', 'GAME MASTERY', 'TEAM WORK', 'ESPORTS CITIZEN', 'PERSONAL DEV', 'DIGITAL SKILLS']
const CENTRE_FILTERS = ['ALL', 'WISHAW', 'GLASGOW', 'EDINBURGH', 'BELFAST']

/** Returns up to 2 characters from a gamer tag, e.g. V0RTEX_KNG → VK */
function initials(name: string): string {
  const parts = name.split(/[_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

interface LeaderboardRow {
  rank: number
  username: string
  displayName: string
  totalXp: number
  centreName: string | null
  topBadge: string | null
}

interface LeaderboardResponse {
  rows: LeaderboardRow[]
  currentUsername: string
  totalPlayers: number
}

export default function LeaderboardView() {
  const { token } = useAuth()
  const [activeCategory, setActiveCategory] = useState('ALL BADGES')
  const [activeCentre, setActiveCentre] = useState('ALL')
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [currentUsername, setCurrentUsername] = useState('')
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      // Build URL – use /global when a specific centre filter is chosen (or ALL),
      // so we can pass ?centre= to narrow down. /centre uses the logged-in user's centre.
      const params = new URLSearchParams()
      if (activeCategory !== 'ALL BADGES') params.set('category', activeCategory)

      let endpoint: string
      if (activeCentre === 'ALL') {
        endpoint = `${API_BASE}/leaderboards/global`
      } else {
        endpoint = `${API_BASE}/leaderboards/global`
        params.set('centre', activeCentre)
      }

      const url = params.toString() ? `${endpoint}?${params}` : endpoint
      const res = await fetch(url, {
        credentials: 'include',
        headers: { Cookie: `session_token=${token}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Failed to load leaderboard (${res.status})`)
      }

      const data: LeaderboardResponse = await res.json()
      setRows(data.rows)
      setCurrentUsername(data.currentUsername)
      setTotalPlayers(data.totalPlayers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [token, activeCategory, activeCentre])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  // Split rows into podium (top 3) and the rest
  const podiumRows = rows.slice(0, 3)
  const rankRows = rows.slice(3)
  const first = podiumRows[0]
  const second = podiumRows[1]
  const third = podiumRows[2]

  return (
    <div className="lb-page">
      {/* Kinetic glow */}
      <div className="lb-glow" aria-hidden="true" />

      {/* Top bar */}
      <header className="lb-topbar">
        <div className="lb-topbar-left">
          <div className="lb-topbar-avatar lb-initials-avatar lb-initials-avatar--primary" aria-label="Your profile">
            <span className="lb-initials">{currentUsername ? initials(currentUsername) : 'ME'}</span>
          </div>
          <h1>ACADEMY HUB</h1>
        </div>
        <div className="lb-topbar-right">
          <button className="lb-icon-btn" aria-label="Notifications">
            <span className="material-symbol">notifications</span>
          </button>
        </div>
      </header>

      <main className="lb-main">

        {/* Section header */}
        <section className="lb-section-header">
          <span className="lb-kicker">Wishaw YMCA Esports Academy</span>
          <h2>{activeCentre === 'ALL' ? 'GLOBAL' : activeCentre} <br /><span>LEADERBOARD</span></h2>
          <div className="tier-legend" style={{ marginTop: '0.5rem' }}>
            {BADGE_TIERS.map((t) => (
              <div key={t.name} className="tier-legend-item">
                <span className="tier-legend-dot" style={{ background: t.color }} />
                <div className="tier-legend-text">
                  <strong style={{ color: t.color }}>{t.name}</strong>
                  <small>{t.min}–{t.max ?? '∞'}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loading / Error */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary, #999)' }}>
            <span className="material-symbol" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>hourglass_empty</span>
            <p>Loading leaderboard…</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4d4d' }}>
            <span className="material-symbol" style={{ fontSize: '2rem' }}>error</span>
            <p>{error}</p>
            <button onClick={fetchLeaderboard} className="lb-filter-btn lb-filter-btn--active" style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Podium */}
        {!loading && !error && first && (
        <section className="lb-podium" aria-label="Top 3 players">

          {/* Rank 1 */}
          <div className="lb-rank1">
            <div className="lb-rank1-bg" aria-hidden="true" />
            <div className="lb-rank1-inner">
              <div className="lb-rank1-left">
                <div className="lb-rank1-avatar-wrap">
                  <div className="lb-rank-badge lb-rank-badge--gold" aria-label="Rank 1">1</div>
                  <div className="lb-rank1-avatar lb-initials-avatar lb-initials-avatar--primary">
                    <span className="lb-initials lb-initials--lg">{initials(first.displayName)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="lb-rank1-name">{first.displayName}</h3>
                  <div className="lb-rank1-badge-label">
                    <span
                      className="tier-pip"
                      style={{ background: getTier(first.totalXp).color }}
                    >
                      {getTier(first.totalXp).name.toUpperCase()}
                    </span>
                    {first.topBadge ?? 'ALL BADGES'}
                  </div>
                </div>
              </div>
              <div className="lb-rank1-xp">
                <strong>{first.totalXp}</strong>
                <span>TOTAL PTS</span>
              </div>
            </div>
          </div>

          {/* Ranks 2 & 3 */}
          {(second || third) && (
          <div className="lb-podium-pair">
            {second && (
            <div className="lb-rank-card lb-rank-card--silver">
              <div className="lb-rank-card-avatar-wrap">
                <div className="lb-rank-badge lb-rank-badge--silver" aria-label="Rank 2">2</div>
                <div className="lb-rank-card-avatar lb-rank-card-avatar--silver lb-initials-avatar">
                  <span className="lb-initials lb-initials--md">{initials(second.displayName)}</span>
                </div>
              </div>
              <h4 className="lb-rank-card-name">{second.displayName}</h4>
              <p className="lb-rank-card-xp">
                <span className="tier-pip" style={{ background: getTier(second.totalXp).color, fontSize: '0.5rem', padding: '0.1rem 0.3rem' }}>
                  {getTier(second.totalXp).name.toUpperCase()}
                </span>
                {second.totalXp} pts
              </p>
            </div>
            )}

            {third && (
            <div className="lb-rank-card lb-rank-card--bronze">
              <div className="lb-rank-card-avatar-wrap">
                <div className="lb-rank-badge lb-rank-badge--bronze" aria-label="Rank 3">3</div>
                <div className="lb-rank-card-avatar lb-rank-card-avatar--bronze lb-initials-avatar">
                  <span className="lb-initials lb-initials--md">{initials(third.displayName)}</span>
                </div>
              </div>
              <h4 className="lb-rank-card-name">{third.displayName}</h4>
              <p className="lb-rank-card-xp">
                <span className="tier-pip" style={{ background: getTier(third.totalXp).color, fontSize: '0.5rem', padding: '0.1rem 0.3rem' }}>
                  {getTier(third.totalXp).name.toUpperCase()}
                </span>
                {third.totalXp} pts
              </p>
            </div>
            )}
          </div>
          )}
        </section>
        )}

        {/* Filters */}
        <section className="lb-filters" aria-label="Filter leaderboard">
          <div className="lb-filters-inner">
            {/* Category row */}
            <fieldset className="lb-filter-row" aria-label="Category filters">
              <legend className="lb-filter-legend">Category</legend>
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat}
                  className={`lb-filter-btn ${activeCategory === cat ? 'lb-filter-btn--active' : 'lb-filter-btn--inactive'}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </fieldset>
            {/* Centre row */}
            <fieldset className="lb-filter-row" aria-label="Centre filters">
              <legend className="lb-filter-legend">Centre</legend>
              {CENTRE_FILTERS.map(centre => (
                <button
                  key={centre}
                  className={`lb-filter-btn ${activeCentre === centre ? 'lb-filter-btn--game-active' : 'lb-filter-btn--game-inactive'}`}
                  onClick={() => setActiveCentre(centre)}
                  aria-pressed={activeCentre === centre}
                >
                  {centre}
                </button>
              ))}
            </fieldset>
          </div>
        </section>

        {/* Rankings list */}
        {!loading && !error && (
        <section className="lb-rankings" aria-label="Full rankings">
          <div className="lb-rankings-header">
            <h3>RANKINGS</h3>
            <span className="lb-rankings-total">TOTAL PLAYERS: {totalPlayers}</span>
          </div>

          <div className="lb-list">
            {rankRows.map(row => {
              const tier = getTier(row.totalXp)
              const isMe = row.username === currentUsername
              return (
                <div
                  key={row.rank}
                  className={`lb-row${isMe ? ' lb-row--me' : ''}`}
                >
                  <div className="lb-row-left">
                    <span className={`lb-row-rank${isMe ? ' lb-row-rank--me' : ''}`}>
                      {String(row.rank).padStart(2, '0')}
                    </span>
                    <div className={`lb-row-avatar lb-initials-avatar${isMe ? ' lb-row-avatar--me lb-initials-avatar--primary' : ''}`}>
                      <span className="lb-initials lb-initials--sm">{initials(row.displayName)}</span>
                    </div>
                    <div>
                      <p className={`lb-row-name${isMe ? ' lb-row-name--me' : ''}`}>
                        {isMe ? `YOU (${row.displayName})` : row.displayName}
                      </p>
                      <span className={`lb-row-category${isMe ? ' lb-row-category--me' : ''}`}>
                        <span
                          className="tier-pip"
                          style={{ background: tier.color, fontSize: '0.5rem', padding: '0.05rem 0.3rem', marginRight: '0.3rem' }}
                        >
                          {tier.name.toUpperCase()}
                        </span>
                        {row.centreName}
                      </span>
                    </div>
                  </div>
                  <div className="lb-row-right">
                    <span className={`lb-row-xp${isMe ? ' lb-row-xp--me' : ''}`}>
                      {row.totalXp}
                    </span>
                    <span className={`lb-row-xp-label${isMe ? ' lb-row-xp-label--me' : ''}`}>
                      PTS
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        )}

      </main>

      {/* Bottom nav */}
      <nav className="lb-bottom-nav" aria-label="Main navigation">
        <a href="/dashboard">
          <span className="material-symbol">dashboard</span>
          <small>Dashboard</small>
        </a>
        <a href="/badges">
          <span className="material-symbol">military_tech</span>
          <small>Badges</small>
        </a>
        <a href="/leaderboard" className="is-active">
          <span
            className="material-symbol"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            leaderboard
          </span>
          <small>Leaderboard</small>
        </a>
        <a href="/admin">
          <span className="material-symbol">admin_panel_settings</span>
          <small>Admin</small>
        </a>
      </nav>
    </div>
  )
}
