import { useParams, Link } from "react-router-dom";
import "../../../portal.css";
import { usePublicBadgeSummary } from "../../../hooks/usePublicBadgeSummary";
import { usePublicPlayerProfile } from "../../../hooks/usePublicPlayerProfile";
import { DEFAULT_AVATAR_URL } from "../../../constants";
import { useTheme } from "../../../context/ThemeContext";

// ── Mini progress bar ─────────────────────────────────────────────────────────
function MiniBar({ value, max, colour }: { value: number; max: number; colour?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="sp-mini-bar">
      <div
        className="sp-mini-bar__fill"
        style={{ width: `${pct}%`, background: colour ?? "var(--sp-accent)" }}
      />
    </div>
  );
}

// Helper to adjust platinum color for light mode
function adjustColorForTheme(color: string, theme: string): string {
  // Platinum (#a8a9ad) needs to be darker in light mode for visibility
  if (color === "#a8a9ad" && theme === "light") {
    return "#7a8a9a";
  }
  return color;
}

export default function StudentPublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { theme } = useTheme();

  const { data: player, loading: playerLoading, notFound, error: playerError } = usePublicPlayerProfile(username);
  const { badges: liveBadges, loading: badgesLoading, error: badgesError } = usePublicBadgeSummary(username);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (playerLoading) {
    return (
      <div className="sp-profile sp-profile--loading">
        <p>Loading player profile…</p>
      </div>
    );
  }

  // ── Not found (C5) ────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="sp-teams">
        <div className="sp-teams__header">
          <h1 className="sp-teams__title">Player not found</h1>
          <p className="sp-teams__subtitle">No player with the username "{username}" exists.</p>
          <Link to="/student/leaderboard" className="sp-btn sp-btn--ghost">← Back to Leaderboard</Link>
        </div>
      </div>
    );
  }

  // ── Generic server/network error (C5) ────────────────────────────────────
  if (playerError) {
    return (
      <div className="sp-profile sp-profile--error">
        <p>⚠️ {playerError}</p>
        <Link to="/student/leaderboard" className="sp-btn sp-btn--ghost" style={{ marginTop: "1rem" }}>← Back to Leaderboard</Link>
      </div>
    );
  }

  if (!player) return null;

  const avatarUrl = player.avatarUrl ?? DEFAULT_AVATAR_URL;
  const rank = player.globalRank;

  // Badge totals from live data
  const totalSubBadgesEarned = liveBadges.reduce((s, b) => s + b.subBadgesEarned, 0);
  const totalSubBadges = liveBadges.reduce((s, b) => s + b.subBadgesTotal, 0);
  const totalSessionsDone = player.moduleProgress.reduce((s, m) => s + m.sessionsCompleted, 0);
  const totalSessions = player.moduleProgress.reduce((s, m) => s + m.sessionsTotal, 0);
  const topBadge = [...liveBadges].sort((a, b) => b.xpEarned - a.xpEarned)[0];

  return (
    <div className="sp-profile">
      {/* Back navigation */}
      <div style={{ marginBottom: "1rem" }}>
        <Link to={-1 as unknown as string} className="sp-btn sp-btn--ghost" style={{ fontSize: "0.9rem" }}>← Back</Link>
      </div>

      {/* Hero */}
      <div className="sp-profile__hero">
        <div
          className="sp-profile__hero-bg"
          style={player.teamColour ? ({ "--team-colour": player.teamColour } as React.CSSProperties) : undefined}
        />
        <div className="sp-profile__hero-content">
          <div className="sp-profile__avatar-wrap">
            <img src={avatarUrl} alt={player.gamertag} className="sp-profile__avatar" />
          </div>
          <div className="sp-profile__hero-info">
            <div className="sp-profile__name-row">
              <h1 className="sp-profile__name">{player.gamertag}</h1>
              <div className="sp-profile__rank-circle" title="Global Rank">
                <span className="sp-profile__rank-num">{rank != null ? `#${rank}` : "—"}</span>
                <span className="sp-profile__rank-label">Rank</span>
              </div>
            </div>
            <div className="sp-profile__details">
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Real name</span>
                <span className="sp-profile__detail-value">{player.realName}</span>
              </span>
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Username</span>
                <span className="sp-profile__detail-value">{player.username}</span>
              </span>
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Joined</span>
                <span className="sp-profile__detail-value">{player.joinedDate}</span>
              </span>
              {player.hub && (
                <span className="sp-profile__detail-item">
                  <span className="sp-profile__detail-label">Hub</span>
                  <span className="sp-profile__detail-value">{player.hub}</span>
                </span>
              )}
            </div>
          </div>
          {player.teamName && (
            <div className="sp-profile__hero-team">
              {player.teamId ? (
                <Link
                  to={`/student/teams/${player.teamId}`}
                  className="sp-profile__team-badge"
                  style={{ textDecoration: "none" }}
                >
                  <span className="sp-profile__team-icon">{player.teamIcon ?? "🏆"}</span>
                  <span className="sp-profile__team-name">{player.teamName}</span>
                </Link>
              ) : (
                <div className="sp-profile__team-badge">
                  <span className="sp-profile__team-icon">{player.teamIcon ?? "🏆"}</span>
                  <span className="sp-profile__team-name">{player.teamName}</span>
                </div>
              )}
              {player.isCaptain && (
                <span style={{ fontSize: "0.8rem", color: "var(--sp-text-muted)", marginTop: "0.3rem" }}>
                  ⭐ Team Captain
                </span>
              )}
            </div>
          )}
        </div>

        {/* Level / XP bar */}
        <div className="sp-profile__xpbar-wrap">
          <div className="sp-xpbar">
            <div className="sp-xpbar__meta">
              <span className="sp-xpbar__level">Level {player.level}</span>
              <span className="sp-xpbar__xptext">{player.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="sp-xpbar__track">
              <div
                className="sp-xpbar__fill"
                style={{ width: `${Math.min(100, Math.round((player.totalXP % 1000) / 10))}%` }}
              >
                <span className="sp-xpbar__pct">
                  {Math.min(100, Math.round((player.totalXP % 1000) / 10))}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="sp-card sp-profile__bio-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">📝 About Me</h2>
        </div>
        <p className="sp-profile__bio-text">{player.bio}</p>
      </div>

      {/* Stats row */}
      <div className="sp-profile__stats-row">
        {[
          { label: "Total XP",     value: player.totalXP.toLocaleString(),           icon: "⚡" },
          { label: "Global Rank",  value: rank != null ? `#${rank}` : "—",           icon: "🏆" },
          { label: "Level",        value: `Lv. ${player.level}`,                     icon: "⭐" },
          { label: "Sub-badges",   value: `${totalSubBadgesEarned}/${totalSubBadges}`, icon: "🏅" },
          { label: "Sessions done",value: `${totalSessionsDone}/${totalSessions}`,    icon: "📦" },
        ].map((s) => (
          <div key={s.label} className="sp-profile__stat-card">
            <span className="sp-profile__stat-icon">{s.icon}</span>
            <span className="sp-profile__stat-value">{s.value}</span>
            <span className="sp-profile__stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Badge Progress — live from backend */}
      <div className="sp-card" style={{ marginTop: "1.5rem" }}>
        <div className="sp-card__header">
          <h2 className="sp-card__title">🏅 Badge Progress</h2>
          <span className="sp-card__subtitle">{totalSubBadgesEarned}/{totalSubBadges} sub-badges earned</span>
        </div>

        {badgesLoading && (
          <div style={{ padding: "1rem", color: "var(--sp-text-muted)" }}>Loading badge progress…</div>
        )}
        {badgesError && !badgesLoading && (
          <div style={{ padding: "1rem", color: "var(--sp-danger, #e74c3c)" }}>⚠️ {badgesError}</div>
        )}
        {!badgesLoading && !badgesError && liveBadges.length === 0 && (
          <div style={{ padding: "1rem", color: "var(--sp-text-muted)" }}>No badges earned yet.</div>
        )}

        {!badgesLoading && !badgesError && liveBadges.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "0.5rem 0" }}>
            {liveBadges.map((b) => {
              const isTop = topBadge?.id === b.id;
              const xpPct = b.subBadgesEarned > 0
                ? Math.round((b.subBadgesEarned / b.subBadgesTotal) * 100)
                : 0;
              const adjustedColor = adjustColorForTheme(b.levelColor, theme);
              return (
                <div key={b.id} className="sp-member-card__badge-row" style={{ padding: "0 1rem" }}>
                  <span className="sp-member-card__badge-icon" title={b.name} style={{ fontSize: "1.5rem" }}>
                    {b.icon}
                  </span>
                  <div className="sp-member-card__badge-detail" style={{ flex: 1 }}>
                    <div className="sp-member-card__badge-meta">
                      <span className="sp-member-card__badge-name">
                        {b.name}
                        {isTop && <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: "var(--sp-text-muted)" }}>★ Top badge</span>}
                      </span>
                      <span className="sp-member-card__badge-level" style={{ color: adjustedColor }}>
                        {b.levelIcon} {b.levelLabel}
                      </span>
                      <span className="sp-member-card__badge-sub">
                        {b.subBadgesEarned}/{b.subBadgesTotal} challenges
                      </span>
                    </div>
                    <MiniBar value={b.subBadgesEarned} max={b.subBadgesTotal} colour={adjustedColor} />
                    <span className="sp-member-card__badge-xp">
                      {b.xpEarned} XP · {xpPct}% challenges completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Module Progress (C4) */}
      <div className="sp-card" style={{ marginTop: "1.5rem" }}>
        <div className="sp-card__header">
          <h2 className="sp-card__title">📦 Module Progress</h2>
          <span className="sp-card__subtitle">{totalSessionsDone}/{totalSessions} sessions completed</span>
        </div>
        {player.moduleProgress.length === 0 && (
          <div style={{ padding: "1rem", color: "var(--sp-text-muted)" }}>No modules enrolled yet.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.5rem 0" }}>
          {player.moduleProgress.map((m) => {
            const done = m.sessionsCompleted === m.sessionsTotal;
            return (
              <div key={m.moduleId} className="sp-member-card__module-row" style={{ padding: "0 1rem" }}>
                <span className="sp-member-card__module-icon">{m.moduleIcon}</span>
                <div className="sp-member-card__module-detail" style={{ flex: 1 }}>
                  <div className="sp-member-card__module-meta">
                    <span className="sp-member-card__module-name">{m.moduleName}</span>
                    <span className={`sp-member-card__module-count${done ? " sp-member-card__module-count--done" : ""}`}>
                      {done ? "✅ Complete" : `${m.sessionsCompleted}/${m.sessionsTotal} sessions`}
                    </span>
                  </div>
                  <MiniBar
                    value={m.sessionsCompleted}
                    max={m.sessionsTotal}
                    colour={done ? "#4ade80" : player.teamColour ?? undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer links */}
      <div className="sp-lb-footer" style={{ marginTop: "2rem" }}>
        {player.teamId && player.teamName && (
          <Link to={`/student/teams/${player.teamId}`} className="sp-btn sp-btn--ghost">
            {player.teamIcon} View {player.teamName} →
          </Link>
        )}
        <Link to="/student/leaderboard" className="sp-btn sp-btn--primary">
          🏆 View Leaderboard →
        </Link>
      </div>
    </div>
  );
}
