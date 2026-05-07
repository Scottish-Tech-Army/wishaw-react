import { useState } from "react";
import { createUser } from "../../../api/index";
import "../../../portal.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BadgeProgress {
  name: string;
  icon: string;
  level: string;
  earned: number;
  total: number;
}

interface ModuleProgress {
  name: string;
  icon: string;
  completed: number;
  total: number;
}

interface ActivityEvent {
  action: string;
  xp: number;
  date: string;
  icon: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  centre: string;
  group: string;
  level: number;
  totalXP: number;
  badgesEarned: number;
  joinedDate: string;
  badges: BadgeProgress[];
  modules: ModuleProgress[];
  recentActivity: ActivityEvent[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const BADGE_TEMPLATES: BadgeProgress[] = [
  { name: "Game Mastery", icon: "🎮", level: "Bronze", earned: 2, total: 5 },
  { name: "Teamwork", icon: "🤝", level: "Bronze", earned: 1, total: 4 },
  { name: "Esports Citizen", icon: "🌐", level: "Bronze", earned: 0, total: 4 },
  { name: "Personal Development", icon: "🌱", level: "Bronze", earned: 0, total: 4 },
  { name: "Digital Skills", icon: "💻", level: "Bronze", earned: 0, total: 4 },
];

function makeBadges(earned: number): BadgeProgress[] {
  let remaining = earned;
  return BADGE_TEMPLATES.map((b) => {
    const e = Math.min(remaining, b.total);
    remaining = Math.max(0, remaining - e);
    const level = e >= b.total ? "Gold" : e > 0 ? "Silver" : "Bronze";
    return { ...b, earned: e, level };
  });
}

function makeModules(level: number): ModuleProgress[] {
  const mods: ModuleProgress[] = [
    { name: "Fortnite Fundamentals", icon: "🎮", completed: 0, total: 4 },
    { name: "Team Communication", icon: "🤝", completed: 0, total: 4 },
    { name: "Performance Analysis", icon: "📊", completed: 0, total: 4 },
  ];
  let pts = Math.min(level, 12);
  return mods.map((m) => {
    const c = Math.min(pts, m.total);
    pts = Math.max(0, pts - c);
    return { ...m, completed: c };
  });
}

function makeActivity(name: string): ActivityEvent[] {
  return [
    { action: "Weekly challenge completed", xp: 75, date: "2026-03-21", icon: "🎯" },
    { action: "Won scrimmage match", xp: 120, date: "2026-03-14", icon: "🏆" },
    { action: `${name} earned a badge`, xp: 50, date: "2026-03-07", icon: "🏅" },
  ];
}

const CENTRES = ["Wishaw", "Glasgow", "Dublin"];
const GROUPS = [
  "Minecraft Juniors",
  "Minecraft Advanced",
  "Rocket League Juniors",
  "Rocket League Competitive",
  "Fortnite Squad",
];

const INITIAL_USERS: User[] = [
  {
    id: 1, name: "Jamie Robertson", username: "jamie_r", centre: "Wishaw",
    group: "Minecraft Juniors", level: 12, totalXP: 3400, badgesEarned: 8, joinedDate: "2025-09-01",
    badges: makeBadges(8), modules: makeModules(12), recentActivity: makeActivity("Jamie"),
  },
  {
    id: 2, name: "Chloe MacLeod", username: "chloe_m", centre: "Wishaw",
    group: "Minecraft Juniors", level: 10, totalXP: 2750, badgesEarned: 6, joinedDate: "2025-09-01",
    badges: makeBadges(6), modules: makeModules(10), recentActivity: makeActivity("Chloe"),
  },
  {
    id: 3, name: "Kieran Reilly", username: "kieran_rl", centre: "Wishaw",
    group: "Rocket League Competitive", level: 9, totalXP: 2100, badgesEarned: 5, joinedDate: "2025-10-14",
    badges: makeBadges(5), modules: makeModules(9), recentActivity: makeActivity("Kieran"),
  },
  {
    id: 4, name: "Sophie McCarthy", username: "sophie_mc", centre: "Wishaw",
    group: "Minecraft Juniors", level: 7, totalXP: 1500, badgesEarned: 3, joinedDate: "2025-11-03",
    badges: makeBadges(3), modules: makeModules(7), recentActivity: makeActivity("Sophie"),
  },
  {
    id: 5, name: "Alex Thompson", username: "alex_t", centre: "Glasgow",
    group: "Minecraft Advanced", level: 14, totalXP: 4200, badgesEarned: 11, joinedDate: "2025-08-15",
    badges: makeBadges(11), modules: makeModules(14), recentActivity: makeActivity("Alex"),
  },
  {
    id: 6, name: "Ryan O'Brien", username: "ryan_ob", centre: "Glasgow",
    group: "Rocket League Juniors", level: 6, totalXP: 1200, badgesEarned: 2, joinedDate: "2025-12-01",
    badges: makeBadges(2), modules: makeModules(6), recentActivity: makeActivity("Ryan"),
  },
  {
    id: 7, name: "Megan Stewart", username: "megan_s", centre: "Glasgow",
    group: "Minecraft Advanced", level: 11, totalXP: 3100, badgesEarned: 9, joinedDate: "2025-09-20",
    badges: makeBadges(9), modules: makeModules(11), recentActivity: makeActivity("Megan"),
  },
  {
    id: 8, name: "Callum Doherty", username: "callum_d", centre: "Dublin",
    group: "Fortnite Squad", level: 8, totalXP: 1900, badgesEarned: 4, joinedDate: "2025-10-05",
    badges: makeBadges(4), modules: makeModules(8), recentActivity: makeActivity("Callum"),
  },
  {
    id: 9, name: "Niamh Walsh", username: "niamh_w", centre: "Dublin",
    group: "Fortnite Squad", level: 13, totalXP: 3850, badgesEarned: 10, joinedDate: "2025-08-28",
    badges: makeBadges(10), modules: makeModules(13), recentActivity: makeActivity("Niamh"),
  },
  {
    id: 10, name: "Liam Brennan", username: "liam_b", centre: "Dublin",
    group: "Minecraft Juniors", level: 5, totalXP: 900, badgesEarned: 2, joinedDate: "2026-01-10",
    badges: makeBadges(2), modules: makeModules(5), recentActivity: makeActivity("Liam"),
  },
  {
    id: 11, name: "Erin Campbell", username: "erin_c", centre: "Wishaw",
    group: "Rocket League Competitive", level: 16, totalXP: 5100, badgesEarned: 14, joinedDate: "2025-07-01",
    badges: makeBadges(14), modules: makeModules(16), recentActivity: makeActivity("Erin"),
  },
  {
    id: 12, name: "Fraser Murray", username: "fraser_m", centre: "Glasgow",
    group: "Rocket League Juniors", level: 4, totalXP: 650, badgesEarned: 1, joinedDate: "2026-02-17",
    badges: makeBadges(1), modules: makeModules(4), recentActivity: makeActivity("Fraser"),
  },
];

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type SortKey = "name" | "totalXP";
type SortDir = "asc" | "desc";

function sortUsers(users: User[], key: SortKey, dir: SortDir): User[] {
  return [...users].sort((a, b) => {
    let cmp = 0;
    if (key === "name") cmp = a.name.localeCompare(b.name);
    if (key === "totalXP") cmp = a.totalXP - b.totalXP;
    return dir === "asc" ? cmp : -cmp;
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [sortKey, setSortKey] = useState<SortKey>("totalXP");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [filterCentre, setFilterCentre] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ── Add User ──────────────────────────────────────────────────────────────
  async function handleAddUser(data: { username: string; password: string; name: string; centre: string; group: string }) {
    setAddError(null);
    try {
      const created = await createUser({
        username: data.username,
        password: data.password,
        name: data.name,
        gamertag: data.name,
        centre: data.centre,
        group: data.group,
      });
      
      // Add to local state with full User shape
      const newUser: User = {
        id: created.id,
        name: created.name,
        username: created.username,
        centre: created.centre || data.centre,
        group: created.group || data.group,
        level: created.level,
        totalXP: created.totalXP,
        badgesEarned: created.badgesEarned,
        joinedDate: new Date().toISOString().slice(0, 10),
        badges: makeBadges(0),
        modules: makeModules(1),
        recentActivity: [],
      };
      setUsers((prev) => [newUser, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  // ── Inline Edit ───────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editGroup, setEditGroup] = useState("");

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditUsername(user.username);
    setEditGroup(user.group);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id: number) {
    if (!editUsername.trim()) return;
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, username: editUsername.trim(), group: editGroup } : u),
    );
    setEditingId(null);
  }

  // ── Remove User ───────────────────────────────────────────────────────────
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  function handleRemove(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmRemoveId(null);
  }

  // ── View User Drawer ──────────────────────────────────────────────────────
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const viewUser = viewUserId != null ? users.find((u) => u.id === viewUserId) ?? null : null;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    const matchesCentre = !filterCentre || u.centre === filterCentre;
    const matchesGroup = !filterGroup || u.group === filterGroup;
    return matchesSearch && matchesCentre && matchesGroup;
  });

  const sorted = sortUsers(filtered, sortKey, sortDir);

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span className="au-sort-icon au-sort-icon--idle">⇅</span>;
    return (
      <span className="au-sort-icon au-sort-icon--active">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div className="sp-dashboard">
      {/* Page header */}
      <div className="sp-page-header au-page-header">
        <div>
          <h1 className="sp-page-title">👥 User Management</h1>
          <p className="sp-page-subtitle">
            {users.length} registered participants across all centres
          </p>
        </div>
        <button className="au-btn au-btn--primary" onClick={() => setShowAddModal(true)}>
          + Add User
        </button>
      </div>

      {/* Search & filters */}
      <div className="au-toolbar">
        <div className="au-toolbar__search">
          <span className="au-toolbar__search-icon">🔍</span>
          <input
            type="text"
            className="au-toolbar__search-input"
            placeholder="Search by name or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="au-toolbar__clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
          )}
        </div>
        <select
          className="au-toolbar__select"
          value={filterCentre}
          onChange={(e) => setFilterCentre(e.target.value)}
        >
          <option value="">All Centres</option>
          {CENTRES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="au-toolbar__select"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="">All Groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <span className="au-toolbar__count">{sorted.length} of {users.length} users</span>
      </div>

      {/* Table card */}
      <section className="sp-card au-table-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">All Users</h2>
        </div>

        <div className="au-table-wrapper">
          <table className="au-table">
            <thead>
              <tr>
                <th
                  className={`au-th au-th--sortable${sortKey === "name" ? " au-th--sorted" : ""}`}
                  onClick={() => handleSort("name")}
                >
                  Name {sortIndicator("name")}
                </th>
                <th className="au-th">Username</th>
                <th className="au-th">Centre</th>
                <th className="au-th">Group</th>
                <th className="au-th">Level</th>
                <th
                  className={`au-th au-th--sortable${sortKey === "totalXP" ? " au-th--sorted" : ""}`}
                  onClick={() => handleSort("totalXP")}
                >
                  Total XP {sortIndicator("totalXP")}
                </th>
                <th className="au-th">Badges Earned</th>
                <th className="au-th">Joined</th>
                <th className="au-th au-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td className="au-td au-td--empty" colSpan={9}>
                    No users match your search or filters.
                  </td>
                </tr>
              )}
              {sorted.map((user) => {
                const isEditing = editingId === user.id;
                const isConfirmingRemove = confirmRemoveId === user.id;
                return (
                  <tr key={user.id} className={`au-tr${isEditing ? " au-tr--editing" : ""}`}>
                    <td className="au-td au-td--name">
                      <button className="au-name-link" onClick={() => setViewUserId(user.id)}>{user.name}</button>
                    </td>
                    <td className="au-td au-td--username">
                      {isEditing ? (
                        <input
                          className="au-inline-input"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <>@{user.username}</>
                      )}
                    </td>
                    <td className="au-td">
                      <span className="au-badge au-badge--centre">{user.centre}</span>
                    </td>
                    <td className="au-td au-td--group">
                      {isEditing ? (
                        <select
                          className="au-inline-select"
                          value={editGroup}
                          onChange={(e) => setEditGroup(e.target.value)}
                        >
                          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      ) : (
                        user.group
                      )}
                    </td>
                    <td className="au-td">
                      <span className="au-level-chip">Lv.{user.level}</span>
                    </td>
                    <td className="au-td au-td--xp">
                      <span className="au-xp-value">{user.totalXP.toLocaleString()}</span>
                      <span className="au-xp-label"> XP</span>
                    </td>
                    <td className="au-td au-td--badges">
                      🏅 {user.badgesEarned}
                    </td>
                    <td className="au-td au-td--date">{formatDate(user.joinedDate)}</td>
                    <td className="au-td au-td--actions">
                      {isEditing ? (
                        <div className="au-action-group">
                          <button className="au-btn au-btn--small au-btn--primary" onClick={() => saveEdit(user.id)}>Save</button>
                          <button className="au-btn au-btn--small au-btn--ghost" onClick={cancelEdit}>Cancel</button>
                        </div>
                      ) : isConfirmingRemove ? (
                        <div className="au-action-group">
                          <span className="au-confirm-label">Remove?</span>
                          <button className="au-btn au-btn--small au-btn--danger" onClick={() => handleRemove(user.id)}>Yes</button>
                          <button className="au-btn au-btn--small au-btn--ghost" onClick={() => setConfirmRemoveId(null)}>No</button>
                        </div>
                      ) : (
                        <div className="au-action-group">
                          <button className="au-btn au-btn--small au-btn--ghost" onClick={() => setViewUserId(user.id)} title="View">👁️</button>
                          <button className="au-btn au-btn--small au-btn--ghost" onClick={() => startEdit(user)} title="Edit">✏️</button>
                          <button className="au-btn au-btn--small au-btn--ghost au-btn--danger-text" onClick={() => setConfirmRemoveId(user.id)} title="Remove">🗑️</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add User modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => { setShowAddModal(false); setAddError(null); }}
          onSave={handleAddUser}
          serverError={addError}
        />
      )}

      {/* View User drawer */}
      {viewUser && (
        <ViewUserDrawer user={viewUser} onClose={() => setViewUserId(null)} />
      )}
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

function AddUserModal({
  onClose,
  onSave,
  serverError,
}: {
  onClose: () => void;
  onSave: (data: { username: string; password: string; name: string; centre: string; group: string }) => void;
  serverError: string | null;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [centre, setCentre] = useState(CENTRES[0]);
  const [group, setGroup] = useState(GROUPS[0]);
  const [errors, setErrors] = useState<{ username?: string; password?: string; name?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = "Username is required.";
    else if (username.trim().length < 3) errs.username = "At least 3 characters.";
    if (!password.trim()) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "At least 6 characters.";
    if (!name.trim()) errs.name = "Display name is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ username: username.trim(), password, name: name.trim(), centre, group });
  }

  return (
    <div className="au-modal-backdrop" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <h2 className="au-modal__title">👤 Add New User</h2>
          <button className="au-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="au-modal__form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="au-modal__server-error" style={{ color: "#ef4444", marginBottom: "1rem", padding: "0.5rem", background: "#fef2f2", borderRadius: "0.375rem" }}>
              {serverError}
            </div>
          )}
          
          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="add-username">Username</label>
            <input
              id="add-username"
              className={`au-modal__input${errors.username ? " au-modal__input--error" : ""}`}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
              placeholder="e.g. jamie_r"
              autoFocus
            />
            {errors.username && <span className="au-modal__error">{errors.username}</span>}
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="add-password">Password</label>
            <input
              id="add-password"
              type="password"
              className={`au-modal__input${errors.password ? " au-modal__input--error" : ""}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="Minimum 6 characters"
            />
            {errors.password && <span className="au-modal__error">{errors.password}</span>}
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="add-name">Display Name</label>
            <input
              id="add-name"
              className={`au-modal__input${errors.name ? " au-modal__input--error" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Jamie Robertson"
            />
            {errors.name && <span className="au-modal__error">{errors.name}</span>}
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="add-centre">Centre</label>
            <select
              id="add-centre"
              className="au-modal__select"
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
            >
              {CENTRES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="au-modal__field">
            <label className="au-modal__label" htmlFor="add-group">Group</label>
            <select
              id="add-group"
              className="au-modal__select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="au-modal__actions">
            <button type="button" className="au-btn au-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="au-btn au-btn--primary">Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View User Drawer ─────────────────────────────────────────────────────────

function ViewUserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="au-drawer-backdrop" onClick={onClose}>
      <aside className="au-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="au-drawer__header">
          <h2 className="au-drawer__title">👤 {user.name}</h2>
          <button className="au-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* User summary */}
        <div className="au-drawer__section">
          <div className="au-drawer__info-grid">
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Username</span>
              <span className="au-drawer__info-value">@{user.username}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Centre</span>
              <span className="au-drawer__info-value">{user.centre}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Group</span>
              <span className="au-drawer__info-value">{user.group}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Level</span>
              <span className="au-drawer__info-value">Lv.{user.level}</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Total XP</span>
              <span className="au-drawer__info-value au-drawer__info-value--xp">{user.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="au-drawer__info-item">
              <span className="au-drawer__info-label">Joined</span>
              <span className="au-drawer__info-value">{formatDate(user.joinedDate)}</span>
            </div>
          </div>
        </div>

        {/* Badge progress */}
        <div className="au-drawer__section">
          <h3 className="au-drawer__section-title">🏅 Badge Progress</h3>
          <div className="au-drawer__badge-list">
            {user.badges.map((b) => (
              <div key={b.name} className="au-drawer__badge-row">
                <span className="au-drawer__badge-icon">{b.icon}</span>
                <div className="au-drawer__badge-info">
                  <span className="au-drawer__badge-name">{b.name}</span>
                  <div className="au-drawer__badge-bar-track">
                    <div
                      className="au-drawer__badge-bar-fill"
                      style={{ width: `${b.total > 0 ? (b.earned / b.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="au-drawer__badge-count">{b.earned}/{b.total}</span>
                <span className="au-drawer__badge-level">{b.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module progress */}
        <div className="au-drawer__section">
          <h3 className="au-drawer__section-title">📦 Modules</h3>
          <div className="au-drawer__module-list">
            {user.modules.map((m) => {
              const pct = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
              return (
                <div key={m.name} className="au-drawer__module-row">
                  <span className="au-drawer__module-icon">{m.icon}</span>
                  <div className="au-drawer__module-info">
                    <span className="au-drawer__module-name">{m.name}</span>
                    <div className="au-drawer__badge-bar-track">
                      <div className="au-drawer__badge-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="au-drawer__badge-count">{m.completed}/{m.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="au-drawer__section">
          <h3 className="au-drawer__section-title">⚡ Recent Activity</h3>
          {user.recentActivity.length === 0 ? (
            <p className="au-drawer__empty">No activity recorded yet.</p>
          ) : (
            <ul className="au-drawer__activity-list">
              {user.recentActivity.map((a, i) => (
                <li key={i} className="au-drawer__activity-item">
                  <span className="au-drawer__activity-icon">{a.icon}</span>
                  <div className="au-drawer__activity-info">
                    <span className="au-drawer__activity-action">{a.action}</span>
                    <span className="au-drawer__activity-meta">
                      <span className="au-drawer__activity-xp">+{a.xp} XP</span>
                      <span className="au-drawer__activity-date">{formatDate(a.date)}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
