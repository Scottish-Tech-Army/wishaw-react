import { useParams, Link } from "react-router-dom";
import "../../../portal.css";
import { useTeamDetail } from "../../../hooks/useTeamDetail";
import type { TeamMemberDto } from "../../../api/types";
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

// ── Single member card ────────────────────────────────────────────────────────
// ── Single member card ────────────────────────────────────────────────────────
function MemberCard({ member, teamColour, theme }: { member: TeamMemberDto; teamColour: string; theme: string }) {
  const totalSubBadgesEarned = member.badgeProgress.reduce((s, b) => s + b.subBadgesEarned, 0);
  const totalSubBadges       = member.badgeProgress.reduce((s, b) => s + b.subBadgesTotal, 0);
  const totalSessionsDone    = member.moduleProgress.reduce((s, m) => s + m.sessionsCompleted, 0);
  const totalSessions        = member.moduleProgress.reduce((s, m) => s + m.sessionsTotal, 0);

  return (
    <div className="sp-member-card">
      {/* Captain banner */}
      {member.isCaptain && (
        <div className="sp-member-card__captain-banner">⭐ Team Captain</div>
      )}

      {/* Header */}
      <div className="sp-member-card__header">
        <div className="sp-member-card__avatar-wrap">
          <img src={member.avatarUrl ?? DEFAULT_AVATAR_URL} alt={member.gamertag} className="sp-member-card__avatar" />
          <span
            className="sp-member-card__level-pill"
            style={{ background: teamColour }}
          >
            Lv {member.level}
          </span>
        </div>
        <div className="sp-member-card__info">
          <h3 className="sp-member-card__gamertag">{member.gamertag}</h3>
          <span className="sp-member-card__realname">{member.realName}</span>
          <span className="sp-member-card__username">{member.username}</span>
          <div className="sp-member-card__meta-row">
            <span className="sp-member-card__meta-item">📅 Joined {member.joinedDate}</span>
            <span className="sp-member-card__meta-item">⚡ {member.totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Badge progress */}
      <div className="sp-member-card__section">
        <div className="sp-member-card__section-header">
          <span className="sp-member-card__section-title">🏅 Badge Progress</span>
          <span className="sp-member-card__section-summary">
            {totalSubBadgesEarned}/{totalSubBadges} sub-badges
          </span>
        </div>
        <div className="sp-member-card__badges">
          {member.badgeProgress.map((b) => {
            const adjustedColor = adjustColorForTheme(b.levelColor, theme);
            return (
              <div key={b.mainBadgeId} className="sp-member-card__badge-row">
                <span className="sp-member-card__badge-icon" title={b.mainBadgeName}>
                  {b.mainBadgeIcon}
                </span>
                <div className="sp-member-card__badge-detail">
                  <div className="sp-member-card__badge-meta">
                    <span className="sp-member-card__badge-name">{b.mainBadgeName}</span>
                    <span
                      className="sp-member-card__badge-level"
                      style={{ color: adjustedColor }}
                    >
                      {b.levelIcon} {b.levelLabel}
                    </span>
                    <span className="sp-member-card__badge-sub">
                      {b.subBadgesEarned}/{b.subBadgesTotal}
                    </span>
                  </div>
                  <MiniBar value={b.subBadgesEarned} max={b.subBadgesTotal} colour={adjustedColor} />
                  <span className="sp-member-card__badge-xp">{b.xpEarned} XP · {b.subBadgesEarned}/{b.subBadgesTotal} sub-badges</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module progress */}
      <div className="sp-member-card__section">
        <div className="sp-member-card__section-header">
          <span className="sp-member-card__section-title">📦 Module Progress</span>
          <span className="sp-member-card__section-summary">
            {totalSessionsDone}/{totalSessions} sessions
          </span>
        </div>
        <div className="sp-member-card__modules">
          {member.moduleProgress.map((m) => {
            const done = m.sessionsCompleted === m.sessionsTotal;
            return (
              <div key={m.moduleId} className="sp-member-card__module-row">
                <span className="sp-member-card__module-icon">{m.moduleIcon}</span>
                <div className="sp-member-card__module-detail">
                  <div className="sp-member-card__module-meta">
                    <span className="sp-member-card__module-name">{m.moduleName}</span>
                    <span className={`sp-member-card__module-count${done ? " sp-member-card__module-count--done" : ""}`}>
                      {done ? "✅" : `${m.sessionsCompleted}/${m.sessionsTotal}`}
                    </span>
                  </div>
                  <MiniBar value={m.sessionsCompleted} max={m.sessionsTotal} colour={done ? "#4ade80" : teamColour} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View profile CTA */}
      <div className="sp-member-card__cta">
        View full profile →
      </div>
    </div>
  );
}

// ── Skeleton components for loading state ────────────────────────────────────
function MemberCardSkeleton() {
  return (
    <div className="sp-member-card sp-member-card--skeleton" aria-hidden="true">
      <div className="sp-member-card__header">
        <div className="sp-member-card__avatar-wrap">
          <div className="sp-skeleton sp-skeleton--avatar" />
        </div>
        <div className="sp-member-card__info">
          <div className="sp-skeleton sp-skeleton--title" />
          <div className="sp-skeleton sp-skeleton--meta" />
          <div className="sp-skeleton sp-skeleton--meta" />
        </div>
      </div>
      <div className="sp-skeleton sp-skeleton--desc" />
      <div className="sp-skeleton sp-skeleton--desc sp-skeleton--desc-short" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="sp-team-detail__hero" aria-hidden="true">
      <div className="sp-team-detail__hero-accent" />
      <div className="sp-team-detail__hero-body">
        <div className="sp-skeleton sp-skeleton--icon" style={{ width: 64, height: 64, borderRadius: "50%" }} />
        <div className="sp-team-detail__hero-info">
          <div className="sp-skeleton sp-skeleton--title" style={{ width: 200 }} />
          <div className="sp-skeleton sp-skeleton--meta" style={{ width: 300, marginTop: 8 }} />
          <div className="sp-skeleton sp-skeleton--desc" style={{ marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentTeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, loading, error, refresh } = useTeamDetail(teamId);
  const { theme } = useTheme();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sp-team-detail">
        <Link to="/student/teams" className="sp-team-detail__back">← All Teams</Link>
        <HeroSkeleton />
        <div className="sp-team-detail__members-heading">
          <div className="sp-skeleton sp-skeleton--title" style={{ width: 140 }} />
        </div>
        <div className="sp-team-detail__members-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <MemberCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── 404 state ──────────────────────────────────────────────────────────────
  if (error === "Team not found.") {
    return (
      <div className="sp-teams">
        <div className="sp-teams__header">
          <h1 className="sp-teams__title">Team not found</h1>
          <Link to="/student/teams" className="sp-btn sp-btn--ghost">← Back to Teams</Link>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="sp-team-detail">
        <Link to="/student/teams" className="sp-team-detail__back">← All Teams</Link>
        <div className="sp-error-state">
          <p className="sp-error-state__message">{error}</p>
          <button className="sp-btn sp-btn--primary" onClick={refresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!team) return null;

  const members = team.members;
  // Members arrive pre-sorted from the backend (captain first, then XP desc).
  // Keep a client-side sort as a safety net in case the backend order differs.
  const sorted = [...members].sort((a, b) => {
    if (a.isCaptain && !b.isCaptain) return -1;
    if (!a.isCaptain && b.isCaptain) return 1;
    return b.totalXP - a.totalXP;
  });

  const captain = members.find((m) => m.isCaptain);
  const totalXP = members.reduce((s, m) => s + m.totalXP, 0);

  return (
    <div className="sp-team-detail">
      {/* Breadcrumb */}
      <Link to="/student/teams" className="sp-team-detail__back">← All Teams</Link>

      {/* Team hero */}
      <div
        className="sp-team-detail__hero"
        style={{ "--team-colour": team.colour } as React.CSSProperties}
      >
        <div className="sp-team-detail__hero-accent" />
        <div className="sp-team-detail__hero-body">
          <div className="sp-team-detail__hero-icon">{team.icon}</div>
          <div className="sp-team-detail__hero-info">
            <h1 className="sp-team-detail__hero-name">{team.name}</h1>
            <div className="sp-team-detail__hero-meta">
              <span>🏢 {team.hub}</span>
              <span>🎮 {team.game}</span>
              <span>📅 Est. {team.founded}</span>
              {captain && <span>⭐ Captain: {captain.gamertag}</span>}
            </div>
            <p className="sp-team-detail__hero-desc">{team.description}</p>
          </div>
          <div className="sp-team-detail__hero-stats">
            <div className="sp-team-detail__hero-stat">
              <span className="sp-team-detail__hero-stat-value">{members.length}</span>
              <span className="sp-team-detail__hero-stat-label">Members</span>
            </div>
            <div className="sp-team-detail__hero-stat">
              <span className="sp-team-detail__hero-stat-value">{totalXP.toLocaleString()}</span>
              <span className="sp-team-detail__hero-stat-label">Team XP</span>
            </div>
            <div className="sp-team-detail__hero-stat">
              <span className="sp-team-detail__hero-stat-value">
                {Math.round(totalXP / (members.length || 1)).toLocaleString()}
              </span>
              <span className="sp-team-detail__hero-stat-label">Avg XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member cards */}
      <div className="sp-team-detail__members-heading">
        <h2 className="sp-team-detail__members-title">Team Members</h2>
        <span className="sp-team-detail__members-count">{members.length} member{members.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="sp-team-detail__members-grid">
        {sorted.map((member) => (
          <Link
            key={member.studentId}
            to={`/student/players/${member.username.replace(/^@/, "")}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <MemberCard member={member} teamColour={team.colour} theme={theme} />
          </Link>
        ))}
      </div>
    </div>
  );
}
