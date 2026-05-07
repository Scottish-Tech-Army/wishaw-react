import { useState, type FormEvent } from 'react'
import '../styles/registration.css'

export interface Session {
  id: string
  game: string
  day: string
  time: string
  group: '8-12' | '13-18'
}

export const SESSIONS: Session[] = [
  { id: 'minecraft-wed',   game: 'Minecraft',     day: 'Wednesday', time: '16:30', group: '8-12'  },
  { id: 'fortnite-fri',    game: 'Fortnite',      day: 'Friday',    time: '17:00', group: '13-18' },
  { id: 'rocket-tue',      game: 'Rocket League',  day: 'Tuesday',   time: '17:00', group: '13-18' },
  { id: 'minecraft-sat',   game: 'Minecraft',     day: 'Saturday',  time: '10:00', group: '8-12'  },
  { id: 'casual-thu',      game: 'Casual Gaming',  day: 'Thursday',  time: '16:00', group: '13-18' },
]

const AGES = ['8', '9', '10', '11', '12', '13+']

interface RegistrationForm {
  parentName: string
  parentEmail: string
  parentPhone: string
  gamerName: string
  gamerAge: string
  gamerDob: string
  sessionMinecraft: boolean
}

const empty: RegistrationForm = {
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  gamerName: '',
  gamerAge: '',
  gamerDob: '',
  sessionMinecraft: false,
}

export default function RegistrationPage() {
  const [form, setForm] = useState<RegistrationForm>(empty)
  const [showToast, setShowToast] = useState(false)

  function set<K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // POST /registration when API is ready
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  return (
    <div className="reg-page">
      {/* ── Atmosphere ── */}
      <div className="reg-bg" aria-hidden="true">
        <div className="neon-grid" />
        <div className="orb-tl" />
        <div className="orb-bl" />
      </div>

      {/* ── Top App Bar ── */}
      <header className="reg-header">
        <div className="reg-header-left">
          <button
            className="reg-back-btn"
            aria-label="Go back"
            onClick={() => globalThis.history.back()}
          >
            <span className="material-symbol">arrow_back</span>
          </button>
          <span className="reg-brand">YMCA Academy</span>
        </div>
        <div className="reg-avatar" aria-hidden="true">
          <img src="https://ui-avatars.com/api/?name=P&background=1f2b37&color=109dd1" alt="" />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="reg-main">
        <div className="reg-inner">

          {/* Hero */}
          <div className="reg-hero">
            <span className="reg-eyebrow">Join the Academy</span>
            <h2 className="reg-title">
              Registration<br /><span>Portal</span>
            </h2>
            <p className="reg-subtitle">
              Secure your spot in the next evolution of competitive gaming at Wishaw YMCA.
            </p>
          </div>

          {/* Form */}
          <form className="reg-form" onSubmit={handleSubmit} noValidate>

            {/* ── 01 Parent Details ── */}
            <section aria-labelledby="section-parent">
              <div className="reg-section-heading">
                <div className="reg-section-rule" />
                <h3 id="section-parent">01. Parent Details</h3>
              </div>

              <div className="reg-grid">
                <div className="reg-field">
                  <label htmlFor="parentName">Your Name</label>
                  <input
                    id="parentName"
                    className="reg-input"
                    type="text"
                    placeholder="Full legal name"
                    autoComplete="name"
                    value={form.parentName}
                    onChange={e => set('parentName', e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="parentEmail">Your Email</label>
                  <input
                    id="parentEmail"
                    className="reg-input"
                    type="email"
                    placeholder="email@address.com"
                    autoComplete="email"
                    value={form.parentEmail}
                    onChange={e => set('parentEmail', e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field reg-col-span-2">
                  <label htmlFor="parentPhone">Your Phone Number</label>
                  <input
                    id="parentPhone"
                    className="reg-input"
                    type="tel"
                    placeholder="+44 0000 000000"
                    autoComplete="tel"
                    value={form.parentPhone}
                    onChange={e => set('parentPhone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {/* ── 02 Young Gamer ── */}
            <section aria-labelledby="section-gamer">
              <div className="reg-section-heading">
                <div className="reg-section-rule" />
                <h3 id="section-gamer">02. Young Gamer</h3>
              </div>

              <div className="reg-grid">
                <div className="reg-field reg-col-span-2">
                  <label htmlFor="gamerName">Young Gamer Name</label>
                  <input
                    id="gamerName"
                    className="reg-input"
                    type="text"
                    placeholder="Gamer's full name"
                    value={form.gamerName}
                    onChange={e => set('gamerName', e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="gamerAge">Young Gamer Age</label>
                  <select
                    id="gamerAge"
                    className="reg-select"
                    value={form.gamerAge}
                    onChange={e => set('gamerAge', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select age</option>
                    {AGES.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                <div className="reg-field">
                  <label htmlFor="gamerDob">Young Gamer DoB</label>
                  <input
                    id="gamerDob"
                    className="reg-input"
                    type="date"
                    value={form.gamerDob}
                    onChange={e => set('gamerDob', e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {/* ── 03 Session Selection ── */}
            <section aria-labelledby="section-session">
              <div className="reg-section-heading">
                <div className="reg-section-rule" />
                <h3 id="section-session">03. Session Selection</h3>
              </div>

              <div className="reg-session-card">
                <div className="reg-session-card-hover-bg" aria-hidden="true" />
                <label className="reg-session-label" htmlFor="sessionMinecraft" aria-label="Select Minecraft Academy session, Mondays 17:30 to 19:00, ages 8 to 12">
                  <input
                    id="sessionMinecraft"
                    className="reg-session-checkbox"
                    type="checkbox"
                    checked={form.sessionMinecraft}
                    onChange={e => set('sessionMinecraft', e.target.checked)}
                  />
                  <div className="reg-session-body">
                    <div>
                      <div className="reg-session-tag">
                        <span className="material-symbol">star</span>
                        <span className="tag-text">Age 8–12</span>
                      </div>
                      <h4 className="reg-session-title">Minecraft Academy</h4>
                      <div className="reg-session-meta">
                        <span className="reg-meta-item">
                          <span className="material-symbol" aria-hidden="true">calendar_today</span>
                          <span>Monday</span>
                        </span>
                        <span className="reg-meta-item">
                          <span className="material-symbol" aria-hidden="true">schedule</span>
                          <span>17:30 – 19:00</span>
                        </span>
                      </div>
                    </div>
                    <div className="reg-session-thumb" aria-hidden="true">
                      <img
                        src="https://ui-avatars.com/api/?name=MC&background=109dd1&color=ffffff&size=88&bold=true"
                        alt=""
                      />
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="reg-actions">
              <button type="submit" className="reg-submit-btn">
                Complete Registration
              </button>

              <div className="reg-secure-badge" aria-label="Secure registration">
                <span className="material-symbol">verified_user</span>
                <span className="badge-text">Secure Registration</span>
                <div className="reg-pulse-dot" />
              </div>
            </div>

          </form>
        </div>
      </main>

      {/* ── Grid-line decor ── */}
      <div className="reg-grid-lines" aria-hidden="true">
        <span className="gl-h" />
        <span className="gl-v1" />
        <span className="gl-v2" />
      </div>

      {/* ── Success toast ── */}
      <output
        className={`reg-toast${showToast ? ' show' : ''}`}
        aria-live="polite"
      >
        <span className="material-symbol" aria-hidden="true">check_circle</span>
        <span>Registration submitted successfully!</span>
      </output>
    </div>
  )
}
