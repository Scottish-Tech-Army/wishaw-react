import { Link } from "react-router-dom";
import "../../../portal.css";
import { useTeams } from "../../../hooks/useTeams";
import { DEFAULT_AVATAR_URL } from "../../../constants";

// ── Skeleton card shown while loading ─────────────────────────────────────────
function TeamCardSkeleton() {
  return (
    <div className="sp-team-card sp-team-card--skeleton" aria-hidden="true">
      <div className="sp-team-card__accent" style={{ background: "var(--sp-border)" }} />
      <div className="sp-team-card__body">
        <div className="sp-skeleton sp-skeleton--icon" />
        <div className="sp-skeleton sp-skeleton--title" />
        <div className="sp-skeleton sp-skeleton--meta" />
        <div className="sp-skeleton sp-skeleton--desc" />
        <div className="sp-skeleton sp-skeleton--desc sp-skeleton--desc-short" />
        <div className="sp-team-card__footer">
          <div className="sp-team-card__avatars">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sp-skeleton sp-skeleton--avatar" />
            ))}
          </div>
          <div className="sp-skeleton sp-skeleton--label" />
        </div>
      </div>
      <div className="sp-skeleton sp-skeleton--cta" />
    </div>
  );
}

export default function StudentTeams() {
  const { data: teams, loading, error, refresh } = useTeams();

  return (
    <div className="sp-teams">
      <div className="sp-teams__header">
        <h1 className="sp-teams__title">👥 Teams</h1>
        <p className="sp-teams__subtitle">Browse all WYMCA Esports teams and their members.</p>
      </div>

      {/* ── LOADING STATE ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="sp-teams__grid">
          {[0, 1, 2].map((i) => <TeamCardSkeleton key={i} />)}
        </div>
      )}

      {/* ── ERROR STATE ────────────────────────────────────────────────────── */}
      {!loading && error !== null && (
        <div className="sp-lb-error" role="alert">
          <span className="sp-lb-error__icon">⚠️</span>
          <p className="sp-lb-error__msg">{error}</p>
          <button className="sp-lb-error__retry" onClick={refresh}>Retry</button>
        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────────────────────── */}
      {!loading && error === null && teams !== null && teams.length === 0 && (
        <div className="sp-lb-loading">
          <p className="sp-lb-loading__text">No teams have been set up yet. Check back soon!</p>
        </div>
      )}

      {/* ── TEAM GRID ──────────────────────────────────────────────────────── */}
      {!loading && error === null && teams !== null && teams.length > 0 && (
        <div className="sp-teams__grid">
          {teams.map((team) => {
            const avatarUrls = team.memberAvatarUrls.slice(0, 4);
            const overflowCount = team.memberCount - avatarUrls.length;

            return (
              <Link
                key={team.id}
                to={`/student/teams/${team.id}`}
                className="sp-team-card"
                style={{ "--team-colour": team.colour } as React.CSSProperties}
              >
                <div className="sp-team-card__accent" />
                <div className="sp-team-card__body">
                  <div className="sp-team-card__icon">{team.icon}</div>
                  <h2 className="sp-team-card__name">{team.name}</h2>
                  <div className="sp-team-card__meta">
                    <span className="sp-team-card__meta-item">🏢 {team.hub}</span>
                    <span className="sp-team-card__meta-item">📅 Since {team.founded}</span>
                  </div>
                  <p className="sp-team-card__desc">{team.description}</p>
                  <div className="sp-team-card__footer">
                    <div className="sp-team-card__avatars">
                      {avatarUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url ?? DEFAULT_AVATAR_URL}
                          alt="Team member"
                          className="sp-team-card__avatar"
                        />
                      ))}
                      {overflowCount > 0 && (
                        <span className="sp-team-card__avatar-more">+{overflowCount}</span>
                      )}
                    </div>
                    <div className="sp-team-card__member-info">
                      <span className="sp-team-card__member-count">
                        {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                      </span>
                      {team.captainGamertag && (
                        <span className="sp-team-card__captain-tag">⭐ {team.captainGamertag}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="sp-team-card__cta">View team →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
