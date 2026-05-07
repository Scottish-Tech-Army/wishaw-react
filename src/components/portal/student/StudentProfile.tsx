import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../../portal.css";
import type { SubBadgeDetailDto } from "../../../api/types";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { useBadgeCatalogue } from "../../../hooks/useBadgeCatalogue";
import { useModuleProgress } from "../../../hooks/useModuleProgress";
import { resolveBadgeLevel } from "../../../utils/badgeUtils";
import { DEFAULT_AVATAR_URL } from "../../../constants";

// ── Expandable sub-badge card ─────────────────────────────────────────────────

function ProfileSubBadge({ sub }: { sub: SubBadgeDetailDto }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sp-sub-badge sp-sub-badge--${sub.earned ? "earned" : "locked"}`}>
      <button className="sp-sub-badge__header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="sp-sub-badge__icon">{sub.earned ? sub.icon : "🔒"}</div>
        <div className="sp-sub-badge__body">
          <span className="sp-sub-badge__name">{sub.name}</span>
          <span className="sp-sub-badge__desc">{sub.shortDesc}</span>
        </div>
        <div className="sp-sub-badge__right">
          <span className={`sp-sub-badge__type sp-sub-badge__type--${sub.type}`}>
            {sub.type === "activity" ? "⚡ Activity" : "📖 Lesson"}
          </span>
          <span className={`sp-sub-badge__xp${sub.earned ? " sp-sub-badge__xp--earned" : ""}`}>
            +{sub.xpReward} XP
          </span>
          <span className="sp-sub-badge__chevron">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="sp-sub-badge__detail">
          <p className="sp-sub-badge__criteria">{sub.criteria}</p>
          <div className="sp-sub-badge__meta-row">
            <span className={`sp-sub-badge__type sp-sub-badge__type--${sub.type}`}>
              {sub.type === "activity" ? "⚡ Activity" : "📖 Lesson"}
            </span>
            <div className="sp-sub-badge__skills">
              {sub.skills.map((sk) => (
                <span key={sk} className="sp-sub-badge__skill-chip">{sk}</span>
              ))}
            </div>
            <span className={`sp-sub-badge__xp${sub.earned ? " sp-sub-badge__xp--earned" : ""}`}>
              +{sub.xpReward} XP
            </span>
          </div>
          {sub.earned && sub.earnedDate
            ? <span className="sp-sub-badge__date">✅ Earned {sub.earnedDate}</span>
            : <span className="sp-sub-badge__locked-note">🔒 Not yet earned</span>
          }
        </div>
      )}
    </div>
  );
}

const levelColors: Record<string, string> = {
  bronze:   "#cd7f32",
  silver:   "#a8a9ad",
  gold:     "#ffd700",
  platinum: "#a8a9ad",
};

const levelColorsLight: Record<string, string> = {
  ...levelColors,
  platinum: "#7a8a9a",
};

export default function StudentProfile() {
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const colors = theme === "light" ? levelColorsLight : levelColors;
  const initialTab = (searchParams.get("tab") ?? "badges") as "badges" | "modules" | "stats" | "history";
  const [activeTab, setActiveTab] = useState<"badges" | "modules" | "stats" | "history">(initialTab);
  const [expandedMainBadges, setExpandedMainBadges] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const HISTORY_PAGE_SIZE = 5;
  const [historyPage, setHistoryPage] = useState(1);
  const tabsRef = useRef<HTMLDivElement>(null);

  const studentId = user?.studentId ?? null;

  const { data: dashboard, loading: dashLoading, error: dashError } = useDashboard(studentId);
  const { data: catalogue, loading: badgesLoading, error: badgesError } = useBadgeCatalogue(studentId);
  const { data: modules, loading: modulesLoading, error: modulesError } = useModuleProgress(studentId);

  // Scroll to tabs section when tab parameter is present and data is loaded
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && !dashLoading && dashboard && tabsRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams, dashLoading, dashboard]);

  function toggleMainBadge(id: number) {
    setExpandedMainBadges((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleModule(id: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const badgeLevels = catalogue?.badgeLevels ?? [];
  const mainBadges = catalogue?.badges ?? [];
  const allSubBadges = mainBadges.flatMap((m) => m.subBadges);
  const earnedCount = allSubBadges.filter((b) => b.earned).length;
  const totalCount = allSubBadges.length;

  const xp = dashboard?.xp ?? 0;
  const xpForNextLevel = dashboard?.xpForNextLevel ?? 1;
  const xpPct = Math.round((xp / xpForNextLevel) * 100);

  const avatarUrl = dashboard?.avatarUrl ?? DEFAULT_AVATAR_URL;

  const completedModules = (modules ?? []).filter(
    (m) => m.subBadges.length > 0 && m.subBadges.every((s) => s.earned),
  ).length;

  // Loading / error guards
  const anyLoading = dashLoading || badgesLoading || modulesLoading;
  const criticalError = dashError ?? badgesError;

  if (!studentId) {
    return (
      <div className="sp-profile sp-profile--error">
        <p>⚠️ Could not determine your student ID. Please log in again.</p>
      </div>
    );
  }

  if (anyLoading && !dashboard) {
    return (
      <div className="sp-profile sp-profile--loading">
        <p>Loading your profile…</p>
      </div>
    );
  }

  if (criticalError) {
    return (
      <div className="sp-profile sp-profile--error">
        <p>⚠️ {criticalError}</p>
      </div>
    );
  }

  return (
    <div className="sp-profile">
      {/* Profile hero */}
      <div className="sp-profile__hero">
        <div
          className="sp-profile__hero-bg"
          style={dashboard?.teamColour ? ({ "--team-colour": dashboard.teamColour } as React.CSSProperties) : undefined}
        />
        <div className="sp-profile__hero-content">
          <div className="sp-profile__avatar-wrap">
            <img src={avatarUrl} alt="avatar" className="sp-profile__avatar" />
          </div>
          <div className="sp-profile__hero-info">
            <div className="sp-profile__name-row">
              <h1 className="sp-profile__name">{dashboard?.gamertag ?? "—"}</h1>
              <div className="sp-profile__rank-circle" title="Global Rank">
                <span className="sp-profile__rank-num">
                  {dashboard?.leaderboardRank != null ? `#${dashboard.leaderboardRank}` : "—"}
                </span>
                <span className="sp-profile__rank-label">Rank</span>
              </div>
            </div>
            <div className="sp-profile__details">
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Real name</span>
                <span className="sp-profile__detail-value">{dashboard?.name ?? "—"}</span>
              </span>
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Username</span>
                <span className="sp-profile__detail-value">{dashboard?.username ?? "—"}</span>
              </span>
              <span className="sp-profile__detail-item">
                <span className="sp-profile__detail-label">Joined</span>
                <span className="sp-profile__detail-value">{dashboard?.joinedDate ?? "—"}</span>
              </span>
              {dashboard?.hub && (
                <span className="sp-profile__detail-item">
                  <span className="sp-profile__detail-label">Hub</span>
                  <span className="sp-profile__detail-value">{dashboard.hub}</span>
                </span>
              )}
            </div>
          </div>
          {dashboard?.teamName && (
            <div className="sp-profile__hero-team">
              {dashboard.teamId ? (
                <Link
                  to={`/student/teams/${dashboard.teamId}`}
                  className="sp-profile__team-badge"
                  style={{ textDecoration: "none" }}
                >
                  <span className="sp-profile__team-icon">{dashboard.teamIcon ?? "🏆"}</span>
                  <span className="sp-profile__team-name">{dashboard.teamName}</span>
                </Link>
              ) : (
                <div className="sp-profile__team-badge">
                  <span className="sp-profile__team-icon">{dashboard.teamIcon ?? "🏆"}</span>
                  <span className="sp-profile__team-name">{dashboard.teamName}</span>
                </div>
              )}
              {dashboard.isCaptain && (
                <span style={{ fontSize: "0.8rem", color: "var(--sp-text-muted)", marginTop: "0.3rem" }}>
                  ⭐ Team Captain
                </span>
              )}
            </div>
          )}
        </div>

        {/* XP bar inside hero */}
        <div className="sp-profile__xpbar-wrap">
          <div className="sp-xpbar">
            <div className="sp-xpbar__meta">
              <span className="sp-xpbar__level">Level {dashboard?.level ?? "—"}</span>
              <span className="sp-xpbar__xptext">
                {xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
              </span>
              <span className="sp-xpbar__level">Level {dashboard ? dashboard.level + 1 : "—"}</span>
            </div>
            <div className="sp-xpbar__track">
              <div className="sp-xpbar__fill" style={{ width: `${xpPct}%` }}>
                <span className="sp-xpbar__pct">{xpPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio section — bio comes from DashboardSummaryDto; deep bio edit lives in Settings */}
      <div className="sp-card sp-profile__bio-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">📝 About Me</h2>
          <Link to="/student/settings" className="sp-btn sp-btn--ghost sp-profile__bio-edit-link" title="Edit bio in Settings">
            ✏️ Edit
          </Link>
        </div>
        <p className="sp-profile__bio-text">{dashboard?.bio ?? "No bio available."}</p>
      </div>

      {/* Stats row */}
      <div className="sp-profile__stats-row">
        {[
          { label: "Total XP", value: xp.toLocaleString(), icon: "⚡" },
          { label: "Global Rank", value: dashboard?.leaderboardRank != null ? `#${dashboard.leaderboardRank}` : "—", icon: "🏆" },
          { label: "Badges Earned", value: `${earnedCount}/${totalCount}`, icon: "🏅" },
          { label: "Modules Done", value: `${completedModules}/${(modules ?? []).length}`, icon: "📦" },
        ].map((s) => (
          <div key={s.label} className="sp-profile__stat-card">
            <span className="sp-profile__stat-icon">{s.icon}</span>
            <span className="sp-profile__stat-value">{s.value}</span>
            <span className="sp-profile__stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="sp-profile__tabs" ref={tabsRef}>
        <button
          className={"sp-tab-btn" + (activeTab === "badges" ? " sp-tab-btn--active" : "")}
          onClick={() => setActiveTab("badges")}
        >
          🏅 Badges ({earnedCount}/{totalCount})
        </button>
        <button
          className={"sp-tab-btn" + (activeTab === "modules" ? " sp-tab-btn--active" : "")}
          onClick={() => setActiveTab("modules")}
        >
          📦 Modules ({(modules ?? []).length})
        </button>
        <button
          className={"sp-tab-btn" + (activeTab === "stats" ? " sp-tab-btn--active" : "")}
          onClick={() => setActiveTab("stats")}
        >
          📊 XP Progress
        </button>
        <button
          className={"sp-tab-btn" + (activeTab === "history" ? " sp-tab-btn--active" : "")}
          onClick={() => setActiveTab("history")}
        >
          📜 XP History
        </button>
      </div>

      {/* Tab content: Badges */}
      {activeTab === "badges" && (
        <div className="sp-profile__tab-content">
          <p className="sp-profile__section-subtitle" style={{ marginBottom: "1rem" }}>
            The academy uses 5 core badges regardless of age, game, or module. Sub-badges from
            each module award XP towards these badges, levelling them from Bronze upwards.
          </p>
          {badgesLoading && <p>Loading badges…</p>}
          {badgesError && <p className="sp-error">⚠️ {badgesError}</p>}
          {!badgesLoading && mainBadges.length === 0 && !badgesError && (
            <p className="sp-empty">No badges found yet — keep playing to earn your first!</p>
          )}
          <div className="sp-badge-groups">
            {mainBadges.map((main) => {
              const earnedSubs = main.subBadges.filter((s) => s.earned).length;
              const totalSubs = main.subBadges.length;
              const currentLevel = resolveBadgeLevel(main.xpEarned, badgeLevels);
              const levelIndex = badgeLevels.findIndex((l) => l.name === currentLevel.name);
              const nextLevel = badgeLevels[levelIndex + 1] ?? null;
              const levelStart = currentLevel.minXP;
              const levelEnd = nextLevel ? nextLevel.minXP : levelStart + 1;
              const badgeXpPct = nextLevel
                ? Math.min(100, Math.round(((main.xpEarned - levelStart) / (levelEnd - levelStart)) * 100))
                : 100;
              const isOpen = expandedMainBadges.has(levelIndex);
              const mainStatus = earnedSubs === 0 ? "locked" : earnedSubs === totalSubs ? "earned" : "in-progress";
              return (
                <div
                  key={main.id}
                  className={`sp-badge-group sp-badge-group--${mainStatus}`}
                  style={{ "--rarity-color": colors[currentLevel.name] ?? currentLevel.color } as React.CSSProperties}
                >
                  <button
                    className="sp-badge-group__header sp-badge-group__header--btn"
                    onClick={() => toggleMainBadge(levelIndex)}
                    aria-expanded={isOpen}
                  >
                    <span className="sp-badge-group__icon">{main.icon}</span>
                    <div className="sp-badge-group__info">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span className="sp-badge-group__name">{main.name}</span>
                        <span
                          className="sp-profile__level-chip"
                          style={{
                            background: (colors[currentLevel.name] ?? currentLevel.color) + "28",
                            color: colors[currentLevel.name] ?? currentLevel.color,
                            borderColor: colors[currentLevel.name] ?? currentLevel.color,
                          }}
                        >
                          {currentLevel.icon} {currentLevel.label}
                        </span>
                      </div>
                      <span className="sp-badge-group__desc">{main.tagline}</span>
                      {/* Per-badge XP progress bar */}
                      <div className="sp-profile__badge-xp-row">
                        <span className="sp-profile__badge-xp-text">
                          {main.xpEarned} XP
                          {nextLevel
                            ? ` · ${nextLevel.minXP - main.xpEarned} to ${nextLevel.label}`
                            : " · Max level!"}
                        </span>
                      </div>
                      <div className="sp-badge-group__progress-track" style={{ marginTop: "0.3rem" }}>
                        <div
                          className="sp-badge-group__progress-fill"
                          style={{ width: `${badgeXpPct}%`, background: colors[currentLevel.name] ?? currentLevel.color }}
                        />
                      </div>
                    </div>
                    <div className="sp-badge-group__progress" style={{ minWidth: "auto" }}>
                      <div className="sp-badge-group__progress-header">
                        <span className="sp-badge-group__progress-text">
                          {earnedSubs}/{totalSubs} challenges
                        </span>
                      </div>
                    </div>
                    <span className="sp-badge-group__chevron">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="sp-badge-group__subs">
                      {/* Link to full catalogue */}
                      <div className="sp-badge-group__catalogue-link-wrap">
                        <Link
                          to={`/student/badges?badge=${main.id}`}
                          className="sp-badge-group__catalogue-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📖 View full badge description →
                        </Link>
                      </div>

                      {/* Sub-badge challenges — expandable */}
                      {main.subBadges.map((sub) => (
                        <ProfileSubBadge key={sub.id} sub={sub} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content: Modules */}
      {activeTab === "modules" && (
        <div className="sp-profile__tab-content">
          <h3 className="sp-profile__section-title">📦 Modules</h3>
          <p className="sp-profile__section-subtitle">
            Structured courses (12–16 weeks) delivered at in-person sessions. Each module has a
            learning outcome and awards sub-badges as you complete weekly challenges.
          </p>
          {modulesLoading && <p>Loading modules…</p>}
          {modulesError && <p className="sp-error">⚠️ {modulesError}</p>}
          {!modulesLoading && (modules ?? []).length === 0 && !modulesError && (
            <p className="sp-empty">No modules enrolled yet.</p>
          )}
          <div className="sp-badge-groups">
            {(modules ?? []).map((mod) => {
              const earnedSubBadges = mod.subBadges.filter((b) => b.earned).length;
              const totalSubBadges = mod.subBadges.length;
              const sessionPct = totalSubBadges > 0 ? Math.round((earnedSubBadges / totalSubBadges) * 100) : 0;
              const modStatus =
                earnedSubBadges === 0
                  ? "locked"
                  : earnedSubBadges === totalSubBadges
                  ? "earned"
                  : "in-progress";
              const isOpen = expandedModules.has(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`sp-badge-group sp-badge-group--${modStatus}`}
                >
                  <button
                    className="sp-badge-group__header sp-badge-group__header--btn"
                    onClick={() => toggleModule(mod.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="sp-badge-group__icon">{mod.icon}</span>
                    <div className="sp-badge-group__info">
                      <span className="sp-badge-group__name">{mod.name}</span>
                      <span className="sp-badge-group__desc">{mod.outcome}</span>
                    </div>
                    <div className="sp-badge-group__progress">
                      <div className="sp-badge-group__progress-header">
                        <span className="sp-badge-group__progress-text">
                          {earnedSubBadges}/{mod.subBadges.length} challenges · {mod.durationWeeks} wks
                        </span>
                        <span className={`sp-badge-group__status-chip sp-badge-group__status-chip--${modStatus}`}>
                          {modStatus === "earned" ? "✅ Complete" : modStatus === "in-progress" ? `🔄 ${sessionPct}%` : "🔒 Not started"}
                        </span>
                      </div>
                      <div className="sp-badge-group__progress-track">
                        <div className="sp-badge-group__progress-fill" style={{ width: `${sessionPct}%` }} />
                      </div>
                    </div>
                    <span className="sp-badge-group__chevron">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {isOpen && (
                    <div className="sp-badge-group__subs">
                      {/* Module meta row */}
                      <div className="sp-module__meta">
                        <span className="sp-module__meta-item">📅 {mod.durationWeeks} weeks</span>
                        <span className="sp-module__meta-item">🏅 {mod.subBadges.length} challenges</span>
                      </div>

                      {/* Challenges table */}
                      <div className="sp-module__tracker-table">
                        <div className="sp-module__tracker-head">
                          <span>Main Badge</span>
                          <span>Challenge</span>
                          <span>XP</span>
                          <span>Description</span>
                          <span></span>
                        </div>
                        {mod.subBadges.map((sub) => {
                          const parentBadge = mainBadges.find((b) => b.id === sub.mainBadgeId);
                          return (
                            <div
                              key={sub.id}
                              className={`sp-module__tracker-row sp-module__tracker-row--${sub.earned ? "done" : "pending"}`}
                            >
                              <span className="sp-module__tracker-main-badge">
                                {parentBadge ? (
                                  <Link
                                    to={`/student/badges?badge=${parentBadge.id}`}
                                    className="sp-module__challenge-badge-pill"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {parentBadge.icon} {parentBadge.name}
                                  </Link>
                                ) : "—"}
                              </span>
                              <span className="sp-module__tracker-sub-badge">
                                <span className="sp-module__tracker-icon">{sub.earned ? sub.icon : "🔒"}</span>
                                {sub.name}
                              </span>
                              <span className={`sp-module__tracker-xp${sub.earned ? " sp-module__tracker-xp--earned" : ""}`}>
                                +{sub.xpReward}
                              </span>
                              <span className="sp-module__tracker-desc">{sub.desc}</span>
                              <span className="sp-module__tracker-status">
                                {sub.earned
                                  ? <span className="sp-module__challenge-earned">✅ {sub.earnedDate}</span>
                                  : <span className="sp-module__challenge-locked">🔒 Locked</span>
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Badges awarded by this module */}
                      {(() => {
                        const awardedBadges = mainBadges.filter((b) =>
                          mod.subBadges.some((s) => s.mainBadgeId === b.id)
                        );
                        return (
                          <div className="sp-module__awarded-badges">
                            <p className="sp-module__sessions-label" style={{ padding: "0.75rem 1rem 0.25rem" }}>
                              Badges awarded by this module
                            </p>
                            <div className="sp-module__awarded-badges-list">
                              {awardedBadges.map((badge) => {
                                const relatedSubs = mod.subBadges.filter((s) => s.mainBadgeId === badge.id);
                                const earnedCount = relatedSubs.filter((s) => s.earned).length;
                                const currentLevel = resolveBadgeLevel(badge.xpEarned, badgeLevels);
                                return (
                                  <Link
                                    key={badge.id}
                                    to={`/student/badges?badge=${badge.id}`}
                                    className="sp-module__awarded-badge-card"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ "--rarity-color": colors[currentLevel.name] ?? currentLevel.color } as React.CSSProperties}
                                  >
                                    <span className="sp-module__awarded-badge-icon">{badge.icon}</span>
                                    <div className="sp-module__awarded-badge-info">
                                      <span className="sp-module__awarded-badge-name">{badge.name}</span>
                                      <span className="sp-module__awarded-badge-sub">
                                        {earnedCount}/{relatedSubs.length} challenges earned
                                      </span>
                                    </div>
                                    <span
                                      className="sp-profile__level-chip"
                                      style={{
                                        background: (colors[currentLevel.name] ?? currentLevel.color) + "28",
                                        color: colors[currentLevel.name] ?? currentLevel.color,
                                        borderColor: colors[currentLevel.name] ?? currentLevel.color,
                                        fontSize: "0.7rem",
                                        padding: "0.15rem 0.45rem",
                                      }}
                                    >
                                      {currentLevel.icon} {currentLevel.label}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content: XP Progress */}
      {activeTab === "stats" && (
        <div className="sp-profile__tab-content">
          <div className="sp-stats-breakdown">
            <div className="sp-card">
              <h3 className="sp-card__title">📈 XP Progress Over Time</h3>
              <div className="sp-xp-chart">
                {[400, 700, 950, 1200, 1600, 1900, 2350].map((val, i) => (
                  <div key={i} className="sp-xp-chart__bar-wrap">
                    <div
                      className="sp-xp-chart__bar"
                      style={{ height: `${(val / 2500) * 100}%` }}
                      title={`${val} XP`}
                    />
                    <span className="sp-xp-chart__label">
                      {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Now"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tab content: XP History */}
      {activeTab === "history" && (
        <div className="sp-profile__tab-content">
          <h3 className="sp-profile__section-title">📜 XP History</h3>
          {dashLoading && <p>Loading XP history…</p>}
          {dashError && <p className="sp-error">⚠️ {dashError}</p>}
          {(() => {
            const allEvents = [...(dashboard?.recentActivity ?? [])].reverse();
            const visible = allEvents.slice(0, historyPage * HISTORY_PAGE_SIZE);
            const hasMore = visible.length < allEvents.length;
            if (!dashLoading && allEvents.length === 0) {
              return <p className="sp-empty">No XP events recorded yet.</p>;
            }
            return (
              <>
                <ul className="sp-xp-history">
                  {visible.map((event) => (
                    <li key={event.id} className="sp-xp-history__item">
                      <span className="sp-xp-history__icon">{event.icon}</span>
                      <span className="sp-xp-history__activity">{event.activity}</span>
                      <span className="sp-xp-history__xp">+{event.xp} XP</span>
                      <span className="sp-xp-history__date">
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                {hasMore && (
                  <div className="sp-xp-history__load-more-wrap">
                    <button
                      className="sp-btn sp-btn--ghost"
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Load more ({allEvents.length - visible.length} remaining)
                    </button>
                  </div>
                )}
                {!hasMore && allEvents.length > HISTORY_PAGE_SIZE && (
                  <p className="sp-xp-history__end-label">All {allEvents.length} events shown</p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
