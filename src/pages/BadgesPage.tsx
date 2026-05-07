import { useState } from "react";
import "../styles/player.css";
import "../styles/badges.css";
import {
  BADGE_TIERS,
  getTier,
  getTierProgress,
  getNextTier,
  pointsToNextTier,
  MOCK_PLAYER_POINTS,
  getChallengesForSubBadge,
  getChallengeProgress,
  isSubBadgeComplete,
} from "../lib/badge-tiers";
import type { Challenge } from "../lib/badge-tiers";

// ─── Types ───────────────────────────────────────────────────
type SubBadgeStatus = "not-started" | "submitted" | "approved" | "locked";

interface SubBadge {
  title: string;
  info: string;
  description: string;
  category: string;
  badge: string;
  xp: number;
  url: string;
  image: string | null;
}

interface BadgeCategory {
  title: string;
  description: string;
  image: string;
  subBadges: SubBadge[];
}

// ─── Data ─────────────────────────────────────────────────────
// Imported from /data/mock-data (static copy for typing)
import badgesData from "../../data/badges-data.json";

const BADGES: BadgeCategory[] = badgesData as BadgeCategory[];

/** Tier-specific badge images from /public/downloaded-images/badges/ */
const BADGE_TIER_IMAGES: Record<string, Record<string, string>> = {
  'Game Mastery': {
    bronze: '/downloaded-images/badges/game-mastry-bronze-.png',
    silver: '/downloaded-images/badges/game-mastry-silver.png',
    gold:   '/downloaded-images/badges/game-mastry-gold.png',
  },
  'Team Work': {
    bronze: '/downloaded-images/badges/team-work-bronze.png',
    silver: '/downloaded-images/badges/team-work-silver.png',
    gold:   '/downloaded-images/badges/team-work-gold.png',
  },
  'Esports Citizen': {
    bronze: '/downloaded-images/badges/esports-citizen-bronze.png',
    silver: '/downloaded-images/badges/esports-citizen-silver.png',
    gold:   '/downloaded-images/badges/esports-citizen-gold.png',
  },
  'Personal Development': {
    bronze: '/downloaded-images/badges/personal-development-bronze.png',
    silver: '/downloaded-images/badges/personal-development-silver.png',
    gold:   '/downloaded-images/badges/personal-development-gold.png',
  },
  'Digital Skills': {
    bronze: '/downloaded-images/badges/digitatl-skills-bronze.png',
    silver: '/downloaded-images/badges/digitatl-skills-silver.png',
    gold:   '/downloaded-images/badges/digitatl-skills-gold.png',
  },
};

// ─── Mock player progress ──────────────────────────────────────
// key: sub-badge URL, value: status
const MOCK_PROGRESS: Record<string, SubBadgeStatus> = {
  "https://wymcaesports.co.uk/sub-badge/advanced-mechanics/": "approved",
  "https://wymcaesports.co.uk/sub-badge/analyst/": "submitted",
  "https://wymcaesports.co.uk/sub-badge/average-scorer/": "not-started",
  "https://wymcaesports.co.uk/sub-badge/ggwp/": "approved",
  "https://wymcaesports.co.uk/sub-badge/good-sport/": "not-started",
  "https://wymcaesports.co.uk/sub-badge/catch-that-moment/": "approved",
  "https://wymcaesports.co.uk/sub-badge/activity-planner/": "not-started",
  "https://wymcaesports.co.uk/sub-badge/cheerleader/": "not-started",
};

function getStatus(
  url: string,
  index: number,
  allSubs: SubBadge[]
): SubBadgeStatus {
  if (MOCK_PROGRESS[url]) return MOCK_PROGRESS[url];
  // Lock if previous sub-badge in this category is not yet approved
  if (index > 0) {
    const prevStatus = getStatus(allSubs[index - 1].url, index - 1, allSubs);
    if (prevStatus !== "approved") return "locked";
  }
  return "not-started";
}

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_LABELS: Record<SubBadgeStatus, string> = {
  "not-started": "Not Started",
  submitted: "Submitted",
  approved: "Approved",
  locked: "Locked",
};

const STATUS_ICONS: Record<SubBadgeStatus, string> = {
  "not-started": "radio_button_unchecked",
  submitted: "pending",
  approved: "verified",
  locked: "lock",
};

const CHALLENGE_STATUS_ICONS: Record<string, string> = {
  "not-started": "radio_button_unchecked",
  submitted: "pending",
  approved: "check_circle",
  rejected: "cancel",
};

const CHALLENGE_STATUS_COLORS: Record<string, string> = {
  "not-started": "var(--on-surface-variant)",
  submitted: "#f5c518",
  approved: "#48c78e",
  rejected: "#ff5252",
};

function xpLabel(xp: number) {
  return xp > 0 ? `${xp} pts` : null;
}

function isValidSub(sub: SubBadge) {
  return sub.title.trim() !== "" && sub.title !== "Wishaw YMCA Esports Academy";
}

// ─── Sub-badge card ────────────────────────────────────────────
interface SubBadgeCardProps {
  readonly sub: SubBadge;
  readonly status: SubBadgeStatus;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
}

function SubBadgeCard({
  sub,
  status,
  isExpanded,
  onToggle,
}: SubBadgeCardProps) {
  const locked = status === "locked";
  const challenges = getChallengesForSubBadge(sub.url);
  const challengeProgress = getChallengeProgress(sub.url);

  return (
    <button
      type="button"
      className={`sub-badge-card${locked ? " is-locked" : ""}${
        status === "approved" ? " is-completed" : ""
      }`}
      onClick={locked ? undefined : onToggle}
      disabled={locked}
      aria-expanded={isExpanded}
      style={{ textAlign: "left", width: "100%" }}
    >
      {locked && (
        <span
          className="material-symbol sub-badge-lock-overlay"
          aria-label="Locked"
        >
          lock
        </span>
      )}

      <div className="sub-badge-card-top">
        {sub.image ? (
          <img className="sub-badge-img" src={sub.image} alt={sub.title} />
        ) : (
          <div className="sub-badge-img-placeholder">
            <span className="material-symbol">military_tech</span>
          </div>
        )}

        <div className="sub-badge-meta">
          <h4>{sub.title}</h4>
          <p className="sub-badge-info">{sub.info}</p>
        </div>

        <span className={`sub-badge-status-pill status-${status}`}>
          <span className="material-symbol" style={{ fontSize: "0.75rem" }}>
            {STATUS_ICONS[status]}
          </span>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="sub-badge-footer">
        {xpLabel(sub.xp) && (
          <span className="sub-badge-xp">
            <span className="material-symbol" style={{ fontSize: "0.75rem" }}>
              bolt
            </span>
            {xpLabel(sub.xp)}
          </span>
        )}
        {challenges.length > 0 && (
          <span className="sub-badge-challenge-count">
            <span className="material-symbol" style={{ fontSize: '0.75rem' }}>assignment</span>
            {challengeProgress.approved}/{challengeProgress.total}
          </span>
        )}
        {sub.category && (
          <span className="sub-badge-category-tag">{sub.category}</span>
        )}
      </div>

      {isExpanded && !locked && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <section
          className="sub-badge-detail"
          aria-label={`Details for ${sub.title}`}
        >
          <div className="sub-badge-detail-header">
            {sub.image ? (
              <img className="sub-badge-img" src={sub.image} alt={sub.title} />
            ) : (
              <div className="sub-badge-img-placeholder">
                <span className="material-symbol">military_tech</span>
              </div>
            )}
            <div>
              <h5>{sub.title}</h5>
              {challenges.length > 0 && (
                <small
                  style={{
                    color: "var(--on-surface-variant)",
                    fontSize: "0.7rem",
                  }}
                >
                  {challengeProgress.approved}/{challengeProgress.total}{" "}
                  challenges completed
                </small>
              )}
            </div>
          </div>
          {sub.description && <p>{sub.description}</p>}

          {/* Challenge list */}
          {challenges.length > 0 && (
            <div className="challenge-list">
              <h6 className="challenge-list-title">CHALLENGES</h6>
              {challenges.map((ch: Challenge) => (
                <div key={ch.id} className="challenge-row">
                  <div className="challenge-row-left">
                    <span
                      className="material-symbol"
                      style={{
                        fontSize: "1rem",
                        color: CHALLENGE_STATUS_COLORS[ch.status],
                      }}
                    >
                      {CHALLENGE_STATUS_ICONS[ch.status]}
                    </span>
                    <div>
                      <p className="challenge-row-title">{ch.title}</p>
                      <small className="challenge-row-desc">
                        {ch.description}
                      </small>
                    </div>
                  </div>
                  <div className="challenge-row-right">
                    <span className="challenge-pts">{ch.pts} PTS</span>
                    {ch.awardType === "team" && (
                      <span className="challenge-award-tag">TEAM</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {status !== "approved" &&
            challenges.some(
              (c: Challenge) =>
                c.status === "not-started" || c.status === "rejected"
            ) && (
              <a
                href="/submit"
                className="sub-badge-detail-cta"
                aria-label={`Submit challenge for ${sub.title}`}
              >
                <span
                  className="material-symbol"
                  style={{ fontSize: "0.9rem" }}
                >
                  send
                </span>
                Submit Challenge
              </a>
            )}
          {isSubBadgeComplete(sub.url) && (
            <span className="sub-badge-detail-cta sub-badge-complete-tag">
              <span className="material-symbol" style={{ fontSize: "0.9rem" }}>
                verified
              </span>{" "}
              Sub-Badge Awarded
            </span>
          )}
        </section>
      )}
    </button>
  );
}

// ─── Category section ──────────────────────────────────────────
function BadgeCategorySection({
  category,
}: {
  readonly category: BadgeCategory;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const validSubs = category.subBadges.filter(isValidSub);
  const pts = MOCK_PLAYER_POINTS[category.title] ?? 0;
  const tier = getTier(pts);
  const progress = getTierProgress(pts);
  const next = getNextTier(pts);

  // Determine which sub-badges to show by default:
  // approved, submitted, and the first not-started ("next up")
  let firstNotStartedFound = false;
  const defaultVisibleUrls = new Set<string>();
  for (const [idx, sub] of validSubs.entries()) {
    const status = getStatus(sub.url, idx, validSubs);
    if (status === "approved" || status === "submitted") {
      defaultVisibleUrls.add(sub.url);
    } else if (status === "not-started" && !firstNotStartedFound) {
      defaultVisibleUrls.add(sub.url);
      firstNotStartedFound = true;
    }
  }

  const hiddenCount = validSubs.length - defaultVisibleUrls.size;
  const displayedSubs = showAll
    ? validSubs
    : validSubs.filter((sub) => defaultVisibleUrls.has(sub.url));
  const hiddenLabel = hiddenCount > 1
    ? `Show ${hiddenCount} More Sub-Badges`
    : `Show ${hiddenCount} More Sub-Badge`;

  return (
    <section className="badge-category">
      <div className="badge-category-header">
        <img
          className="badge-category-img"
          src={BADGE_TIER_IMAGES[category.title]?.[tier.name.toLowerCase()] ?? category.image}
          alt={`${category.title} – ${tier.name}`}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <h3 className="badge-category-title">{category.title}</h3>
            <span className="tier-pip" style={{ background: tier.color }}>
              {tier.name.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: tier.color,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {pts} pts
            </span>
            {next && (
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "var(--on-surface-variant)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {pointsToNextTier(pts)} to {next.name}
              </span>
            )}
          </div>
          <p className="badge-category-desc">{category.description}</p>
          <div className="badge-category-tier-bar">
            <div style={{ width: `${progress}%`, background: tier.color }} />
          </div>
        </div>
      </div>

      <div className="sub-badges-grid">
        {displayedSubs.map((sub) => {
          // Use original index for status calculation
          const originalIdx = validSubs.indexOf(sub);
          const status = getStatus(sub.url, originalIdx, validSubs);
          return (
            <SubBadgeCard
              key={sub.url}
              sub={sub}
              status={status}
              isExpanded={expanded === sub.url}
              onToggle={() =>
                setExpanded(expanded === sub.url ? null : sub.url)
              }
            />
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          className="sub-badges-toggle-btn"
          onClick={() => setShowAll((prev) => !prev)}
          aria-expanded={showAll}
        >
          <span className="material-symbol" style={{ fontSize: '1rem' }}>
            {showAll ? 'expand_less' : 'expand_more'}
          </span>
          {showAll ? 'Show Less' : hiddenLabel}
        </button>
      )}
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────
function BadgesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visible = activeCategory
    ? BADGES.filter((b) => b.title === activeCategory)
    : BADGES;

  return (
    <div className="badges-page">
      {/* ── Topbar (reuses player styles) */}
      <header className="player-topbar">
        <div className="player-topbar-left">
          <button
            className="player-icon-btn"
            aria-label="Go back"
            onClick={() => history.back()}
          >
            <span className="material-symbol">arrow_back</span>
          </button>
          <h1>WISHAW YMCA</h1>
        </div>

        <div className="player-topbar-right">
          <nav className="player-nav-desktop" aria-label="Player sections">
            <a href="/dashboard">Dashboard</a>
            <a href="/badges" className="is-active">
              Badges
            </a>
            <a href="/submit">Challenges</a>
          </nav>
          <div className="player-avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiP5F2jjPimpAZIOlY9HTk8eQjJZ8GwiI1ygM28aKVNrdn6IbQRxz69q3KomkMH9UKlapNudeA5RoGhLKulsHbmRy5f6HviHLIkkgFxjEvYkB_QMejUyA-S1RFdUh4cLDMKLYSbMMm4mxL-iUNaOX29MdZ1qdIvg2PTPq4mnOvB58hqFBdLegaqEjEtHmMoiTGYwf-KeDdSHRuGs46l1TaXEbc1XrI4kVw2DZ0YYJt6xMtCytVyuGLOplPsyRBjW1GATfwLEEp0x0"
              alt="Player avatar"
            />
          </div>
        </div>
      </header>

      {/* ── Hero */}
      <div className="badges-hero">
        <div className="badges-hero-glow" />
        <span className="badges-kicker">Player Progress</span>
        <h2>YOUR BADGES</h2>
        <p className="badges-subtitle">
          Earn points by completing challenges and learning activities. Each
          sub-badge awards points towards one of 5 main badges, levelling it up
          through Bronze, Silver, Gold and Platinum.
        </p>
        <div className="tier-legend" style={{ marginTop: "0.75rem" }}>
          {BADGE_TIERS.map((t) => (
            <div key={t.name} className="tier-legend-item">
              <span
                className="tier-legend-dot"
                style={{ background: t.color }}
              />
              <div className="tier-legend-text">
                <strong style={{ color: t.color }}>{t.name}</strong>
                <small>
                  {t.min}–{t.max ?? "∞"} pts
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category filter chips */}
      <div
        className="badges-summary-strip"
        role="tablist"
        aria-label="Badge categories"
      >
        <button
          className={`badges-summary-chip${
            activeCategory === null ? " is-active" : ""
          }`}
          onClick={() => setActiveCategory(null)}
          role="tab"
          aria-selected={activeCategory === null}
        >
          <span
            className="material-symbol"
            style={{ fontSize: "1rem", color: "var(--primary)" }}
          >
            workspace_premium
          </span>
          <span className="badge-chip-label">All</span>
          <span className="badge-chip-count">{BADGES.length}</span>
        </button>

        {BADGES.map((b) => {
          const pts = MOCK_PLAYER_POINTS[b.title] ?? 0;
          const tier = getTier(pts);

          return (
            <button
              key={b.title}
              className={`badges-summary-chip${
                activeCategory === b.title ? " is-active" : ""
              }`}
              onClick={() =>
                setActiveCategory(b.title === activeCategory ? null : b.title)
              }
              role="tab"
              aria-selected={activeCategory === b.title}
            >
              <img
                className="badge-chip-img"
                src={BADGE_TIER_IMAGES[b.title]?.[tier.name.toLowerCase()] ?? b.image}
                alt={`${b.title} – ${tier.name}`}
              />
              <span className="badge-chip-label">{b.title}</span>
              <span
                className="badge-chip-count"
                style={{ background: `${tier.color}22`, color: tier.color }}
              >
                {tier.name} · {pts} pts
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Badge categories */}
      <main className="badges-main">
        {visible.map((category) => (
          <BadgeCategorySection key={category.title} category={category} />
        ))}
      </main>

      {/* ── Bottom nav (reuses player styles) */}
      <nav className="player-bottom-nav" aria-label="Bottom navigation">
        <a href="/dashboard">
          <span className="material-symbol">dashboard</span>
          <small>Dashboard</small>
        </a>
        <a href="/badges" className="is-active">
          <span
            className="material-symbol"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
          <small>Badges</small>
        </a>
        <a href="/submit">
          <span className="material-symbol">send</span>
          <small>Submit</small>
        </a>
        <a href="/leaderboard">
          <span className="material-symbol">leaderboard</span>
          <small>Leaderboard</small>
        </a>
      </nav>
    </div>
  );
}

export default BadgesPage;
