import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../../portal.css";
import { useAuth } from "../../../context/AuthContext";
import { useBadgeCatalogue } from "../../../hooks/useBadgeCatalogue";
import { useBadgeCatalogueContext } from "../../../context/BadgeCatalogueContext";
import type { BadgeLevelDto, MainBadgeDetailDto, SubBadgeDetailDto } from "../../../api/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveBadgeLevel(xpEarned: number, badgeLevels: BadgeLevelDto[]): BadgeLevelDto {
  return (
    [...badgeLevels].reverse().find((l) => xpEarned >= l.minXP) ?? badgeLevels[0]
  );
}

function xpProgress(xpEarned: number, badgeLevels: BadgeLevelDto[]) {
  const currentLevel = resolveBadgeLevel(xpEarned, badgeLevels);
  const levelIndex = badgeLevels.findIndex((l) => l.name === currentLevel.name);
  const nextLevel = badgeLevels[levelIndex + 1] ?? null;

  const levelStart = currentLevel.minXP;
  const levelEnd = nextLevel ? nextLevel.minXP : currentLevel.minXP + 1; // cap at current max
  const inLevelXP = xpEarned - levelStart;
  const levelRange = levelEnd - levelStart;
  const pct = nextLevel ? Math.min(100, Math.round((inLevelXP / levelRange) * 100)) : 100;

  return { currentLevel, nextLevel, pct, levelIndex };
}

// ── Sub-badge card (expandable) ───────────────────────────────────────────────

function SubBadgeRow({ sub }: { sub: SubBadgeDetailDto }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sbb-sub-badge sbb-sub-badge--${sub.earned ? "earned" : "locked"}`}>
      {/* Always-visible header row */}
      <button className="sbb-sub-badge__header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="sbb-sub-badge__icon">{sub.earned ? sub.icon : "🔒"}</div>
        <div className="sbb-sub-badge__body">
          <span className="sbb-sub-badge__name">{sub.name}</span>
          <span className="sbb-sub-badge__shortdesc">{sub.shortDesc}</span>
        </div>
        <div className="sbb-sub-badge__right">
          <span className={`sbb-sub-badge__type sbb-sub-badge__type--${sub.type}`}>
            {sub.type === "activity" ? "⚡ Activity" : "📖 Lesson"}
          </span>
          <span className={`sbb-sub-badge__xp${sub.earned ? " sbb-sub-badge__xp--earned" : ""}`}>
            +{sub.xpReward} XP
          </span>
          <span className="sbb-sub-badge__chevron">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="sbb-sub-badge__detail">
          <p className="sbb-sub-badge__criteria">{sub.criteria}</p>
          <div className="sbb-sub-badge__meta-row">
            <span className={`sbb-sub-badge__type sbb-sub-badge__type--${sub.type}`}>
              {sub.type === "activity" ? "⚡ Activity" : "📖 Lesson"}
            </span>
            <div className="sbb-sub-badge__skills">
              {sub.skills.map((skill) => (
                <span key={skill} className="sbb-skill-chip">{skill}</span>
              ))}
            </div>
            <span className={`sbb-sub-badge__xp${sub.earned ? " sbb-sub-badge__xp--earned" : ""}`}>
              +{sub.xpReward} XP
            </span>
          </div>
          {sub.earned && sub.earnedDate && (
            <span className="sbb-sub-badge__date">✅ Earned {sub.earnedDate}</span>
          )}
          {!sub.earned && (
            <span className="sbb-sub-badge__locked-note">🔒 Not yet earned</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Badge card ────────────────────────────────────────────────────────────────

function BadgeCard({
  badge,
  badgeLevels,
  isHighlighted,
  cardRef,
}: {
  badge: MainBadgeDetailDto;
  badgeLevels: BadgeLevelDto[];
  isHighlighted: boolean;
  cardRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const [expanded, setExpanded] = useState(isHighlighted);
  const { currentLevel, nextLevel, pct } = xpProgress(badge.xpEarned, badgeLevels);

  const earnedCount = badge.subBadges.filter((s) => s.earned).length;
  const totalCount = badge.subBadges.length;

  return (
    <div
      ref={cardRef}
      className={`sbb-badge-card${isHighlighted ? " sbb-badge-card--highlighted" : ""}`}
      style={{ "--badge-level-color": currentLevel.color } as React.CSSProperties}
    >
      {/* Card header — always visible */}
      <button
        className="sbb-badge-card__header"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div className="sbb-badge-card__icon-wrap">
          <span className="sbb-badge-card__icon">{badge.icon}</span>
          <span
            className="sbb-badge-card__level-ring"
            style={{ borderColor: currentLevel.color }}
            title={`${currentLevel.label} level`}
          />
        </div>

        <div className="sbb-badge-card__info">
          <div className="sbb-badge-card__name-row">
            <span className="sbb-badge-card__name">{badge.name}</span>
            <span
              className="sbb-badge-card__level-chip"
              style={{ background: currentLevel.color + "33", color: currentLevel.color, borderColor: currentLevel.color }}
            >
              {currentLevel.icon} {currentLevel.label}
            </span>
          </div>
          <span className="sbb-badge-card__tagline">{badge.tagline}</span>

          {/* XP progress bar */}
          <div className="sbb-badge-card__xp-row">
            <span className="sbb-badge-card__xp-text">
              {badge.xpEarned} XP
              {nextLevel
                ? ` · ${nextLevel.minXP - badge.xpEarned} XP to ${nextLevel.label}`
                : " · Max level reached!"}
            </span>
            <span className="sbb-badge-card__sub-count">
              {earnedCount}/{totalCount} criteria
            </span>
          </div>
          <div className="sbb-badge-card__xp-track">
            <div
              className="sbb-badge-card__xp-fill"
              style={{ width: `${pct}%`, background: currentLevel.color }}
            />
          </div>
        </div>

        <span className="sbb-badge-card__chevron">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="sbb-badge-card__body">
          {/* Full description */}
          <p className="sbb-badge-card__desc">{badge.description}</p>

          {/* Level ladder */}
          <div className="sbb-badge-card__levels">
            <span className="sbb-badge-card__levels-label">Level ladder</span>
            <div className="sbb-badge-card__levels-list">
              {badgeLevels.map((lvl) => {
                const isCurrent = lvl.name === resolveBadgeLevel(badge.xpEarned, badgeLevels).name;
                return (
                  <div
                    key={lvl.name}
                    className={`sbb-level-step${isCurrent ? " sbb-level-step--current" : ""}`}
                    style={{ "--step-color": lvl.color } as React.CSSProperties}
                  >
                    <span className="sbb-level-step__icon">{lvl.icon}</span>
                    <span className="sbb-level-step__label">{lvl.label}</span>
                    <span className="sbb-level-step__range">
                      {lvl.maxXP ? `${lvl.minXP}–${lvl.maxXP} XP` : `${lvl.minXP}+ XP`}
                    </span>
                    {isCurrent && <span className="sbb-level-step__you">← You</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-badges — 9b: graceful empty state */}
          <div className="sbb-badge-card__subs">
            <span className="sbb-badge-card__subs-label">
              Criteria ({earnedCount}/{totalCount} earned)
            </span>
            {badge.subBadges.length === 0 ? (
              <p className="sbb-badge-card__subs-empty">No criteria defined yet.</p>
            ) : (
              badge.subBadges.map((sub) => (
                <SubBadgeRow key={sub.id} sub={sub} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentBadges() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useBadgeCatalogue(user?.studentId);
  const { registerBadgeRefresh } = useBadgeCatalogueContext();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("badge"); // e.g. "game-mastery"

  // Register refresh with the context so EvidenceSubmission can trigger it
  // after a successful submission. Clear on unmount.
  useEffect(() => {
    registerBadgeRefresh(refresh);
    return () => registerBadgeRefresh(null);
  }, [refresh, registerBadgeRefresh]);

  const badges = data?.badges ?? [];
  const badgeLevels = data?.badgeLevels ?? [];

  // One ref per badge card so we can scroll to the highlighted one.
  // Rebuilt whenever the badge list changes (i.e. after first load).
  const cardRefs = useRef<Record<string, React.MutableRefObject<HTMLDivElement | null>>>({});
  badges.forEach((b) => {
    if (!cardRefs.current[b.id]) {
      cardRefs.current[b.id] = { current: null };
    }
  });

  // Scroll to highlighted card only once data has loaded (4c)
  useEffect(() => {
    if (!loading && highlightId && cardRefs.current[highlightId]?.current) {
      setTimeout(() => {
        cardRefs.current[highlightId]?.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [loading, highlightId]);

  const totalXP = badges.reduce((sum, b) => sum + b.xpEarned, 0);
  const totalEarned = badges.flatMap((b) => b.subBadges).filter((s) => s.earned).length;
  const totalCriteria = badges.flatMap((b) => b.subBadges).length;

  // ── No studentId (not signed in / admin) — 9a ────────────────────────────
  // Check this first: useBadgeCatalogue skips the fetch when studentId is null,
  // so loading stays false and error stays null — we'd fall through to the
  // empty-badges render without this early return.
  if (!user?.studentId) {
    return (
      <div className="sbb-page">
        <div className="sbb-page__header">
          <div className="sbb-page__header-text">
            <h1 className="sbb-page__title">🏅 Badge Catalogue</h1>
          </div>
        </div>
        <p className="sbb-page__empty">Sign in as a student to view your badge progress.</p>
      </div>
    );
  }

  // ── Loading skeleton (4f) ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sbb-page">
        <div className="sbb-page__header">
          <div className="sbb-page__header-text">
            <h1 className="sbb-page__title">🏅 Badge Catalogue</h1>
          </div>
        </div>
        <div className="sbb-cards">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sbb-badge-card sbb-badge-card--skeleton" aria-hidden="true">
              <div className="sbb-badge-card__header sbb-skeleton-row" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state (4g) ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="sbb-page">
        <div className="sbb-page__header">
          <div className="sbb-page__header-text">
            <h1 className="sbb-page__title">🏅 Badge Catalogue</h1>
          </div>
        </div>
        <div className="sbb-error-banner" role="alert">
          <span className="sbb-error-banner__icon">⚠️</span>
          <span className="sbb-error-banner__message">{error}</span>
          <button className="sbb-error-banner__retry" onClick={refresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sbb-page">
      {/* Page header */}
      <div className="sbb-page__header">
        <div className="sbb-page__header-text">
          <h1 className="sbb-page__title">🏅 Badge Catalogue</h1>
          <p className="sbb-page__subtitle">
            The WYMCA Esports Academy uses 5 core badges to track your growth as a gamer,
            teammate, and digital citizen. Earn XP through module challenges to level each
            badge from Bronze all the way to the top.
          </p>
        </div>
        <div className="sbb-page__stats">
          <div className="sbb-page__stat">
            <span className="sbb-page__stat-value">{totalXP}</span>
            <span className="sbb-page__stat-label">Total Badge XP</span>
          </div>
          <div className="sbb-page__stat">
            <span className="sbb-page__stat-value">{totalEarned}/{totalCriteria}</span>
            <span className="sbb-page__stat-label">Criteria Met</span>
          </div>
          <div className="sbb-page__stat">
            <span className="sbb-page__stat-value">{badges.length}</span>
            <span className="sbb-page__stat-label">Core Badges</span>
          </div>
        </div>
      </div>

      {/* Level legend */}
      <div className="sbb-legend">
        <span className="sbb-legend__label">Level scale:</span>
        {badgeLevels.map((lvl) => (
          <span
            key={lvl.name}
            className="sbb-legend__chip"
            style={{ background: lvl.color + "22", color: lvl.color, borderColor: lvl.color }}
          >
            {lvl.icon} {lvl.label}&nbsp;
            <span className="sbb-legend__range">
              {lvl.maxXP ? `${lvl.minXP}–${lvl.maxXP} XP` : `${lvl.minXP}+ XP`}
            </span>
          </span>
        ))}
      </div>

      {/* Badge cards */}
      <div className="sbb-cards">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            badgeLevels={badgeLevels}
            isHighlighted={badge.id === highlightId}
            cardRef={cardRefs.current[badge.id]}
          />
        ))}
      </div>
    </div>
  );
}
