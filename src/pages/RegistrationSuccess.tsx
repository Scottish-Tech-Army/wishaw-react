import '../styles/registration-success.css'
import { SESSIONS } from './RegistrationPage'

export interface RegistrationSummary {
  gamerName: string
  sessions: string[]
}

function readSummary(): RegistrationSummary {
  try {
    const raw = sessionStorage.getItem('reg-summary')
    if (raw) return JSON.parse(raw) as RegistrationSummary
  } catch { /* ignore */ }
  return { gamerName: 'Your Gamer', sessions: [] }
}

export default function RegistrationSuccess() {
  const summary = readSummary()

  const selectedSessions = SESSIONS.filter(s => summary.sessions.includes(s.id))
  const sessionLabel = selectedSessions.length > 0
    ? selectedSessions.map(s => s.game).filter((v, i, a) => a.indexOf(v) === i).join(' & ')
    : 'Academy Sessions'

  const daysLabel = selectedSessions.length > 0
    ? [...new Set(selectedSessions.map(s => s.day))].join(' & ')
    : '—'

  const timeLabel = selectedSessions.length > 0
    ? selectedSessions[0].time
    : '—'

  const groupLabel = selectedSessions[0]?.group === '13-18' ? 'Age 13–18' : 'Age 8–12'

  return (
    <div className="rs-page">
      {/* atmosphere */}
      <div className="rs-orb rs-orb--tl" aria-hidden="true" />
      <div className="rs-orb rs-orb--br" aria-hidden="true" />

      <main className="rs-main">

        {/* brand */}
        <div className="rs-brand">Wishaw YMCA Esports</div>

        {/* success indicator */}
        <div className="rs-badge-wrap" aria-hidden="true">
          <div className="rs-badge">
            <span
              className="material-symbol rs-badge-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="rs-pulse-dot" />
        </div>

        {/* headline */}
        <h1 className="rs-headline">
          Welcome to<br />
          <span>the Academy!</span>
        </h1>

        <p className="rs-sub">
          {summary.gamerName} has been successfully registered for{' '}
          <strong>{sessionLabel}</strong> ({groupLabel}).
        </p>

        {/* bento grid */}
        <div className="rs-bento">

          {/* schedule card */}
          <div className="rs-card rs-card--glass">
            <span className="rs-card-kicker">Academy Schedule</span>
            <h3 className="rs-card-title">{daysLabel} | {timeLabel}</h3>
            <div className="rs-card-meta">
              <span className="material-symbol rs-card-meta-icon">calendar_today</span>
              <span>Starting this coming session</span>
            </div>
          </div>

          {/* thematic / selected sessions list */}
          <div className="rs-card rs-card--sessions">
            <span className="rs-card-kicker">Enrolled Sessions</span>
            <ul className="rs-session-list">
              {selectedSessions.map(s => (
                <li key={s.id} className="rs-session-item">
                  <span
                    className="material-symbol rs-session-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    sports_esports
                  </span>
                  <span>
                    <strong>{s.game}</strong>
                    <em>{s.day} · {s.time}</em>
                  </span>
                </li>
              ))}
            </ul>
            <div className="rs-live-badge">
              <span className="rs-live-dot" />
              <span>Live Arena</span>
            </div>
          </div>
        </div>

        {/* next steps */}
        <div className="rs-next-steps">
          <h4 className="rs-next-title">Next Steps</h4>
          <ol className="rs-steps-list">
            <li className="rs-step">
              <div className="rs-step-num" aria-hidden="true">1</div>
              <p>Check your email for a confirmation and safety guide. We've sent a detailed welcome pack to your inbox.</p>
            </li>
            <li className="rs-step">
              <div className="rs-step-num" aria-hidden="true">2</div>
              <p>Your young gamer can now log in to Academy Hub to start their journey and join the community.</p>
            </li>
          </ol>
        </div>

        {/* actions */}
        <div className="rs-actions">
          <a href="/dashboard" className="rs-btn rs-btn--primary">
            <span>Go to Academy Hub</span>
            <span className="material-symbol">bolt</span>
          </a>
          <a href="/register" className="rs-btn rs-btn--ghost">Register Another</a>
        </div>

      </main>

      {/* footer */}
      <footer className="rs-footer">
        <span className="rs-footer-brand">Wishaw YMCA Esports</span>
        <nav className="rs-footer-links" aria-label="Footer links">
          <a href="/support">Support</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/conduct">Code of Conduct</a>
          <a href="/safety">Safety</a>
        </nav>
        <span className="rs-footer-copy">© 2025 Wishaw YMCA Esports Academy</span>
      </footer>
    </div>
  )
}
