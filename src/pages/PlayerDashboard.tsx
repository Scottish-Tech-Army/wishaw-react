import {
  BADGE_CATEGORIES,
  BADGE_TIERS,
  getTier,
  getTierProgress,
  getNextTier,
  pointsToNextTier,
  MOCK_PLAYER_POINTS,
} from '../lib/badge-tiers'

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Game Mastery':         'Game mechanics, strategies & victories',
  'Team Work':            'Communication, collaboration & player roles',
  'Esports Citizen':      'Sportsmanship, respect & positive gaming culture',
  'Personal Development': 'Practice, mindset, accountability & healthy habits',
  'Digital Skills':       'Digital literacy, online safety & creativity',
}

const squadActivity = [
  { icon: 'rocket_launch', title: 'Practice Session Scheduled', subtitle: 'Team Wishaw-A · Today 18:00', color: true },
  { icon: 'military_tech', title: 'Sub-Badge Earned', subtitle: '"Advanced Mechanics" · Game Mastery +4 pts', color: false },
  { icon: 'person_add', title: 'New Coach Feedback', subtitle: 'Coach Dave left a note on your last VOD', color: false },
]

// Total XP across all badges
const totalPoints = Object.values(MOCK_PLAYER_POINTS).reduce((a, b) => a + b, 0)

function PlayerDashboard() {
  return (
    <div className="player-page">
      <header className="player-topbar">
        <div className="player-topbar-left">
          <button className="player-icon-btn" aria-label="Open menu">
            <span className="material-symbol">menu</span>
          </button>
          <h1>WISHAW YMCA</h1>
        </div>

        <div className="player-topbar-right">
          <nav className="player-nav-desktop" aria-label="Player sections">
            <a href="/dashboard" className="is-active">Dashboard</a>
            <a href="/badges">Badges</a>
            <a href="/submit">Challenges</a>
            <a href="/leaderboard">Leaderboard</a>
          </nav>
          <div className="player-avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiP5F2jjPimpAZIOlY9HTk8eQjJZ8GwiI1ygM28aKVNrdn6IbQRxz69q3KomkMH9UKlapNudeA5RoGhLKulsHbmRy5f6HviHLIkkgFxjEvYkB_QMejUyA-S1RFdUh4cLDMKLYSbMMm4mxL-iUNaOX29MdZ1qdIvg2PTPq4mnOvB58hqFBdLegaqEjEtHmMoiTGYwf-KeDdSHRuGs46l1TaXEbc1XrI4kVw2DZ0YYJt6xMtCytVyuGLOplPsyRBjW1GATfwLEEp0x0"
              alt="Player avatar"
            />
          </div>
        </div>
      </header>

      <main className="player-main">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="player-hero">
          <div className="player-hero-glow" />
          <div className="player-identity">
            <span className="player-kicker">Welcome Back, Player</span>
            <h2>PHOENIX_REIGN</h2>
            <div className="player-tags">
              <span className="player-group-badge">Rocket League Competitive</span>
            </div>
          </div>

          <div className="player-stats-cards">
            <article>
              <p>Total Points</p>
              <strong>{totalPoints}</strong>
            </article>
            <article>
              <p>Badges Earned</p>
              <strong>3 / 5</strong>
            </article>
          </div>
        </section>

        {/* ── Tier Legend ─────────────────────────────────── */}
        <section className="tier-legend-section">
          <h3>
            <span className="mastery-accent" />
            BADGE LEVELS
          </h3>
          <div className="tier-legend">
            {BADGE_TIERS.map((t) => (
              <div key={t.name} className="tier-legend-item">
                <span
                  className="tier-legend-dot"
                  style={{ background: t.color }}
                />
                <div className="tier-legend-text">
                  <strong style={{ color: t.color }}>{t.name.toUpperCase()}</strong>
                  <small>{t.min} – {t.max ?? '∞'} pts</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Badge Cards ────────────────────────────────── */}
        <section className="mastery-section">
          <h3>
            <span className="mastery-accent" />
            YOUR BADGES
          </h3>

          <div className="mastery-grid">
            {BADGE_CATEGORIES.map((cat) => {
              const pts = MOCK_PLAYER_POINTS[cat.title] ?? 0
              const tier = getTier(pts)
              const progress = getTierProgress(pts)
              const next = getNextTier(pts)

              return (
                <a key={cat.title} href="/badges" className="mastery-card">
                  <div className="mastery-card-header">
                    <img
                      className="mastery-badge-img"
                      src={cat.image}
                      alt={cat.title}
                    />
                    <span
                      className="tier-pip"
                      style={{ background: tier.color }}
                      aria-label={tier.name}
                    >
                      {tier.name.toUpperCase()}
                    </span>
                  </div>
                  <h4>{cat.title}</h4>
                  <p>{BADGE_DESCRIPTIONS[cat.title]}</p>
                  <div className="mastery-points-row">
                    <span className="mastery-pts" style={{ color: tier.color }}>{pts} pts</span>
                    {next && (
                      <span className="mastery-next">
                        {pointsToNextTier(pts)} to {next.name}
                      </span>
                    )}
                    {!next && (
                      <span className="mastery-next" style={{ color: tier.color }}>MAX TIER</span>
                    )}
                  </div>
                  <div className="mastery-progress">
                    <div style={{ width: `${progress}%`, background: tier.color }} />
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* ── Squad Activity ─────────────────────────────── */}
        <section className="player-content-grid">
          <article className="squad-panel">
            <h3>RECENT ACTIVITY</h3>

            <div className="squad-feed">
              {squadActivity.map((item) => (
                <div key={item.title} className="squad-item">
                  <div className={`squad-icon${item.color ? ' primary-bg' : ''}`}>
                    <span className="material-symbol">{item.icon}</span>
                  </div>
                  <div>
                    <p>{item.title}</p>
                    <small>{item.subtitle}</small>
                  </div>
                </div>
              ))}
            </div>

            <a href="/badges" className="squad-action-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              VIEW ALL BADGES
            </a>
          </article>
        </section>
      </main>

      <nav className="player-bottom-nav" aria-label="Bottom navigation">
        <a href="/dashboard" className="is-active">
          <span className="material-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          <small>Dashboard</small>
        </a>
        <a href="/badges">
          <span className="material-symbol">military_tech</span>
          <small>Badges</small>
        </a>
        <a href="/submit">
          <span className="material-symbol">send</span>
          <small>Submit</small>
        </a>
        <a href="/leaderboard">
          <span className="material-symbol">leaderboard</span>
          <small>Leaderboard</small>
        </a>
      </nav>
    </div>
  )
}

export default PlayerDashboard
