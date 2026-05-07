import { useState } from 'react';

const requirements = [
  "Describe what you attempted in full",
  "Explain what went well and what you found difficult",
  "Mention any strategies you used or adapted",
];

function SubmitEvidence() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      globalThis.history.back();
    }, 2000);
  };

  return (
    <div className="submit-page">
      <header className="submit-topbar">
        <div className="submit-topbar-left">
          <button
            className="submit-back-btn"
            aria-label="Back to dashboard"
            onClick={() => globalThis.history.back()}
          >
            <span className="material-symbol">arrow_back</span>
          </button>
          <h1>ACADEMY HUB</h1>
        </div>

        <div className="submit-topbar-right">
          <div className="submit-avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrH53QJgKV3Mud-x09O4krbNlP5HsitpBiGrWnknakrImsCf7ULoydnn9tEJZz1heqbwJTavwci1lVZzZ_2vExggI1rs5qlxJaruQ1J3i3Wbt2PxFN-8TsAKG9ZiQuiG5Iy_0RJv_JMLjbLau7-2bTGy9OYWFtREvzkI9z_hzDe-n-MQDQ3xbfYrQsEHLAaYokGr2zxsDeWjc_ntFxDuFCUi_2cXG8QWWSn_AnlQjdhp3DAv4tMFgudvSJisHs89sbFZiIbwlVXMA"
              alt="Player avatar"
            />
          </div>
        </div>
      </header>

      <main className="submit-main">
        <div className="submit-glow submit-glow--tl" />
        <div className="submit-glow submit-glow--br" />

        {/* Page header */}
        <section className="submit-hero">
          <div className="submit-kicker">
            <span className="material-symbol submit-kicker-icon">stars</span>
            <span>ROCKET LEAGUE MASTERY</span>
          </div>
          <h2 className="submit-title">MASTER THE FLIP RESET</h2>
          <p className="submit-subtitle">
            Demonstrate your aerial control. Describe how you practiced the flip
            reset and what you've learned so your coach can provide targeted
            feedback.
          </p>
        </section>

        {/* Bento grid */}
        <div className="submit-grid">
          {/* Sidebar */}
          <div className="submit-sidebar">
            <div className="submit-requirements-card">
              <div className="submit-req-header">
                <span className="submit-req-label">REQUIREMENTS</span>
                <div className="submit-req-dots">
                  <span className="submit-dot submit-dot--active" />
                  <span className="submit-dot" />
                  <span className="submit-dot" />
                </div>
              </div>
              <ul className="submit-req-list">
                {requirements.map((req) => (
                  <li key={req} className="submit-req-item">
                    <span className="material-symbol submit-req-icon">
                      check_circle
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="submit-coach-tip">
              <h3 className="submit-tip-title">COACH'S TIP</h3>
              <p className="submit-tip-body">
                "Focus your note on the contact point under the ball. If your
                timing felt off, explain exactly when — that's the most useful
                feedback you can give me!"
              </p>
            </div>

            <div className="submit-xp-preview">
              <span className="material-symbol submit-xp-icon">bolt</span>
              <div>
                <strong>+250 XP</strong>
                <p>Awarded on coach approval</p>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="submit-form-area">
            <div className="submit-challenge-context">
              <div className="submit-challenge-badge">
                <span className="material-symbol">emoji_events</span>
                <span>FLIP RESET CHALLENGE</span>
              </div>
              <span className="submit-challenge-status">NOT STARTED</span>
            </div>

            <div className="submit-field">
              <div className="submit-field-meta">
                <label htmlFor="submit-note" className="submit-field-label">
                  YOUR COACH NOTE
                </label>
                <span className="submit-char-count">0 / 500</span>
              </div>
              <textarea
                id="submit-note"
                className="submit-textarea"
                placeholder="Tell your coach what you found difficult or what you're proud of. Describe what happened when you attempted the challenge..."
                maxLength={500}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const counter = target
                    .closest(".submit-field")
                    ?.querySelector(".submit-char-count");
                  if (counter)
                    counter.textContent = `${target.value.length} / 500`;
                }}
              />
            </div>

            <div className="submit-actions">
              <div className="submit-identity">
                <div className="submit-identity-icon">
                  <span className="material-symbol">verified</span>
                </div>
                <div>
                  <p className="submit-identity-name">Submitting as Player</p>
                  <p className="submit-identity-note">
                    Submission will be private to coaches
                  </p>
                </div>
              </div>
              <button type="button" className="submit-btn" onClick={handleSubmit} disabled={submitted}>
                {submitted ? 'SUBMITTED!' : 'SUBMIT FOR COACH REVIEW'}{' '}
                <span className="material-symbol">{submitted ? 'check_circle' : 'send'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {submitted && (
        <div className="submit-success-overlay">
          <div className="submit-success-card">
            <span className="material-symbol submit-success-icon">check_circle</span>
            <h2>SUBMISSION RECEIVED!</h2>
            <p>Your coach note has been sent for review. You'll earn XP once it's approved.</p>
          </div>
        </div>
      )}

      <nav className="submit-bottom-nav" aria-label="Bottom navigation">
        <a href="/dashboard">
          <span className="material-symbol">leaderboard</span>
          <small>LDRBOARD</small>
        </a>
        <a href="/submit" className="is-active">
          <span
            className="material-symbol"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            edit_note
          </span>
          <small>SUBMIT</small>
        </a>
        <a href="/dashboard">
          <span className="material-symbol">emoji_events</span>
          <small>CHALLENGE</small>
        </a>
        <a href="/dashboard">
          <span className="material-symbol">person</span>
          <small>PROFILE</small>
        </a>
      </nav>
    </div>
  );
}

export default SubmitEvidence;
