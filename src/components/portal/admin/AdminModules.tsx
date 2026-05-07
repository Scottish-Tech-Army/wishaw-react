import { useState, useEffect, useRef } from "react";
import type { AdminModuleDto, AdminModuleStatus, AdminSubBadgeDto, AdminSessionDto } from "../../../api/types";
import { getAdminModules, createAdminModule, updateAdminModule, archiveAdminModule, addSubBadge, updateSubBadge, removeSubBadge, reorderSubBadges, addSession, updateSession, removeSession, uploadResource, removeResource } from "../../../api/index";
import "../../../portal.css";

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type SortKey = "name" | "game" | "durationWeeks" | "status" | "subBadgeCount" | "groupCount";
type SortDir = "asc" | "desc";

function sortModules(modules: AdminModuleDto[], key: SortKey, dir: SortDir): AdminModuleDto[] {
  return [...modules].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":          cmp = a.name.localeCompare(b.name); break;
      case "game":          cmp = a.game.localeCompare(b.game); break;
      case "durationWeeks": cmp = a.durationWeeks - b.durationWeeks; break;
      case "status":        cmp = a.status.localeCompare(b.status); break;
      case "subBadgeCount": cmp = a.subBadges.length - b.subBadges.length; break;
      case "groupCount":    cmp = a.groupsUsingIt.length - b.groupsUsingIt.length; break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

const STATUS_OPTIONS: AdminModuleStatus[] = ["Active", "Draft", "Archived"];
const GAME_OPTIONS = ["Fortnite", "Valorant", "Rocket League", "General"];

const MAIN_BADGE_META: Record<string, { name: string; icon: string; color: string }> = {
  "game-mastery":        { name: "Game Mastery",        icon: "🎮", color: "#e74c3c" },
  "teamwork":            { name: "Teamwork",            icon: "🤝", color: "#3b82f6" },
  "esports-citizen":     { name: "Esports Citizen",     icon: "🌐", color: "#8b5cf6" },
  "personal-development":{ name: "Personal Development", icon: "🌱", color: "#22c55e" },
  "digital-skills":      { name: "Digital Skills",      icon: "💻", color: "#f59e0b" },
};

const YSOF_SKILLS = [
  "Problem Solving", "Strategic Thinking", "Practical Skills", "Perseverance",
  "Focus", "Technical Ability", "Communication", "Situational Awareness",
  "Leadership", "Empathy", "Decision Making", "Inclusivity",
  "Citizenship", "Collaboration", "Conflict Resolution", "Emotional Regulation",
  "Resilience", "Integrity", "Respect", "Self-Awareness", "Reflection",
  "Goal Setting", "Planning", "Adaptability", "Openness to Learning",
  "Self-Improvement", "Online Safety", "Digital Literacy", "Responsibility",
  "Creativity", "Digital Communication", "Data Literacy", "Critical Thinking",
  "Research",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminModules() {
  const [modules, setModules] = useState<AdminModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminModuleDto | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<number | null>(null);
  const [viewModuleId, setViewModuleId] = useState<number | null>(null);
  const viewModule = viewModuleId != null ? modules.find((m) => m.id === viewModuleId) ?? null : null;

  // ── Create module handler ────────────────────────────────────────────────
  async function handleCreateModule(data: { name: string; game: string; outcome: string; durationWeeks: number; status: AdminModuleStatus }) {
    const newMod = await createAdminModule(data);
    setModules((prev) => [newMod, ...prev]);
    setShowCreateModal(false);
  }

  // ── Edit module handler ──────────────────────────────────────────────────
  async function handleEditModule(data: { name: string; game: string; outcome: string; durationWeeks: number; status: AdminModuleStatus }) {
    if (!editingModule) return;
    const updated = await updateAdminModule(editingModule.id, data);
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingModule(null);
  }

  // ── Archive module handler ───────────────────────────────────────────────
  async function handleArchive(id: number) {
    const archived = await archiveAdminModule(id);
    setModules((prev) => prev.map((m) => (m.id === archived.id ? archived : m)));
    setConfirmArchiveId(null);
  }

  useEffect(() => {
    let cancelled = false;
    getAdminModules()
      .then((data) => {
        if (!cancelled) setModules(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load modules");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Sort toggle ───────────────────────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span className="au-sort-icon au-sort-icon--idle">⇅</span>;
    return (
      <span className="au-sort-icon au-sort-icon--active">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  // ── Filtering & sorting ───────────────────────────────────────────────────
  const filtered = modules.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.game.toLowerCase().includes(q);
    const matchesStatus = !filterStatus || m.status === filterStatus;
    const matchesGame = !filterGame || m.game === filterGame;
    return matchesSearch && matchesStatus && matchesGame;
  });

  const sorted = sortModules(filtered, sortKey, sortDir);

  // ── Status pill class ─────────────────────────────────────────────────────
  function statusClass(status: AdminModuleStatus) {
    switch (status) {
      case "Active":   return "am-status am-status--active";
      case "Draft":    return "am-status am-status--draft";
      case "Archived": return "am-status am-status--archived";
    }
  }

  function gamePillClass(game: string) {
    switch (game) {
      case "Fortnite":      return "am-game-pill am-game-pill--fortnite";
      case "Valorant":      return "am-game-pill am-game-pill--valorant";
      case "Rocket League": return "am-game-pill am-game-pill--rocket-league";
      case "General":       return "am-game-pill am-game-pill--general";
      default:              return "am-game-pill";
    }
  }

  if (loading) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header">
          <h1 className="sp-page-title">Module Management</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>Loading modules…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header">
          <h1 className="sp-page-title">Module Management</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="sp-dashboard">
      {/* Page header */}
      <div className="sp-page-header au-page-header">
        <div>
          <h1 className="sp-page-title">📚 Module Management</h1>
          <p className="sp-page-subtitle">
            {modules.length} modules across all programmes
          </p>
        </div>
        <button className="au-btn au-btn--primary" onClick={() => setShowCreateModal(true)}>+ Create Module</button>
      </div>

      {/* Search & filters */}
      <div className="au-toolbar">
        <div className="au-toolbar__search">
          <span className="au-toolbar__search-icon">🔍</span>
          <input
            type="text"
            className="au-toolbar__search-input"
            placeholder="Search by name or game…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="au-toolbar__clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
          )}
        </div>
        <select
          className="au-toolbar__select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="au-toolbar__select"
          value={filterGame}
          onChange={(e) => setFilterGame(e.target.value)}
        >
          <option value="">All Games</option>
          {GAME_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <span className="au-toolbar__count">{sorted.length} of {modules.length} modules</span>
      </div>

      {/* Table */}
      <section className="sp-card au-table-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">All Modules</h2>
        </div>

        <div className="au-table-wrapper">
          <table className="au-table am-table">
            <thead>
              <tr>
                <th className={`au-th au-th--sortable${sortKey === "name" ? " au-th--sorted" : ""}`} onClick={() => handleSort("name")}>
                  Name {sortIndicator("name")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "game" ? " au-th--sorted" : ""}`} onClick={() => handleSort("game")}>
                  Game {sortIndicator("game")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "durationWeeks" ? " au-th--sorted" : ""}`} onClick={() => handleSort("durationWeeks")}>
                  Duration {sortIndicator("durationWeeks")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "status" ? " au-th--sorted" : ""}`} onClick={() => handleSort("status")}>
                  Status {sortIndicator("status")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "subBadgeCount" ? " au-th--sorted" : ""}`} onClick={() => handleSort("subBadgeCount")}>
                  Sub-badges {sortIndicator("subBadgeCount")}
                </th>
                <th className={`au-th au-th--sortable${sortKey === "groupCount" ? " au-th--sorted" : ""}`} onClick={() => handleSort("groupCount")}>
                  Groups {sortIndicator("groupCount")}
                </th>
                <th className="au-th au-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td className="au-td au-td--empty" colSpan={7}>
                    No modules match your search or filters.
                  </td>
                </tr>
              )}
              {sorted.map((mod) => (
                <tr key={mod.id} className="au-tr am-tr">
                  <td className="au-td au-td--name">
                    <button className="au-name-link" onClick={() => setViewModuleId(mod.id)}>{mod.name}</button>
                  </td>
                  <td className="au-td">
                    <span className={gamePillClass(mod.game)}>{mod.game}</span>
                  </td>
                  <td className="au-td am-td--duration">
                    {mod.durationWeeks} weeks
                  </td>
                  <td className="au-td">
                    <span className={statusClass(mod.status)}>{mod.status}</span>
                  </td>
                  <td className="au-td am-td--count">
                    🏅 {mod.subBadges.length}
                  </td>
                  <td className="au-td am-td--count">
                    {mod.groupsUsingIt.length > 0 ? (
                      <span className="am-groups-pill" title={mod.groupsUsingIt.join(", ")}>
                        {mod.groupsUsingIt.length} group{mod.groupsUsingIt.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="am-groups-none">—</span>
                    )}
                  </td>
                  <td className="au-td au-td--actions">
                    {confirmArchiveId === mod.id ? (
                      <div className="au-action-group">
                        <span className="au-confirm-label">Archive?</span>
                        <button className="au-btn au-btn--small au-btn--danger" onClick={() => handleArchive(mod.id)}>Yes</button>
                        <button className="au-btn au-btn--small au-btn--ghost" onClick={() => setConfirmArchiveId(null)}>No</button>
                      </div>
                    ) : (
                      <div className="au-action-group">
                        <button className="au-btn au-btn--small au-btn--ghost" title="View" onClick={() => setViewModuleId(mod.id)}>👁️</button>
                        <button className="au-btn au-btn--small au-btn--ghost" title="Edit" onClick={() => setEditingModule(mod)}>✏️</button>
                        {mod.status !== "Archived" && (
                          <button className="au-btn au-btn--small au-btn--ghost au-btn--danger-text" title="Archive" onClick={() => setConfirmArchiveId(mod.id)}>📦</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Module modal */}
      {showCreateModal && (
        <ModuleFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateModule}
        />
      )}

      {/* Edit Module modal */}
      {editingModule && (
        <ModuleFormModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onSave={handleEditModule}
        />
      )}

      {/* Module detail drawer */}
      {viewModule && (
        <ModuleDetailDrawer
          module={viewModule}
          onClose={() => setViewModuleId(null)}
          onModuleUpdate={(updated) => setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))}
        />
      )}
    </div>
  );
}

// ─── Module Form Modal (Create / Edit) ───────────────────────────────────────

interface ModuleFormData {
  name: string;
  game: string;
  outcome: string;
  durationWeeks: number;
  status: AdminModuleStatus;
}

function ModuleFormModal({
  module,
  onClose,
  onSave,
}: {
  module?: AdminModuleDto;
  onClose: () => void;
  onSave: (data: ModuleFormData) => void;
}) {
  const isEdit = !!module;
  const [name, setName] = useState(module?.name ?? "");
  const [game, setGame] = useState(module?.game ?? GAME_OPTIONS[0]);
  const [outcome, setOutcome] = useState(module?.outcome ?? "");
  const [durationWeeks, setDurationWeeks] = useState(module?.durationWeeks ?? 12);
  const [status, setStatus] = useState<AdminModuleStatus>(module?.status ?? "Draft");
  const [errors, setErrors] = useState<{ name?: string; outcome?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Module name is required.";
    if (!outcome.trim()) errs.outcome = "Learning outcome is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ name: name.trim(), game, outcome: outcome.trim(), durationWeeks, status });
  }

  return (
    <div className="au-modal-backdrop" onClick={onClose}>
      <div className="au-modal am-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <h2 className="au-modal__title">{isEdit ? "✏️ Edit Module" : "📚 Create New Module"}</h2>
          <button className="au-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="au-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="mod-name">Module Name</label>
            <input
              id="mod-name"
              className={`au-modal__input${errors.name ? " au-modal__input--error" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Fortnite Fundamentals"
              autoFocus
            />
            {errors.name && <span className="au-modal__error">{errors.name}</span>}
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="mod-game">Game</label>
            <select
              id="mod-game"
              className="au-modal__select"
              value={game}
              onChange={(e) => setGame(e.target.value)}
            >
              {GAME_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="mod-outcome">Overall Learning Outcome / Goal</label>
            <textarea
              id="mod-outcome"
              className={`au-modal__textarea${errors.outcome ? " au-modal__input--error" : ""}`}
              value={outcome}
              onChange={(e) => { setOutcome(e.target.value); setErrors((p) => ({ ...p, outcome: undefined })); }}
              placeholder="Describe the overall learning outcome for this module…"
              rows={3}
            />
            {errors.outcome && <span className="au-modal__error">{errors.outcome}</span>}
          </div>

          <div className="au-modal__row">
            <div className="au-modal__field au-modal__field--half">
              <label className="au-modal__label" htmlFor="mod-duration">Duration (weeks)</label>
              <input
                id="mod-duration"
                type="number"
                className="au-modal__input"
                value={durationWeeks}
                min={12}
                max={16}
                onChange={(e) => setDurationWeeks(Math.max(12, Math.min(16, Number(e.target.value))))}
              />
            </div>

            <div className="au-modal__field au-modal__field--half">
              <label className="au-modal__label" htmlFor="mod-status">Status</label>
              <select
                id="mod-status"
                className="au-modal__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminModuleStatus)}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                {isEdit && <option value="Archived">Archived</option>}
              </select>
            </div>
          </div>

          <div className="au-modal__actions">
            <button type="button" className="au-btn au-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="au-btn au-btn--primary">{isEdit ? "Save Changes" : "Create Module"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Module Detail Drawer ─────────────────────────────────────────────────────

function ModuleDetailDrawer({ module, onClose, onModuleUpdate }: { module: AdminModuleDto; onClose: () => void; onModuleUpdate: (m: AdminModuleDto) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubBadgeId, setEditingSubBadgeId] = useState<number | null>(null);
  const [confirmRemoveSubId, setConfirmRemoveSubId] = useState<number | null>(null);

  // Session state
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [confirmRemoveSessionId, setConfirmRemoveSessionId] = useState<number | null>(null);

  async function handleAddSubBadge(data: Omit<AdminSubBadgeDto, "id">) {
    const newSub = await addSubBadge(module.id, data);
    const updated = { ...module, subBadges: [...module.subBadges, newSub] };
    onModuleUpdate(updated);
    setShowAddForm(false);
  }

  async function handleEditSubBadge(data: Omit<AdminSubBadgeDto, "id">) {
    if (editingSubBadgeId == null) return;
    const updatedSub = await updateSubBadge(module.id, editingSubBadgeId, data);
    const updated = { ...module, subBadges: module.subBadges.map((s) => (s.id === updatedSub.id ? updatedSub : s)) };
    onModuleUpdate(updated);
    setEditingSubBadgeId(null);
  }

  async function handleRemoveSubBadge(subBadgeId: number) {
    await removeSubBadge(module.id, subBadgeId);
    const updated = { ...module, subBadges: module.subBadges.filter((s) => s.id !== subBadgeId) };
    onModuleUpdate(updated);
    setConfirmRemoveSubId(null);
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const newList = [...module.subBadges];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    const reordered = await reorderSubBadges(module.id, newList.map((s) => s.id));
    onModuleUpdate({ ...module, subBadges: reordered });
  }

  // Session handlers
  async function handleAddSession(data: Omit<AdminSessionDto, "id" | "resources">) {
    const newSes = await addSession(module.id, data);
    onModuleUpdate({ ...module, sessions: [...module.sessions, newSes] });
    setShowSessionForm(false);
  }

  async function handleEditSession(data: Omit<AdminSessionDto, "id" | "resources">) {
    if (editingSessionId == null) return;
    const updated = await updateSession(module.id, editingSessionId, data);
    onModuleUpdate({ ...module, sessions: module.sessions.map((s) => (s.id === updated.id ? updated : s)) });
    setEditingSessionId(null);
  }

  async function handleRemoveSession(sessionId: number) {
    await removeSession(module.id, sessionId);
    onModuleUpdate({ ...module, sessions: module.sessions.filter((s) => s.id !== sessionId) });
    setConfirmRemoveSessionId(null);
  }

  async function handleUploadResource(sessionId: number, file: File) {
    const res = await uploadResource(module.id, sessionId, file);
    onModuleUpdate({
      ...module,
      sessions: module.sessions.map((s) =>
        s.id === sessionId ? { ...s, resources: [...s.resources, res] } : s,
      ),
    });
  }

  async function handleRemoveResource(sessionId: number, resourceId: number) {
    await removeResource(module.id, sessionId, resourceId);
    onModuleUpdate({
      ...module,
      sessions: module.sessions.map((s) =>
        s.id === sessionId ? { ...s, resources: s.resources.filter((r) => r.id !== resourceId) } : s,
      ),
    });
  }

  function badgePill(mainBadgeId: string) {
    const meta = MAIN_BADGE_META[mainBadgeId];
    if (!meta) return <span className="am-badge-pill">{mainBadgeId}</span>;
    return (
      <span
        className="am-badge-pill"
        style={{ background: `${meta.color}18`, color: meta.color, borderColor: `${meta.color}40` }}
      >
        {meta.icon} {meta.name}
      </span>
    );
  }

  function statusClass(status: AdminModuleStatus) {
    switch (status) {
      case "Active":   return "am-status am-status--active";
      case "Draft":    return "am-status am-status--draft";
      case "Archived": return "am-status am-status--archived";
    }
  }

  return (
    <div className="au-drawer-backdrop" onClick={onClose}>
      <aside className="au-drawer am-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="au-drawer__header">
          <h2 className="au-drawer__title">📚 {module.name}</h2>
          <button className="au-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Module summary */}
        <div className="au-drawer__section">
          <div className="au-drawer__info-grid">
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Game</span>
              <span className="au-drawer__info-value">{module.game}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Duration</span>
              <span className="au-drawer__info-value">{module.durationWeeks} weeks</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Status</span>
              <span className={statusClass(module.status)}>{module.status}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Groups</span>
              <span className="au-drawer__info-value">
                {module.groupsUsingIt.length > 0 ? module.groupsUsingIt.join(", ") : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Learning outcome */}
        <div className="au-drawer__section">
          <h3 className="au-drawer__section-title">🎯 Learning Outcome</h3>
          <p className="am-drawer__outcome">{module.outcome}</p>
        </div>

        {/* Sub-badges table */}
        <div className="au-drawer__section">
          <div className="am-drawer__sub-header">
            <h3 className="au-drawer__section-title">🏅 Sub-badges ({module.subBadges.length})</h3>
            {!showAddForm && (
              <button className="au-btn au-btn--small au-btn--primary" onClick={() => setShowAddForm(true)}>+ Add Sub-badge</button>
            )}
          </div>

          {showAddForm && (
            <SubBadgeForm
              onSave={handleAddSubBadge}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {editingSubBadgeId != null && (
            <SubBadgeForm
              initial={module.subBadges.find((s) => s.id === editingSubBadgeId)}
              onSave={handleEditSubBadge}
              onCancel={() => setEditingSubBadgeId(null)}
            />
          )}

          {module.subBadges.length === 0 ? (
            <p className="am-drawer__empty">No sub-badges yet. Add one using the sub-badge builder.</p>
          ) : (
            <div className="am-drawer__table-wrap">
              <table className="am-sub-table">
                <thead>
                  <tr>
                    <th className="am-sub-th">Name</th>
                    <th className="am-sub-th">Badge</th>
                    <th className="am-sub-th am-sub-th--xp">XP</th>
                    <th className="am-sub-th">YSOF Skills</th>
                    <th className="am-sub-th am-sub-th--order">Order</th>
                    <th className="am-sub-th am-sub-th--actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {module.subBadges.map((sb, idx) => (
                    <tr key={sb.id} className="am-sub-tr">
                      <td className="am-sub-td">
                        <div className="am-sub-name">{sb.name}</div>
                        <div className="am-sub-desc">{sb.description}</div>
                      </td>
                      <td className="am-sub-td">{badgePill(sb.mainBadgeId)}</td>
                      <td className="am-sub-td am-sub-td--xp">{sb.xpValue}</td>
                      <td className="am-sub-td">
                        <div className="am-skill-tags">
                          {sb.skills.map((s) => (
                            <span key={s} className="am-skill-tag">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="am-sub-td am-sub-td--order">
                        <div className="am-order-buttons">
                          <button
                            className="am-order-btn"
                            title="Move up"
                            disabled={idx === 0}
                            onClick={() => handleReorder(idx, "up")}
                          >▲</button>
                          <button
                            className="am-order-btn"
                            title="Move down"
                            disabled={idx === module.subBadges.length - 1}
                            onClick={() => handleReorder(idx, "down")}
                          >▼</button>
                        </div>
                      </td>
                      <td className="am-sub-td am-sub-td--actions">
                        {confirmRemoveSubId === sb.id ? (
                          <div className="au-action-group">
                            <span className="au-confirm-label">Remove?</span>
                            <button className="au-btn au-btn--small au-btn--danger" onClick={() => handleRemoveSubBadge(sb.id)}>Yes</button>
                            <button className="au-btn au-btn--small au-btn--ghost" onClick={() => setConfirmRemoveSubId(null)}>No</button>
                          </div>
                        ) : (
                          <div className="au-action-group">
                            <button className="au-btn au-btn--small au-btn--ghost" title="Edit" onClick={() => { setEditingSubBadgeId(sb.id); setShowAddForm(false); }}>✏️</button>
                            <button className="au-btn au-btn--small au-btn--ghost au-btn--danger-text" title="Remove" onClick={() => setConfirmRemoveSubId(sb.id)}>🗑️</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sessions / Lesson Plans */}
        <div className="au-drawer__section">
          <div className="am-drawer__sub-header">
            <h3 className="au-drawer__section-title">📅 Sessions ({module.sessions.length})</h3>
            {!showSessionForm && editingSessionId == null && (
              <button className="au-btn au-btn--small au-btn--primary" onClick={() => setShowSessionForm(true)}>+ Add Session</button>
            )}
          </div>

          {showSessionForm && (
            <SessionForm
              nextWeek={module.sessions.length + 1}
              onSave={handleAddSession}
              onCancel={() => setShowSessionForm(false)}
            />
          )}

          {editingSessionId != null && (
            <SessionForm
              initial={module.sessions.find((s) => s.id === editingSessionId)}
              nextWeek={0}
              onSave={handleEditSession}
              onCancel={() => setEditingSessionId(null)}
            />
          )}

          {module.sessions.length === 0 && !showSessionForm ? (
            <p className="am-drawer__empty">No sessions yet. Add session plans, delivery notes and lesson resources.</p>
          ) : (
            <div className="am-sessions-list">
              {[...module.sessions]
                .sort((a, b) => a.weekNumber - b.weekNumber)
                .map((ses) => (
                  <SessionCard
                    key={ses.id}
                    session={ses}
                    expanded={expandedSessionId === ses.id}
                    onToggle={() => setExpandedSessionId(expandedSessionId === ses.id ? null : ses.id)}
                    onEdit={() => { setEditingSessionId(ses.id); setShowSessionForm(false); }}
                    onRemove={() => confirmRemoveSessionId === ses.id ? handleRemoveSession(ses.id) : setConfirmRemoveSessionId(ses.id)}
                    confirmingRemove={confirmRemoveSessionId === ses.id}
                    onCancelRemove={() => setConfirmRemoveSessionId(null)}
                    onUpload={(file) => handleUploadResource(ses.id, file)}
                    onRemoveResource={(resId) => handleRemoveResource(ses.id, resId)}
                  />
                ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── Sub-badge Form (Add / Edit, inline in drawer) ───────────────────────

function SubBadgeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AdminSubBadgeDto;
  onSave: (data: Omit<AdminSubBadgeDto, "id">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [mainBadgeId, setMainBadgeId] = useState(initial?.mainBadgeId ?? "game-mastery");
  const [xpValue, setXpValue] = useState(initial?.xpValue ?? 25);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initial?.skills ?? []);
  const [errors, setErrors] = useState<{ name?: string; description?: string; skills?: string }>({});

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
    setErrors((p) => ({ ...p, skills: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (selectedSkills.length < 2) errs.skills = "Select at least 2 YSOF skills.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ name: name.trim(), description: description.trim(), mainBadgeId, xpValue, skills: selectedSkills });
  }

  return (
    <form className="am-add-sub-form" onSubmit={handleSubmit} noValidate>
      <h4 className="am-add-sub-form__title">{isEdit ? "✏️ Edit Sub-badge" : "➕ New Sub-badge"}</h4>

      <div className="au-modal__field">
        <label className="au-modal__label" htmlFor="sb-name">Name</label>
        <input
          id="sb-name"
          className={`au-modal__input${errors.name ? " au-modal__input--error" : ""}`}
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          placeholder="e.g. Zone Reader"
          autoFocus
        />
        {errors.name && <span className="au-modal__error">{errors.name}</span>}
      </div>

      <div className="au-modal__field">
        <label className="au-modal__label" htmlFor="sb-desc">Description</label>
        <textarea
          id="sb-desc"
          className={`au-modal__textarea${errors.description ? " au-modal__input--error" : ""}`}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
          placeholder="Describe the challenge criteria…"
          rows={2}
        />
        {errors.description && <span className="au-modal__error">{errors.description}</span>}
      </div>

      <div className="au-modal__row">
        <div className="au-modal__field au-modal__field--half">
          <label className="au-modal__label" htmlFor="sb-badge">Main Badge</label>
          <select
            id="sb-badge"
            className="au-modal__select"
            value={mainBadgeId}
            onChange={(e) => setMainBadgeId(e.target.value)}
          >
            {Object.entries(MAIN_BADGE_META).map(([id, meta]) => (
              <option key={id} value={id}>{meta.icon} {meta.name}</option>
            ))}
          </select>
        </div>

        <div className="au-modal__field au-modal__field--half">
          <label className="au-modal__label" htmlFor="sb-xp">XP Value</label>
          <input
            id="sb-xp"
            type="number"
            className="au-modal__input"
            value={xpValue}
            min={5}
            max={100}
            onChange={(e) => setXpValue(Math.max(5, Math.min(100, Number(e.target.value))))}
          />
        </div>
      </div>

      <div className="au-modal__field">
        <label className="au-modal__label">YSOF Skills (min 2)</label>
        <div className="am-skill-picker">
          {YSOF_SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`am-skill-picker__chip${selectedSkills.includes(skill) ? " am-skill-picker__chip--selected" : ""}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
        {errors.skills && <span className="au-modal__error">{errors.skills}</span>}
      </div>

      <div className="au-modal__actions">
        <button type="button" className="au-btn au-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="au-btn au-btn--primary">{isEdit ? "Save Changes" : "Add Sub-badge"}</button>
      </div>
    </form>
  );
}

// ─── Session Card (collapsible, with resources) ──────────────────────────────

const FILE_TYPE_ICONS: Record<string, string> = {
  pptx: "📊", pdf: "📄", video: "🎬", image: "🖼️", doc: "📝", other: "📎",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SessionCard({
  session,
  expanded,
  onToggle,
  onEdit,
  onRemove,
  confirmingRemove,
  onCancelRemove,
  onUpload,
  onRemoveResource,
}: {
  session: AdminSessionDto;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
  confirmingRemove: boolean;
  onCancelRemove: () => void;
  onUpload: (file: File) => void;
  onRemoveResource: (resourceId: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  }

  return (
    <div className={`am-session-card${expanded ? " am-session-card--expanded" : ""}`}>
      <div className="am-session-card__header" onClick={onToggle}>
        <div className="am-session-card__title-row">
          <span className="am-session-card__chevron">{expanded ? "▾" : "▸"}</span>
          <span className="am-session-card__week">Week {session.weekNumber}</span>
          <span className="am-session-card__title">{session.title}</span>
          <span className="am-session-card__meta">
            {session.resources.length > 0 && (
              <span className="am-session-card__res-count">📎 {session.resources.length}</span>
            )}
          </span>
        </div>
        <div className="am-session-card__actions" onClick={(e) => e.stopPropagation()}>
          {confirmingRemove ? (
            <div className="au-action-group">
              <span className="au-confirm-label">Remove?</span>
              <button className="au-btn au-btn--small au-btn--danger" onClick={onRemove}>Yes</button>
              <button className="au-btn au-btn--small au-btn--ghost" onClick={onCancelRemove}>No</button>
            </div>
          ) : (
            <>
              <button className="au-btn au-btn--small au-btn--ghost" title="Edit session" onClick={onEdit}>✏️</button>
              <button className="au-btn au-btn--small au-btn--ghost au-btn--danger-text" title="Remove session" onClick={onRemove}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="am-session-card__body">
          {/* Session Plan */}
          <div className="am-session-card__section">
            <h5 className="am-session-card__section-title">📋 Session Plan</h5>
            <p className="am-session-card__text">{session.sessionPlan || <em className="am-session-card__empty">No session plan added yet.</em>}</p>
          </div>

          {/* Delivery Notes */}
          <div className="am-session-card__section">
            <h5 className="am-session-card__section-title">📝 Delivery Notes</h5>
            <p className="am-session-card__text">{session.deliveryNotes || <em className="am-session-card__empty">No delivery notes added yet.</em>}</p>
          </div>

          {/* Resources */}
          <div className="am-session-card__section">
            <div className="am-session-card__section-header">
              <h5 className="am-session-card__section-title">📁 Resources ({session.resources.length})</h5>
              <button
                className="au-btn au-btn--small au-btn--primary"
                onClick={() => fileInputRef.current?.click()}
              >
                ⬆ Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="am-file-input-hidden"
                accept=".pptx,.ppt,.pdf,.mp4,.mov,.avi,.webm,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>

            {session.resources.length === 0 ? (
              <p className="am-session-card__empty">No resources uploaded. Upload slides, videos, or handouts.</p>
            ) : (
              <ul className="am-resource-list">
                {session.resources.map((res) => (
                  <li key={res.id} className="am-resource-item">
                    <span className="am-resource-icon">{FILE_TYPE_ICONS[res.fileType] ?? "📎"}</span>
                    <div className="am-resource-info">
                      <span className="am-resource-name">{res.fileName}</span>
                      <span className="am-resource-meta">{formatFileSize(res.fileSizeBytes)} · {res.fileType.toUpperCase()}</span>
                    </div>
                    <button
                      className="au-btn au-btn--small au-btn--ghost au-btn--danger-text"
                      title="Remove resource"
                      onClick={() => onRemoveResource(res.id)}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Session Form (Add / Edit, inline in drawer) ─────────────────────────────

function SessionForm({
  initial,
  nextWeek,
  onSave,
  onCancel,
}: {
  initial?: AdminSessionDto;
  nextWeek: number;
  onSave: (data: Omit<AdminSessionDto, "id" | "resources">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [weekNumber, setWeekNumber] = useState(initial?.weekNumber ?? nextWeek);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sessionPlan, setSessionPlan] = useState(initial?.sessionPlan ?? "");
  const [deliveryNotes, setDeliveryNotes] = useState(initial?.deliveryNotes ?? "");
  const [errors, setErrors] = useState<{ title?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = "Session title is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ weekNumber, title: title.trim(), sessionPlan: sessionPlan.trim(), deliveryNotes: deliveryNotes.trim() });
  }

  return (
    <form className="am-add-sub-form" onSubmit={handleSubmit} noValidate>
      <h4 className="am-add-sub-form__title">{isEdit ? "✏️ Edit Session" : "📅 New Session"}</h4>

      <div className="au-modal__row">
        <div className="au-modal__field au-modal__field--half">
          <label className="au-modal__label" htmlFor="ses-week">Week Number</label>
          <input
            id="ses-week"
            type="number"
            className="au-modal__input"
            value={weekNumber}
            min={1}
            max={20}
            onChange={(e) => setWeekNumber(Math.max(1, Math.min(20, Number(e.target.value))))}
          />
        </div>

        <div className="au-modal__field au-modal__field--half">
          <label className="au-modal__label" htmlFor="ses-title">Title</label>
          <input
            id="ses-title"
            className={`au-modal__input${errors.title ? " au-modal__input--error" : ""}`}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
            placeholder="e.g. Introduction & Settings Setup"
            autoFocus
          />
          {errors.title && <span className="au-modal__error">{errors.title}</span>}
        </div>
      </div>

      <div className="au-modal__field">
        <label className="au-modal__label" htmlFor="ses-plan">Session Plan</label>
        <textarea
          id="ses-plan"
          className="au-modal__textarea"
          value={sessionPlan}
          onChange={(e) => setSessionPlan(e.target.value)}
          placeholder="Describe the session activities, timings and structure…"
          rows={4}
        />
      </div>

      <div className="au-modal__field">
        <label className="au-modal__label" htmlFor="ses-notes">Delivery Notes</label>
        <textarea
          id="ses-notes"
          className="au-modal__textarea"
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder="Tips, timings, differentiation advice for facilitators…"
          rows={3}
        />
      </div>

      <div className="au-modal__actions">
        <button type="button" className="au-btn au-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="au-btn au-btn--primary">{isEdit ? "Save Changes" : "Add Session"}</button>
      </div>
    </form>
  );
}
