import { useState, useEffect } from "react";
import type { AdminGroupDto, AdminGroupGame, AdminGroupType, AdminModuleDto } from "../../../api/types";
import { getAdminGroups, getAdminModules, createAdminGroup, updateAdminGroup, deleteAdminGroup, assignModuleToGroup, unassignModuleFromGroup } from "../../../api/index";
import "../../../portal.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const HUB_ICONS: Record<string, string> = {
  "Hub Glasgow":    "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Hub Edinburgh":  "🏰",
  "Hub Manchester": "🐝",
  "Hub Birmingham": "⚙️",
  "Hub Liverpool":  "🎸",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface CentreSummary {
  name: string;
  icon: string;
  groupCount: number;
  memberCount: number;
  activeModuleCount: number;
}

function deriveCentres(
  groups: AdminGroupDto[],
  activeModuleIds: Set<number>,
): CentreSummary[] {
  const map = new Map<
    string,
    { groupCount: number; memberCount: number; moduleIds: Set<number> }
  >();

  for (const g of groups) {
    if (!map.has(g.hub)) {
      map.set(g.hub, { groupCount: 0, memberCount: 0, moduleIds: new Set() });
    }
    const entry = map.get(g.hub)!;
    entry.groupCount += 1;
    entry.memberCount += g.memberCount;
    for (const mid of g.moduleIds) {
      if (activeModuleIds.has(mid)) entry.moduleIds.add(mid);
    }
  }

  return Array.from(map.entries()).map(([name, stats]) => ({
    name,
    icon: HUB_ICONS[name] ?? "🏢",
    groupCount: stats.groupCount,
    memberCount: stats.memberCount,
    activeModuleCount: stats.moduleIds.size,
  }));
}

// ─── Sort helpers ───────────────────────────────────────────────────────────────

type SortKey = "name" | "hub" | "game" | "groupType" | "memberCount" | "moduleCount";
type SortDir = "asc" | "desc";

function sortGroups(groups: AdminGroupDto[], key: SortKey, dir: SortDir): AdminGroupDto[] {
  return [...groups].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":        cmp = a.name.localeCompare(b.name); break;
      case "hub":         cmp = a.hub.localeCompare(b.hub); break;
      case "game":        cmp = a.game.localeCompare(b.game); break;
      case "groupType":   cmp = a.groupType.localeCompare(b.groupType); break;
      case "memberCount": cmp = a.memberCount - b.memberCount; break;
      case "moduleCount": cmp = a.moduleIds.length - b.moduleIds.length; break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

const GAME_OPTIONS: AdminGroupGame[] = [
  "Minecraft", "Rocket League", "Fortnite", "Competitive", "Media", "Casual",
];

const TYPE_OPTIONS: AdminGroupType[] = [
  "Juniors", "Competitive", "Media", "Casual",
];

const KNOWN_HUBS = [
  "Hub Glasgow", "Hub Edinburgh", "Hub Manchester", "Hub Birmingham", "Hub Liverpool",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminGroups() {
  const [groups, setGroups] = useState<AdminGroupDto[]>([]);
  const [activeModuleIds, setActiveModuleIds] = useState<Set<number>>(new Set());
  const [allModules, setAllModules] = useState<AdminModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Table state ─────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [filterHub, setFilterHub] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [filterType, setFilterType] = useState("");

  // ── Add Group modal state ───────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAddGroup(data: { name: string; hub: string; game: AdminGroupGame; groupType: AdminGroupType }) {
    setAddError(null);
    try {
      const newGroup = await createAdminGroup(data);
      setGroups((prev) => [...prev, newGroup]);
      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create group");
    }
  }

  // ── Edit Group modal state ──────────────────────────────────────────
  const [editingGroup, setEditingGroup] = useState<AdminGroupDto | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleEditGroup(data: { name: string; hub: string; game: AdminGroupGame; groupType: AdminGroupType }) {
    if (!editingGroup) return;
    setEditError(null);
    try {
      const updated = await updateAdminGroup(editingGroup.id, data);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setEditingGroup(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update group");
    }
  }

  // ── Delete Group modal state ─────────────────────────────────────────
  const [deletingGroup, setDeletingGroup] = useState<AdminGroupDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteGroup(groupId: string, reassignToId: string | null) {
    setDeleteError(null);
    try {
      await deleteAdminGroup(groupId);
      setGroups((prev) => {
        const remaining = prev.filter((g) => g.id !== groupId);
        // If reassignment chosen, bump memberCount on target group
        if (reassignToId) {
          const deleted = prev.find((g) => g.id === groupId);
          return remaining.map((g) =>
            g.id === reassignToId && deleted
              ? { ...g, memberCount: g.memberCount + deleted.memberCount }
              : g,
          );
        }
        return remaining;
      });
      setDeletingGroup(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete group");
    }
  }

  // ── Module assign / unassign ──────────────────────────────────────────
  async function handleAssignModule(groupId: string, moduleId: number) {
    try {
      const updated = await assignModuleToGroup(groupId, moduleId);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    } catch { /* silently ignore — UI stays unchanged */ }
  }

  async function handleUnassignModule(groupId: string, moduleId: number) {
    try {
      const updated = await unassignModuleFromGroup(groupId, moduleId);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    } catch { /* silently ignore */ }
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminGroups(), getAdminModules()])
      .then(([groupData, moduleData]) => {
        if (!cancelled) {
          setGroups(groupData);
          setAllModules(moduleData);
          setActiveModuleIds(
            new Set(moduleData.filter((m) => m.status === "Active").map((m) => m.id)),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header au-page-header">
          <h1 className="sp-page-title">🎯 Group & Centre Management</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header au-page-header">
          <h1 className="sp-page-title">🎯 Group & Centre Management</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  const centres = deriveCentres(groups, activeModuleIds);

  // ── Filtering & sorting ────────────────────────────────────────────────
  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    const matchSearch = !q || g.name.toLowerCase().includes(q) || g.hub.toLowerCase().includes(q);
    const matchHub  = !filterHub  || g.hub       === filterHub;
    const matchGame = !filterGame || g.game      === filterGame;
    const matchType = !filterType || g.groupType === filterType;
    return matchSearch && matchHub && matchGame && matchType;
  });
  const sorted = sortGroups(filtered, sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span className="au-sort-icon au-sort-icon--idle">⇅</span>;
    return <span className="au-sort-icon au-sort-icon--active">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="sp-dashboard">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="sp-page-header au-page-header">
        <div>
          <h1 className="sp-page-title">🎯 Group & Centre Management</h1>
          <p className="sp-page-subtitle">
            {groups.length} groups across {centres.length} centres
          </p>
        </div>
        <button className="au-btn au-btn--primary" onClick={() => { setAddError(null); setShowAddModal(true); }}>+ Add Group</button>
      </div>

      {/* ── Centre overview cards ─────────────────────────────────────────── */}
      <section className="ag-centres-section">
        <h2 className="ag-section-title">Centre Overview</h2>
        <div className="ag-centre-cards">
          {centres.map((centre) => (
            <div key={centre.name} className="ag-centre-card">
              <div className="ag-centre-card__icon">{centre.icon}</div>
              <div className="ag-centre-card__body">
                <div className="ag-centre-card__name">{centre.name}</div>
                <div className="ag-centre-card__stats">
                  <span className="ag-centre-card__stat" title="Groups">
                    <span className="ag-centre-card__stat-icon">🎯</span>
                    {centre.groupCount} group{centre.groupCount !== 1 ? "s" : ""}
                  </span>
                  <span className="ag-centre-card__stat" title="Members">
                    <span className="ag-centre-card__stat-icon">👤</span>
                    {centre.memberCount} member{centre.memberCount !== 1 ? "s" : ""}
                  </span>
                  <span className="ag-centre-card__stat" title="Active modules">
                    <span className="ag-centre-card__stat-icon">📚</span>
                    {centre.activeModuleCount} active module{centre.activeModuleCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="au-toolbar">
        <div className="au-toolbar__search">
          <span className="au-toolbar__search-icon">🔍</span>
          <input
            type="text"
            className="au-toolbar__search-input"
            placeholder="Search by name or centre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="au-toolbar__clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
          )}
        </div>
        <select className="au-toolbar__select" value={filterHub} onChange={(e) => setFilterHub(e.target.value)}>
          <option value="">All Centres</option>
          {KNOWN_HUBS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <select className="au-toolbar__select" value={filterGame} onChange={(e) => setFilterGame(e.target.value)}>
          <option value="">All Games</option>
          {GAME_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="au-toolbar__select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="au-toolbar__count">{sorted.length} of {groups.length} groups</span>
      </div>

      {/* ── Groups table ─────────────────────────────────────────────────── */}
      <section className="sp-card au-table-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">All Groups</h2>
        </div>
        <div className="au-table-wrapper">
          <table className="au-table ag-table">
            <thead>
              <tr>
                <th className={`au-th au-th--sortable${sortKey === "name" ? " au-th--sorted" : ""}`} onClick={() => handleSort("name")}>
                  Group Name {sortIndicator("name")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "hub" ? " au-th--sorted" : ""}`} onClick={() => handleSort("hub")}>
                  Centre {sortIndicator("hub")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "game" ? " au-th--sorted" : ""}`} onClick={() => handleSort("game")}>
                  Game {sortIndicator("game")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "groupType" ? " au-th--sorted" : ""}`} onClick={() => handleSort("groupType")}>
                  Type {sortIndicator("groupType")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "memberCount" ? " au-th--sorted" : ""}`} onClick={() => handleSort("memberCount")}>
                  Members {sortIndicator("memberCount")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "moduleCount" ? " au-th--sorted" : ""}`} onClick={() => handleSort("moduleCount")}>
                  Modules {sortIndicator("moduleCount")}
                </th>
                <th className="au-th au-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td className="au-td au-td--empty" colSpan={7}>
                    No groups match your search or filters.
                  </td>
                </tr>
              )}
              {sorted.map((group) => (
                <tr key={group.id} className="au-tr ag-tr">
                  <td className="au-td au-td--name ag-td--name">{group.name}</td>
                  <td className="au-td ag-td--hub">
                    <span className="ag-hub-label">
                      {HUB_ICONS[group.hub] ?? "🏢"} {group.hub}
                    </span>
                  </td>
                  <td className="au-td">
                    <span className={`ag-game-pill ag-game-pill--${group.game.toLowerCase().replace(/\s+/g, "-")}`}>
                      {group.game}
                    </span>
                  </td>
                  <td className="au-td">
                    <span className={`ag-type-pill ag-type-pill--${group.groupType.toLowerCase()}`}>
                      {group.groupType}
                    </span>
                  </td>
                  <td className="au-td ag-td--count">👤 {group.memberCount}</td>
                  <td className="au-td ag-td--modules">
                    <div className="ag-module-cell">
                      {group.moduleIds.map((mid) => {
                        const mod = allModules.find((m) => m.id === mid);
                        if (!mod) return null;
                        return (
                          <span key={mid} className="ag-module-chip">
                            <span className="ag-module-chip__name" title={mod.name}>{mod.name}</span>
                            <button
                              className="ag-module-chip__remove"
                              aria-label={`Remove ${mod.name}`}
                              onClick={() => handleUnassignModule(group.id, mid)}
                            >✕</button>
                          </span>
                        );
                      })}
                      {(() => {
                        const assignable = allModules.filter(
                          (m) => m.status === "Active" && !group.moduleIds.includes(m.id),
                        );
                        if (assignable.length === 0) return null;
                        return (
                          <select
                            className="ag-module-add-select"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleAssignModule(group.id, Number(e.target.value));
                            }}
                            aria-label="Assign module"
                          >
                            <option value="">+ module</option>
                            {assignable.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="au-td au-td--actions">
                    <div className="au-action-group">
                      <button
                        className="au-btn au-btn--small au-btn--ghost"
                        title="Edit"
                        onClick={() => { setEditError(null); setEditingGroup(group); }}
                      >✏️</button>
                      {/* Delete — wired in 5e */}
                      <button
                        className="au-btn au-btn--small au-btn--ghost au-btn--danger-text"
                        title="Delete"
                        onClick={() => { setDeleteError(null); setDeletingGroup(group); }}
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add Group modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <GroupFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGroup}
          serverError={addError}
        />
      )}

      {/* ── Edit Group modal ───────────────────────────────────────────────── */}
      {editingGroup && (
        <GroupFormModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={handleEditGroup}
          serverError={editError}
        />
      )}

      {/* ── Delete Group modal ──────────────────────────────────────────────── */}
      {deletingGroup && (
        <DeleteGroupModal
          group={deletingGroup}
          otherGroups={groups.filter((g) => g.id !== deletingGroup.id)}
          onClose={() => setDeletingGroup(null)}
          onConfirm={handleDeleteGroup}
          serverError={deleteError}
        />
      )}

    </div>
  );
}

export { GAME_OPTIONS, TYPE_OPTIONS, KNOWN_HUBS };

// ─── GroupFormModal ───────────────────────────────────────────────────────────

interface GroupFormData {
  name: string;
  hub: string;
  game: AdminGroupGame;
  groupType: AdminGroupType;
}

export function GroupFormModal({
  group,
  onClose,
  onSave,
  serverError,
}: {
  group?: AdminGroupDto;
  onClose: () => void;
  onSave: (data: GroupFormData) => void;
  serverError?: string | null;
}) {
  const isEdit = !!group;
  const [name, setName] = useState(group?.name ?? "");
  const [hub, setHub] = useState(group?.hub ?? KNOWN_HUBS[0]);
  const [game, setGame] = useState<AdminGroupGame>(group?.game ?? GAME_OPTIONS[0]);
  const [groupType, setGroupType] = useState<AdminGroupType>(group?.groupType ?? TYPE_OPTIONS[0]);
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError("Group name is required."); return; }
    onSave({ name: name.trim(), hub, game, groupType });
  }

  return (
    <div className="au-modal-backdrop" onClick={onClose}>
      <div className="au-modal ag-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <h2 className="au-modal__title">{isEdit ? "✏️ Edit Group" : "🎯 Add Group"}</h2>
          <button className="au-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form className="au-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="ag-name">Group Name</label>
            <input
              id="ag-name"
              className={`au-modal__input${nameError ? " au-modal__input--error" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null); }}
              placeholder="e.g. Wolf Cubs"
              autoFocus
            />
            {nameError && <span className="au-modal__error">{nameError}</span>}
          </div>
          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="ag-hub">Centre</label>
            <select id="ag-hub" className="au-modal__select" value={hub} onChange={(e) => setHub(e.target.value)}>
              {KNOWN_HUBS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="au-modal__row">
            <div className="au-modal__field au-modal__field--half">
              <label className="au-modal__label" htmlFor="ag-game">Game Tag</label>
              <select id="ag-game" className="au-modal__select" value={game} onChange={(e) => setGame(e.target.value as AdminGroupGame)}>
                {GAME_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="au-modal__field au-modal__field--half">
              <label className="au-modal__label" htmlFor="ag-type">Group Type</label>
              <select id="ag-type" className="au-modal__select" value={groupType} onChange={(e) => setGroupType(e.target.value as AdminGroupType)}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {serverError && <p className="au-modal__server-error">{serverError}</p>}
          <div className="au-modal__actions">
            <button type="button" className="au-btn au-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="au-btn au-btn--primary">{isEdit ? "Save Changes" : "Add Group"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteGroupModal ─────────────────────────────────────────────────────────

function DeleteGroupModal({
  group,
  otherGroups,
  onClose,
  onConfirm,
  serverError,
}: {
  group: AdminGroupDto;
  otherGroups: AdminGroupDto[];
  onClose: () => void;
  onConfirm: (groupId: string, reassignToId: string | null) => void;
  serverError?: string | null;
}) {
  const [reassignTo, setReassignTo] = useState<string>("none");
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    if (!confirmed) { setConfirmed(true); return; }
    onConfirm(group.id, reassignTo === "none" ? null : reassignTo);
  }

  return (
    <div className="au-modal-backdrop" onClick={onClose}>
      <div className="au-modal ag-modal ag-modal--delete" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <h2 className="au-modal__title">🗑️ Remove Group</h2>
          <button className="au-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="au-modal__form">
          <div className="ag-delete-warning">
            <span className="ag-delete-warning__icon">⚠️</span>
            <p className="ag-delete-warning__text">
              You are about to remove <strong>{group.name}</strong>.
              {group.memberCount > 0 && (
                <> This group has <strong>{group.memberCount} member{group.memberCount !== 1 ? "s" : ""}</strong> who will need reassigning.</>
              )}
            </p>
          </div>

          {group.memberCount > 0 && (
            <div className="au-modal__field">
              <label className="au-modal__label" htmlFor="ag-reassign">
                Reassign members to
              </label>
              <select
                id="ag-reassign"
                className="au-modal__select"
                value={reassignTo}
                onChange={(e) => { setReassignTo(e.target.value); setConfirmed(false); }}
              >
                <option value="none">— Leave unassigned —</option>
                {otherGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.hub})</option>
                ))}
              </select>
            </div>
          )}

          {confirmed && (
            <p className="ag-delete-confirm-prompt">
              Are you sure? This cannot be undone.
            </p>
          )}

          {serverError && <p className="au-modal__server-error">{serverError}</p>}

          <div className="au-modal__actions">
            <button type="button" className="au-btn au-btn--ghost" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className={`au-btn ${confirmed ? "au-btn--danger" : "au-btn--ghost au-btn--danger-text"}`}
              onClick={handleConfirm}
            >
              {confirmed ? "Yes, delete" : "Remove Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
