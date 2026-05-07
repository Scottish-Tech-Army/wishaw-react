import { useAuth } from '../auth/AuthContext'
import '../styles/parent.css'

const snapStats = [
  { label: 'Attendance', value: '4/4', icon: 'event_available' },
  { label: 'New Badges', value: '2',   icon: 'military_tech'   },
  { label: 'Behaviour',  value: 'A',   icon: 'verified_user'   },
]

const quickLinks = [
  {
    icon: 'bar_chart',
    title: 'Progress Reports',
    description: 'View attendance trends, activity completion, and milestones.',
    href: '#reports',
  },
  {
    icon: 'manage_accounts',
    title: 'Player Profile',
    description: 'Review current badges and development pathway progress.',
    href: '/dashboard',
  },
]

const activityItems = [
  { icon: 'military_tech',  text: 'Earned "Team Player" badge',         when: 'Today, 19:12',   accent: true  },
  { icon: 'check_circle',   text: 'Challenge submitted: Comms drill',    when: 'Yesterday, 18:45', accent: false },
  { icon: 'event_available',text: 'Attended: Rocket League session',     when: 'Mon, 17:30',     accent: false },
  { icon: 'comment',        text: 'Coach note: Great positioning this week', when: 'Mon, 19:00', accent: false },
]

const nextSession = {
  day: 'Friday',
  time: '18:00',
  label: 'Mini League Training',
  location: 'Studio A',
}

export default function ParentDashboard() {
  const { logout } = useAuth()

  return (
    <div className="parent-page">

      {/* ── Top bar ── */}
      <header className="parent-topbar">
        <div className="parent-topbar-left">
          <button className="parent-icon-btn" aria-label="Open menu">
            <span className="material-symbol">menu</span>
          </button>
          <h1>WISHAW YMCA</h1>
        </div>

        <div className="parent-topbar-right">
          <button className="parent-icon-btn" aria-label="Notifications">
            <span className="material-symbol">notifications</span>
          </button>
          <div className="parent-avatar">
            <img
              src="https://ui-avatars.com/api/?name=AR&background=109dd1&color=ffffff&bold=true"
              alt="Parent avatar"
            />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="parent-main">

        {/* Greeting */}
        <div className="parent-greeting">
          <p className="parent-greeting-kicker">Parent View</p>
          <h2 className="parent-greeting-name">Hello, Sarah</h2>
          <p className="parent-greeting-sub">Tracking progress for <strong>Alex Rivers</strong></p>
        </div>

        {/* ── Progress Snapshot card ── */}
        <section className="parent-snapshot" aria-labelledby="snapshot-title">
          <div className="parent-snapshot-header">
            <div>
              <h3 id="snapshot-title" className="parent-snapshot-title">Progress Snapshot</h3>
              <p className="parent-snapshot-sub">Weekly summary for Alex Rivers</p>
            </div>
            <span
              className="material-symbol parent-snapshot-shield"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
          </div>

          <div className="parent-stat-grid">
            {snapStats.map(stat => (
              <div key={stat.label} className="parent-stat-card">
                <span className="parent-stat-label">{stat.label.toUpperCase()}</span>
                <span className="parent-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick links ── */}
        <div className="parent-quick-grid">
          {quickLinks.map(link => (
            <a key={link.title} href={link.href} className="parent-quick-card">
              <div className="parent-quick-icon">
                <span className="material-symbol" aria-hidden="true">{link.icon}</span>
              </div>
              <div>
                <p className="parent-quick-title">{link.title}</p>
                <p className="parent-quick-desc">{link.description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* ── Next Session ── */}
        <section className="parent-next-session" aria-labelledby="next-session-title">
          <div className="parent-next-icon">
            <span className="material-symbol" aria-hidden="true">calendar_month</span>
          </div>
          <div>
            <p id="next-session-title" className="parent-next-title">Next Session</p>
            <p className="parent-next-detail">
              {nextSession.day} {nextSession.time} — {nextSession.label}{' '}
              <span className="parent-next-location">({nextSession.location})</span>
            </p>
          </div>
        </section>

        {/* ── Recent activity feed ── */}
        <section className="parent-activity" aria-labelledby="activity-title">
          <h3 id="activity-title" className="parent-section-heading">{''}
            <span className="parent-section-rule" aria-hidden="true" />{' Recent Activity'}
          </h3>

          <div className="parent-activity-list">
            {activityItems.map(item => (
              <div key={item.icon + item.when} className="parent-activity-item">
                <div className={`parent-activity-dot${item.accent ? ' accent' : ''}`} aria-hidden="true">
                  <span className="material-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="parent-activity-body">
                  <p className="parent-activity-text">{item.text}</p>
                  <small className="parent-activity-when">{item.when}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Bottom nav ── */}
      <nav className="parent-bottom-nav" aria-label="Parent navigation">
        <a href="/parent" className="is-active">
          <span className="material-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <small>Home</small>
        </a>
        <a href="#reports">
          <span className="material-symbol">bar_chart</span>
          <small>Reports</small>
        </a>
        <a href="/dashboard">
          <span className="material-symbol">manage_accounts</span>
          <small>Profile</small>
        </a>
        <a href="/login" onClick={(e) => { e.preventDefault(); logout(); }}>
          <span className="material-symbol">logout</span>
          <small>Sign Out</small>
        </a>
      </nav>
    </div>
  )
}
