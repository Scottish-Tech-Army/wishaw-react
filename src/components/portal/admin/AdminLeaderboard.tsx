import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../../portal.css";
import { useLeaderboard } from "../../../hooks/useLeaderboard";
import type { LeaderboardSortKey } from "../../../api/index";
import type {
  LeaderboardPeriod,
  LeaderboardPlayerDto,
  LeaderboardCentreDto,
} from "../../../api/types";

type LeaderboardTab = "players" | "centres";
type SortKey = "xp" | "level" | "completedModules" | "badgesCompleted";

const TIME_PERIODS: { label: string; value: LeaderboardPeriod }[] = [
  { label: "All Time",   value: "ALL_TIME"   },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "This Week",  value: "THIS_WEEK"  },
];

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/pixel-art/svg?seed=default";

export default function AdminLeaderboard() {
  const [tab, setTab] = useState<LeaderboardTab>("players");
  const [sortBy, setSortBy] = useState<SortKey>("xp");
  const [filterCentre, setFilterCentre] = useState("All Centres");
  const [period, setPeriod] = useState<LeaderboardPeriod>("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  // Reset to page 0 whenever period, sort or centre filter changes.
  const prevQueryRef = useRef({ period, sortBy, filterCentre });
  useEffect(() => {
    const prev = prevQueryRef.current;
    if (prev.period !== period || prev.sortBy !== sortBy || prev.filterCentre !== filterCentre) {
      setPage(0);
      prevQueryRef.current = { period, sortBy, filterCentre };
    }
  }, [period, sortBy, filterCentre]);

  // ── Backend data ────────────────────────────────────────────────────────
  const sortKeyMap: Record<SortKey, LeaderboardSortKey> = {
    xp:               "XP",
    level:            "LEVEL",
    completedModules: "MODULES",
    badgesCompleted:  "BADGES",
  };
  const { data, loading, error, refresh } = useLeaderboard(period, sortKeyMap[sortBy], page);

  // ── Players list ─────────────────────────────────────────────────────────
  const allPlayers: LeaderboardPlayerDto[] = data?.players ?? [];

  // Centre filter options derived from live data
  const centreOptions = useMemo(
    () => ["All Centres", ...Array.from(new Set(allPlayers.map((p) => p.centre)))],
    [allPlayers],
  );

  // Filter by centre (server-side sort is applied by the backend)
  const sorted = useMemo(
    () =>
      allPlayers.filter(
        (p) => filterCentre === "All Centres" || p.centre === filterCentre,
      ),
    [allPlayers, filterCentre],
  );

  const searchTerm = searchQuery.trim().toLowerCase();
  const displayed = searchTerm
    ? sorted.filter(
        (p) =>
          p.gamertag.toLowerCase().includes(searchTerm) ||
          p.username.toLowerCase().includes(searchTerm) ||
          p.name.toLowerCase().includes(searchTerm),
      )
    : sorted;

  // ── Centres list ──────────────────────────────────────────────────────────
  const centreRows: LeaderboardCentreDto[] = data?.centres ?? [];
  const topCentreXp = centreRows[0]?.periodXp || 1;

  return (
    <div className="sp-leaderboard">
      <div className="sp-page-header">
        <h1 className="sp-page-title">🏆 Leaderboard Overview</h1>
        <p className="sp-page-subtitle">Monitor student and centre progress across the platform</p>
      </div>

      {/* Tab switcher */}
      <div className="sp-lb-tabs">
        <button
          className={`sp-lb-tab${tab === "players" ? " sp-lb-tab--active" : ""}`}
          onClick={() => setTab("players")}
        >
          👤 Players
        </button>
        <button
          className={`sp-lb-tab${tab === "centres" ? " sp-lb-tab--active" : ""}`}
          onClick={() => setTab("centres")}
        >
          🏢 Centres
        </button>
      </div>

      {/* Period picker — shared between both tabs */}
      <div className="sp-lb-controls">
        <div className="sp-lb-controls__group">
          <label className="sp-lb-controls__label">Period:</label>
          <div className="sp-lb-period-group">
            {TIME_PERIODS.map((tp) => (
              <button
                key={tp.value}
                className={"sp-lb-period-btn" + (period === tp.value ? " sp-lb-period-btn--active" : "")}
                onClick={() => setPeriod(tp.value)}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "players" && (
          <>
            <div className="sp-lb-controls__group">
              <label className="sp-lb-controls__label">Sort by:</label>
              {(["xp", "level", "completedModules", "badgesCompleted"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  className={"sp-lb-filter-btn" + (sortBy === key ? " sp-lb-filter-btn--active" : "")}
                  onClick={() => setSortBy(key)}
                >
                  {key === "xp" ? "XP" : key === "level" ? "Level" : key === "completedModules" ? "Modules" : "Badges"}
                </button>
              ))}
            </div>
            <div className="sp-lb-controls__group">
              <label className="sp-lb-controls__label">Centre:</label>
              <select
                className="sp-lb-select"
                value={filterCentre}
                onChange={(e) => setFilterCentre(e.target.value)}
              >
                {centreOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ── LOADING STATE ───────────────────────────────────────────────── */}
      {loading && (
        <div className="sp-lb-loading">
          <div className="sp-lb-loading__spinner" aria-label="Loading leaderboard…" />
          <p className="sp-lb-loading__text">Loading leaderboard…</p>
        </div>
      )}

      {/* ── ERROR STATE ─────────────────────────────────────────────────── */}
      {!loading && error !== null && (
        <div className="sp-lb-error" role="alert">
          <span className="sp-lb-error__icon">⚠️</span>
          <p className="sp-lb-error__msg">{error}</p>
          <button className="sp-lb-error__retry" onClick={refresh}>Retry</button>
        </div>
      )}

      {/* ── PLAYERS TAB ─────────────────────────────────────────────────── */}
      {!loading && error === null && tab === "players" && (
        <>
          {/* Summary stats bar for admins */}
          {data !== null && allPlayers.length > 0 && (
            <div className="sp-lb-myrank">
              <div className="sp-lb-myrank__info" style={{ flex: 1 }}>
                <span className="sp-lb-myrank__name">📊 Leaderboard Summary</span>
                <span className="sp-lb-myrank__label">Overview of all student rankings</span>
              </div>
              <div className="sp-lb-myrank__stats">
                <div className="sp-lb-myrank__stat"><span>Total Players</span><strong>{data.totalCount ?? allPlayers.length}</strong></div>
                <div className="sp-lb-myrank__stat"><span>Centres</span><strong>{centreRows.length}</strong></div>
                <div className="sp-lb-myrank__stat"><span>Top XP</span><strong>{(allPlayers[0]?.periodXp ?? 0).toLocaleString()}</strong></div>
                <div className="sp-lb-myrank__stat"><span>Top Level</span><strong>Lv. {allPlayers[0]?.level ?? 0}</strong></div>
              </div>
            </div>
          )}

          {/* Empty state — backend returned no players for this period */}
          {data !== null && allPlayers.length === 0 && (
            <div className="sp-lb-empty">
              <span className="sp-lb-empty__icon">🏜️</span>
              <p className="sp-lb-empty__msg">No players on the leaderboard yet for this period.</p>
            </div>
          )}

          {/* Top 3 podium */}
          {allPlayers.length > 0 && displayed.length >= 1 && (
            <div className="sp-podium">
              {([displayed[1], displayed[0], displayed[2]] as typeof displayed).map((p) => {
                if (!p) return null;
                const rankPos = p.rank;
                const medalMap: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                const medal = medalMap[rankPos] ?? `#${rankPos}`;
                return (
                  <Link
                    key={p.username}
                    to={`/student/players/${p.username.replace(/^@/, "")}`}
                    className={`sp-podium__place sp-podium__place--${rankPos}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="sp-podium__medal">{medal}</div>
                    <img src={p.avatarUrl ?? FALLBACK_AVATAR} alt={p.gamertag} className="sp-podium__avatar" />
                    <div className="sp-podium__name">{p.gamertag}</div>
                    <div className="sp-podium__level">Lv. {p.level}</div>
                    <div className="sp-podium__xp">{p.periodXp.toLocaleString()} XP</div>
                    <div className={`sp-podium__block sp-podium__block--${rankPos}`}>
                      <span className="sp-podium__pos">#{rankPos}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {allPlayers.length > 0 && <>
          {/* Search */}
          <div className="sp-lb-search-wrapper">
            <span className="sp-lb-search-icon">🔍</span>
            <input
              type="text"
              className="sp-lb-search"
              placeholder="Search by name or username…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="sp-lb-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
            )}
          </div>

          {/* Full stats table */}
          <div className="sp-lb-table-wrapper">
            <table className="sp-lb-table">
              <thead>
                <tr>
                  <th className="sp-lb-th">Rank</th>
                  <th className="sp-lb-th">Player</th>
                  <th className="sp-lb-th">Centre</th>
                  <th
                    className={"sp-lb-th sp-lb-th--secondary sp-lb-th--sortable" + (sortBy === "level" ? " sp-lb-th--active" : "")}
                    onClick={() => setSortBy("level")}
                  >
                    Level {sortBy === "level" && <span className="sp-lb-th__arrow">↓</span>}
                  </th>
                  <th
                    className={"sp-lb-th sp-lb-th--sortable" + (sortBy === "xp" ? " sp-lb-th--active" : "")}
                    onClick={() => setSortBy("xp")}
                  >
                    XP {sortBy === "xp" && <span className="sp-lb-th__arrow">↓</span>}
                  </th>
                  <th
                    className={"sp-lb-th sp-lb-th--secondary sp-lb-th--sortable" + (sortBy === "completedModules" ? " sp-lb-th--active" : "")}
                    onClick={() => setSortBy("completedModules")}
                  >
                    Modules {sortBy === "completedModules" && <span className="sp-lb-th__arrow">↓</span>}
                  </th>
                  <th
                    className={"sp-lb-th sp-lb-th--secondary sp-lb-th--sortable" + (sortBy === "badgesCompleted" ? " sp-lb-th--active" : "")}
                    onClick={() => setSortBy("badgesCompleted")}
                  >
                    Badges {sortBy === "badgesCompleted" && <span className="sp-lb-th__arrow">↓</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((p) => (
                  <tr
                    key={p.rank}
                    className={
                      "sp-lb-row" +
                      (p.rank % 2 === 0 ? " sp-lb-row--alt" : "") +
                      (p.rank === 1 ? " sp-lb-row--gold" : "") +
                      (p.rank === 2 ? " sp-lb-row--silver" : "") +
                      (p.rank === 3 ? " sp-lb-row--bronze" : "")
                    }
                  >
                    <td className="sp-lb-rank">
                      <span className="sp-lb-rank__num">
                        {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}
                      </span>
                    </td>
                    <td>
                      <div className="sp-lb-player">
                        <img src={p.avatarUrl ?? FALLBACK_AVATAR} alt={p.gamertag} className="sp-lb-player__avatar" />
                        <div>
                          <div className="sp-lb-player__name">{p.gamertag}</div>
                          <div className="sp-lb-player__username">{p.username}</div>
                          {p.badgeIcons.length > 0 && (
                            <div className="sp-lb-player__badges">
                              {p.badgeIcons.map((icon, i) => (
                                <span key={i} className="sp-lb-player__badge-icon">{icon}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="sp-lb-td--secondary">{p.centre}</td>
                    <td className="sp-lb-td--secondary"><span className="sp-lb-level">Lv. {p.level}</span></td>
                    <td><span className="sp-lb-xp">{p.periodXp.toLocaleString()}</span></td>
                    <td className="sp-lb-num sp-lb-td--secondary">{p.completedModules}</td>
                    <td className="sp-lb-num sp-lb-td--secondary">{p.badgesCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayed.length === 0 && (
              <div className="sp-lb-empty">
                <span className="sp-lb-empty__icon">🔍</span>
                <p className="sp-lb-empty__msg">No players found for <strong>"{searchQuery}"</strong></p>
              </div>
            )}
          </div>

          {/* Load more */}
          {data !== null && allPlayers.length < (data.totalCount ?? 0) && (
            <div className="sp-lb-loadmore">
              <button
                className="sp-lb-loadmore__btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? "Loading…" : `Load more (${allPlayers.length} / ${data.totalCount})`}
              </button>
            </div>
          )}
          </>}
        </>
      )}

      {/* ── CENTRES TAB ─────────────────────────────────────────────────── */}
      {!loading && error === null && tab === "centres" && (
        <div className="sp-lb-centres">
          {centreRows.map((centre, idx) => {
            const xp = centre.periodXp;
            const pct = Math.round((xp / topCentreXp) * 100);
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={centre.name}
                className="sp-lb-centre-card"
              >
                <div className="sp-lb-centre-card__rank">
                  <span className="sp-lb-centre-card__medal">{medals[idx] ?? `#${idx + 1}`}</span>
                </div>
                <div className="sp-lb-centre-card__identity">
                  <span className="sp-lb-centre-card__icon">{centre.icon}</span>
                  <div>
                    <span className="sp-lb-centre-card__name">{centre.name}</span>
                    <span className="sp-lb-centre-card__members">{centre.memberCount} members</span>
                  </div>
                </div>
                <div className="sp-lb-centre-card__bar-col">
                  <div className="sp-lb-centre-card__bar-track">
                    <div
                      className="sp-lb-centre-card__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="sp-lb-centre-card__xp">{xp.toLocaleString()} XP</span>
                </div>
                <div className="sp-lb-centre-card__stats">
                  <div className="sp-lb-centre-card__stat">
                    <span>Badges</span>
                    <strong>{centre.totalBadges}</strong>
                  </div>
                  <div className="sp-lb-centre-card__stat">
                    <span>Modules</span>
                    <strong>{centre.totalModules}</strong>
                  </div>
                  <div className="sp-lb-centre-card__stat">
                    <span>Top Player</span>
                    <strong>{centre.topPlayerName}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
