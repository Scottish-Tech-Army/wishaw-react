import { useEffect, useState } from "react";
import { getAdminBadgeCatalogue, updateBadgeLevels } from "../../../api/index";
import type { AdminBadgeCatalogueDto, BadgeLevelDto } from "../../../api/types";
import { resolveBadgeLevel } from "../../../utils/badgeUtils";
import "../../../portal.css";

export default function AdminBadges() {
  const [data, setData] = useState<AdminBadgeCatalogueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable copy of badge levels — initialised from fetched data
  const [editLevels, setEditLevels] = useState<BadgeLevelDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminBadgeCatalogue()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setEditLevels(res.badgeLevels.map((lv) => ({ ...lv })));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load badges");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const SUGGESTED_NAMES = ["Emerald", "Diamond", "Master", "Pro"];

  /** Add a new blank level row with a suggested name */
  function addLevel() {
    const usedNames = new Set(editLevels.map((lv) => lv.label));
    const suggestion = SUGGESTED_NAMES.find((n) => !usedNames.has(n)) ?? "New Level";
    const lastMax = editLevels.length > 0
      ? (editLevels[editLevels.length - 1].maxXP ?? editLevels[editLevels.length - 1].minXP)
      : 0;
    // Shift the previous top level to have a maxXP if it was open-ended
    setEditLevels((prev) => {
      const next = prev.map((lv) => ({ ...lv }));
      if (next.length > 0 && next[next.length - 1].maxXP === null) {
        next[next.length - 1].maxXP = lastMax > 0 ? lastMax + 50 : 200;
      }
      const newMin = next.length > 0 ? (next[next.length - 1].maxXP ?? 0) + 1 : 0;
      next.push({
        name: suggestion.toLowerCase().replace(/\s+/g, "-"),
        label: suggestion,
        minXP: newMin,
        maxXP: null,
        color: "#6366f1",
        icon: "✨",
      });
      return next;
    });
    setSaveMsg(null);
  }

  /** Remove a level row by index */
  function removeLevel(index: number) {
    setEditLevels((prev) => prev.filter((_, i) => i !== index));
    setSaveMsg(null);
  }

  /** Update a single field on a level row */
  function updateLevel(index: number, field: keyof BadgeLevelDto, value: string) {
    setEditLevels((prev) => {
      const next = prev.map((lv) => ({ ...lv }));
      const row = next[index];
      if (field === "minXP") {
        row.minXP = value === "" ? 0 : Number(value);
      } else if (field === "maxXP") {
        row.maxXP = value === "" || value === "∞" ? null : Number(value);
      } else if (field === "label") {
        row.label = value;
        row.name = value.toLowerCase().replace(/\s+/g, "-");
      } else if (field === "icon") {
        row.icon = value;
      } else if (field === "color") {
        row.color = value;
      }
      return next;
    });
    setSaveMsg(null);
  }

  /** Persist edited levels to mock API */
  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const saved = await updateBadgeLevels(editLevels);
      setEditLevels(saved.map((lv) => ({ ...lv })));
      if (data) {
        setData({ ...data, badgeLevels: saved });
      }
      setSaveMsg("✅ Thresholds saved successfully.");
    } catch {
      setSaveMsg("⚠️ Failed to save thresholds.");
    } finally {
      setSaving(false);
    }
  }

  /** True when editLevels differs from last-saved data */
  const hasChanges =
    data != null &&
    JSON.stringify(editLevels) !== JSON.stringify(data.badgeLevels);

  if (loading) {
    return (
      <div className="ap-page">
        <h1 className="ap-page__title">🏅 Badge &amp; Level Management</h1>
        <p className="ap-page__loading">Loading badges…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ap-page">
        <h1 className="ap-page__title">🏅 Badge &amp; Level Management</h1>
        <p className="ap-page__error">⚠️ {error ?? "Unknown error"}</p>
      </div>
    );
  }

  const BADGE_ACCENT: Record<string, string> = {
    "game-mastery":        "#8b5cf6",
    "teamwork":            "#3b82f6",
    "esports-citizen":     "#10b981",
    "personal-development":"#f59e0b",
    "digital-skills":      "#ef4444",
  };

  return (
    <div className="ap-page">
      <h1 className="ap-page__title">🏅 Badge &amp; Level Management</h1>
      <p className="ap-page__subtitle">
        Manage the 5 core badges, configure level thresholds, and view top earners.
      </p>

      {/* Badge cards grid */}
      <div className="ab-cards-grid">
        {data.badges.map((badge) => {
          const level = resolveBadgeLevel(badge.xpEarned, data.badgeLevels);
          const earnedCount = badge.subBadges.filter((sb) => sb.earned).length;

          return (
            <div
              key={badge.id}
              className="ab-card sp-card"
              style={{ "--badge-accent": BADGE_ACCENT[badge.id] ?? "#6366f1" } as React.CSSProperties}
            >
              {/* Card header */}
              <div className="ab-card__header">
                <span className="ab-card__icon">{badge.icon}</span>
                <div className="ab-card__header-text">
                  <h2 className="ab-card__name">{badge.name}</h2>
                  <span className="ab-card__tagline">{badge.tagline}</span>
                </div>
              </div>

              {/* Description */}
              <p className="ab-card__desc">{badge.description}</p>

              {/* Stats row */}
              <div className="ab-card__stats">
                <div className="ab-card__stat">
                  <span className="ab-card__stat-value">{badge.subBadges.length}</span>
                  <span className="ab-card__stat-label">Sub-badges</span>
                </div>
                <div className="ab-card__stat">
                  <span className="ab-card__stat-value">{earnedCount}</span>
                  <span className="ab-card__stat-label">Earned</span>
                </div>
                <div className="ab-card__stat">
                  <span className="ab-card__stat-value">{badge.xpEarned}</span>
                  <span className="ab-card__stat-label">Total XP</span>
                </div>
              </div>

              {/* Level thresholds preview */}
              <div className="ab-card__levels">
                <span className="ab-card__levels-label">Thresholds:</span>
                <div className="ab-card__level-chips">
                  {editLevels.map((lv) => (
                    <span
                      key={lv.name}
                      className={`ab-level-chip${level?.name === lv.name ? " ab-level-chip--active" : ""}`}
                      style={{ "--level-color": lv.color } as React.CSSProperties}
                    >
                      {lv.icon} {lv.label} {lv.minXP}–{lv.maxXP ?? "∞"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Per-badge XP leaderboard strip */}
              {(data.badgeLeaderboards[badge.id] ?? []).length > 0 && (
                <div className="ab-card__leaderboard">
                  <span className="ab-card__leaderboard-label">🏆 Top Earners</span>
                  <div className="ab-card__leaderboard-list">
                    {(data.badgeLeaderboards[badge.id] ?? []).map((entry) => (
                      <div key={entry.username} className="ab-lb-entry">
                        <span className="ab-lb-entry__rank">#{entry.rank}</span>
                        <span className="ab-lb-entry__name">{entry.name}</span>
                        <span className="ab-lb-entry__xp">{entry.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level Thresholds Table */}
      <section className="sp-card ab-thresholds-section">
        <div className="sp-card__header">
          <h2 className="sp-card__title">📊 Level Thresholds</h2>
          <div className="ab-thresholds-actions">
            {saveMsg && <span className="ab-save-msg">{saveMsg}</span>}
            <button
              className="ab-save-btn"
              disabled={!hasChanges || saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
        <div className="ab-thresholds-wrapper">
          <table className="ab-thresholds-table">
            <thead>
              <tr>
                <th className="ab-th">Icon</th>
                <th className="ab-th">Level Name</th>
                <th className="ab-th">Colour</th>
                <th className="ab-th ab-th--right">Min XP</th>
                <th className="ab-th ab-th--right">Max XP</th>
                <th className="ab-th ab-th--center"></th>
              </tr>
            </thead>
            <tbody>
              {editLevels.map((lv, i) => (
                <tr key={lv.name + i} className="ab-tr">
                  <td className="ab-td">
                    <input
                      className="ab-input ab-input--icon"
                      value={lv.icon}
                      onChange={(e) => updateLevel(i, "icon", e.target.value)}
                      aria-label={`Icon for ${lv.label}`}
                    />
                  </td>
                  <td className="ab-td">
                    <input
                      className="ab-input ab-input--label"
                      value={lv.label}
                      onChange={(e) => updateLevel(i, "label", e.target.value)}
                      aria-label={`Name for level ${i + 1}`}
                    />
                  </td>
                  <td className="ab-td ab-td--color">
                    <input
                      type="color"
                      className="ab-input--color-picker"
                      value={lv.color}
                      onChange={(e) => updateLevel(i, "color", e.target.value)}
                      aria-label={`Colour for ${lv.label}`}
                    />
                    <input
                      className="ab-input ab-input--color-hex"
                      value={lv.color}
                      onChange={(e) => updateLevel(i, "color", e.target.value)}
                      aria-label={`Colour hex for ${lv.label}`}
                    />
                  </td>
                  <td className="ab-td ab-td--right">
                    <input
                      type="number"
                      className="ab-input ab-input--number"
                      value={lv.minXP}
                      min={0}
                      onChange={(e) => updateLevel(i, "minXP", e.target.value)}
                      aria-label={`Min XP for ${lv.label}`}
                    />
                  </td>
                  <td className="ab-td ab-td--right">
                    <input
                      type="number"
                      className="ab-input ab-input--number"
                      value={lv.maxXP ?? ""}
                      placeholder="∞"
                      min={0}
                      onChange={(e) => updateLevel(i, "maxXP", e.target.value)}
                      aria-label={`Max XP for ${lv.label}`}
                    />
                  </td>
                  <td className="ab-td ab-td--center">
                    <button
                      className="ab-remove-btn"
                      onClick={() => removeLevel(i)}
                      aria-label={`Remove ${lv.label}`}
                      title={`Remove ${lv.label}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="ab-add-btn" onClick={addLevel}>
          + Add Level
        </button>
      </section>
    </div>
  );
}
