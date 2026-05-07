import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../../portal.css";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "../../../hooks/useDashboard";

// ── XP Progress Bar ───────────────────────────────────────────────────────────

function XPBar({ xp, xpNext, level }: { xp: number; xpNext: number; level: number }) {
  const pct = Math.round((xp / xpNext) * 100);
  const [animPct, setAnimPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimPct(pct); },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct]);

  const remaining = xpNext - xp;

  return (
    <div className="sp-xpbar" ref={ref}>
      <div className="sp-xpbar__meta">
        <span className="sp-xpbar__level">Level {level}</span>
        <span className="sp-xpbar__xptext">
          {xp.toLocaleString()} / {xpNext.toLocaleString()} XP
          <span className="sp-xpbar__remaining">&nbsp;·&nbsp;{remaining.toLocaleString()} XP to go</span>
        </span>
        <span className="sp-xpbar__level">Level {level + 1}</span>
      </div>
      <div className="sp-xpbar__track">
        <div className="sp-xpbar__fill" style={{ width: `${animPct}%` }}>
          <span className="sp-xpbar__pct">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="sp-dashboard sp-dashboard--loading" aria-busy="true" aria-label="Loading dashboard…">
      <div className="sp-skeleton sp-skeleton--bar" />
      <div className="sp-stats-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sp-stat-card sp-skeleton sp-skeleton--card" />
        ))}
      </div>
      <div className="sp-dashboard__grid">
        <div className="sp-card sp-skeleton sp-skeleton--panel" />
        <div className="sp-card sp-skeleton sp-skeleton--panel" />
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="sp-dashboard sp-dashboard--error" role="alert">
      <div className="sp-error-card">
        <span className="sp-error-card__icon">⚠️</span>
        <p className="sp-error-card__message">{message}</p>
        <button className="sp-btn sp-btn--primary" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

// ── Quips between badge hexes ─────────────────────────────────────────────────

const BADGE_QUIPS = [
  { icon: "🎮", text: "Game On!" },
  { icon: "⚡", text: "Level Up!" },
  { icon: "🏆", text: "Stay Hungry!" },
  { icon: "🔥", text: "Keep Grinding!" },
];

// ── Format next-session datetime ──────────────────────────────────────────────

function formatNextSession(isoDatetime: string | null): string {
  if (!isoDatetime) return "Not scheduled";
  const d = new Date(isoDatetime);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays < 7) {
    const dayName = d.toLocaleDateString("en-GB", { weekday: "long" });
    return `${dayName}, ${timeStr}`;
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + `, ${timeStr}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, loading, error, refresh } = useDashboard(user?.studentId);

  /** Returns a level colour safe for the current theme (platinum is near-white, so use a darker shade in light mode) */
  function getLevelColor(name: string, color: string): string {
    if (name === "platinum" && theme === "light") return "#7a8a9a";
    return color;
  }

  if (loading) return <DashboardSkeleton />;
  if (error)   return <DashboardError message={error} onRetry={refresh} />;
  if (!data)   return null;

  const xpToNext = data.xpForNextLevel - data.xp;

  return (
    <div className="sp-dashboard">
      {/* XP bar */}
      <XPBar xp={data.xp} xpNext={data.xpForNextLevel} level={data.level} />

      {/* Weekly stats row */}
      <div className="sp-stats-row">
        <div className="sp-stat-card">
          <span className="sp-stat-card__icon">📅</span>
          <div className="sp-stat-card__body">
            <span className="sp-stat-card__label">This Week's XP</span>
            <span className="sp-stat-card__value">{data.weeklyXp.toLocaleString()}</span>
          </div>
        </div>
        <div className="sp-stat-card">
          <span className="sp-stat-card__icon">🏅</span>
          <div className="sp-stat-card__body">
            <span className="sp-stat-card__label">Badges Earned</span>
            <span className="sp-stat-card__value">
              {data.earnedSubBadges}{" "}
              <span className="sp-stat-card__goal">/ {data.totalSubBadges}</span>
            </span>
          </div>
        </div>
        <div className="sp-stat-card">
          <span className="sp-stat-card__icon">🐺</span>
          <div className="sp-stat-card__body">
            <span className="sp-stat-card__label">Team XP This Week</span>
            <span className="sp-stat-card__value">{data.teamWeeklyXp.toLocaleString()}</span>
          </div>
        </div>
        <div className="sp-stat-card">
          <span className="sp-stat-card__icon">🏢</span>
          <div className="sp-stat-card__body">
            <span className="sp-stat-card__label">Hub XP This Week</span>
            <span className="sp-stat-card__value">{data.hubWeeklyXp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="sp-dashboard__grid">
        {/* My Badges */}
        <section className="sp-card sp-card--badge-panel">
          <div className="sp-card__header">
            <h2 className="sp-card__title">🏅 My Badges</h2>
            <Link to="/student/badges" className="sp-card__see-all">See all →</Link>
          </div>
          <div className="sp-main-badges-row">
            {data.badges.map((badge, i) => {
              const hasProgress = badge.xpEarned > 0;
              const levelColorSafe = getLevelColor(badge.levelName.toLowerCase(), badge.levelColor);
              return (
                <React.Fragment key={badge.id}>
                  <Link
                    to={`/student/badges?badge=${badge.id}`}
                    className={`sp-main-badge-hex${hasProgress ? " sp-main-badge-hex--active" : " sp-main-badge-hex--locked"}`}
                    style={{ "--badge-colour": levelColorSafe } as React.CSSProperties}
                    title={badge.name}
                  >
                    <div className="sp-main-badge-hex__ring">
                      <div className="sp-main-badge-hex__inner">
                        <span className="sp-main-badge-hex__icon">{hasProgress ? badge.icon : "🔒"}</span>
                      </div>
                    </div>
                    <span className="sp-main-badge-hex__name">{badge.name.split(" ")[0]}</span>
                    {hasProgress && (
                      <span
                        className="sp-main-badge-hex__level"
                        style={{ color: levelColorSafe }}
                      >
                        {badge.levelIcon} {badge.levelLabel}
                      </span>
                    )}
                    <span className="sp-main-badge-hex__progress">
                      {badge.subBadgesEarned}/{badge.subBadgesTotal}
                    </span>
                  </Link>
                  {i < data.badges.length - 1 && (
                    <div key={`quip-${i}`} className="sp-main-badge-hex sp-main-badge-hex--quip">
                      <span className="sp-main-badge-quip__icon">{BADGE_QUIPS[i % BADGE_QUIPS.length].icon}</span>
                      <span className="sp-main-badge-quip__text">{BADGE_QUIPS[i % BADGE_QUIPS.length].text}</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="sp-card">
          <div className="sp-card__header">
            <h2 className="sp-card__title">⚡ Recent Activity</h2>
            <Link to="/student/profile?tab=history" className="sp-card__see-all">See all →</Link>
          </div>
          <ul className="sp-activity-list">
            {data.recentActivity.map((a) => (
              <li key={a.id} className="sp-activity-item">
                <span className="sp-activity-item__icon">{a.icon}</span>
                <div className="sp-activity-item__info">
                  <span className="sp-activity-item__action">
                    <strong>{a.activity}</strong>
                  </span>
                  <span className="sp-activity-item__time">
                    {new Date(a.date).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
                <span className="sp-activity-item__xp">+{a.xp} XP</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Quick links */}
      <div className="sp-quicklinks">
        <Link to="/student/leaderboard" className="sp-quicklink-card">
          <span className="sp-quicklink-card__icon">🏆</span>
          <span className="sp-quicklink-card__label">Leaderboard</span>
          <span className="sp-quicklink-card__sub">
            {data.leaderboardRank != null ? `You're #${data.leaderboardRank} globally` : "View rankings"}
          </span>
        </Link>
        <Link to="/student/profile" className="sp-quicklink-card">
          <span className="sp-quicklink-card__icon">👤</span>
          <span className="sp-quicklink-card__label">My Profile</span>
          <span className="sp-quicklink-card__sub">View &amp; edit profile</span>
        </Link>
        <div className="sp-quicklink-card sp-quicklink-card--info">
          <span className="sp-quicklink-card__icon">📅</span>
          <span className="sp-quicklink-card__label">Next Session</span>
          <span className="sp-quicklink-card__sub">{formatNextSession(data.nextSessionAt)}</span>
        </div>
        <div className="sp-quicklink-card sp-quicklink-card--info">
          <span className="sp-quicklink-card__icon">🎯</span>
          <span className="sp-quicklink-card__label">XP to Next Level</span>
          <span className="sp-quicklink-card__sub">{xpToNext.toLocaleString()} XP remaining</span>
        </div>
      </div>
    </div>
  );
}
