import { useState, useEffect } from "react";
import { API_BASE } from "../auth/authService";

interface Group {
  id: string;
  name: string;
  label: string;
  labelVariant: "competitive" | "academy" | "community" | "creative";
  members: number;
  maxMembers?: number | null;
  schedule?: string | null;
  description: string;
  icon: string;
  featured?: boolean;
  live?: boolean;
}

interface RecentActivity {
  type: string;
  text: string;
  time: string;
  variant: string;
}

function LabelBadge({
  label,
  variant,
}: Readonly<{ label: string; variant: Group["labelVariant"] }>) {
  return <span className={`mg-badge mg-badge--${variant}`}>{label}</span>;
}

function FeaturedGroupCard({
  group,
  onEdit,
}: Readonly<{ group: Group; onEdit: () => void }>) {
  return (
    <article className="mg-card mg-card--featured">
      <div className="mg-card-glow" />
      <div className="mg-card-featured-top">
        <div>
          <LabelBadge label={group.label} variant={group.labelVariant} />
          <h3 className="mg-card-title mg-card-title--lg">{group.name}</h3>
        </div>
        <div className="mg-card-featured-meta">
          <div className="mg-card-stat">
            <span className="mg-card-stat-label">Members</span>
            <span className="mg-card-stat-value">
              {group.members}
              {group.maxMembers ? ` / ${group.maxMembers}` : ""}
            </span>
          </div>
          <button
            className="mg-icon-btn"
            onClick={onEdit}
            aria-label="Edit group"
          >
            <span className="material-symbol">edit_note</span>
          </button>
        </div>
      </div>
      <div className="mg-card-featured-footer">
        {group.schedule && (
          <div className="mg-footer-tag">
            <span className="material-symbol mg-footer-icon">
              event_available
            </span>
            <span>{group.schedule}</span>
          </div>
        )}
        <div className="mg-footer-tag">
          <span className="material-symbol mg-footer-icon">stadium</span>
          <span>Tournament Ready</span>
        </div>
        {group.live && (
          <div className="mg-live-badge">
            <span className="mg-live-dot" />
            LIVE SCRIMS
          </div>
        )}
      </div>
    </article>
  );
}

function GroupCard({
  group,
  onEdit,
}: Readonly<{ group: Group; onEdit: () => void }>) {
  return (
    <article
      className={`mg-card mg-card--standard${
        group.live ? " mg-card--creative" : ""
      }`}
    >
      <div className="mg-card-top">
        <div className={`mg-card-icon mg-card-icon--${group.labelVariant}`}>
          <span className="material-symbol">{group.icon}</span>
        </div>
        <LabelBadge label={group.label} variant={group.labelVariant} />
      </div>
      <h4 className="mg-card-title">{group.name}</h4>
      <p className="mg-card-desc">{group.description}</p>
      {group.schedule && <p className="mg-card-schedule">{group.schedule}</p>}
      <div className="mg-card-footer">
        <span className="mg-card-members">
          {group.live && <span className="mg-live-dot mg-live-dot--sm" />}
          {group.members}
          {group.maxMembers ? ` / ${group.maxMembers}` : ""} Members
        </span>
        <button
          className="mg-action-btn"
          onClick={onEdit}
          aria-label={`Edit ${group.name}`}
        >
          <span className="material-symbol" style={{ fontSize: "1.1rem" }}>
            edit
          </span>
          Manage
        </button>
      </div>
    </article>
  );
}

function ManageGroups() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  /* Form field state */
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formMaxMembers, setFormMaxMembers] = useState('');
  const [formSchedule, setFormSchedule] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/manage/groups`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups || []);
        setRecentActivity(data.recentActivity || []);
      })
      .catch(() => {
        setGroups([]);
        setRecentActivity([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditingGroup(null);
    setFormName('');
    setFormCategory('');
    setFormMaxMembers('');
    setFormSchedule('');
    setFormDesc('');
    setShowCreateModal(true);
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormCategory(group.label);
    setFormMaxMembers(group.maxMembers ? String(group.maxMembers) : '');
    setFormSchedule(group.schedule ?? '');
    setFormDesc(group.description);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingGroup(null);
  };

  const featured = groups.find((g) => g.featured);
  const rest = groups.filter((g) => !g.featured);
  const totalMembers = groups.reduce((sum, g) => sum + (Number(g.members) || 0), 0);

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary, #aaa)', fontSize: '1.1rem' }}>Loading groups…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-icon-btn" aria-label="Open menu">
            <span className="material-symbol">menu</span>
          </button>
          <h1>WISHAW YMCA</h1>
        </div>
        <div className="admin-topbar-right">
          <nav className="admin-nav-desktop" aria-label="Admin sections">
            <a href="/admin">Dashboard</a>
            <a href="/challenges">Challenges</a>
            <a href="/stats">Stats</a>
            <a className="is-active" href="/groups">
              Groups
            </a>
          </nav>
          <button className="admin-icon-btn" aria-label="Search">
            <span className="material-symbol">search</span>
          </button>
          <div className="admin-avatar" aria-hidden="true">
            A
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="mg-main">
        {/* Ambient glow */}
        <div className="mg-glow mg-glow--tr" />
        <div className="mg-glow mg-glow--ml" />

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mg-page-header">
          <div>
            <span className="admin-kicker">Wishaw YMCA ESports</span>
            <h2 className="mg-page-title">
              Group
              <br />
              <span>Management</span>
            </h2>
            <p className="mg-page-subtitle">
              Orchestrating the next generation of digital athletes. Manage
              squads, categories, and rosters from one central hub.
            </p>
          </div>
          <button
            className="admin-primary-btn mg-create-btn"
            onClick={openCreate}
          >
            <span className="material-symbol">add_circle</span>
            Create New Group
          </button>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────────────── */}
        <div className="mg-stats-bar">
          <div className="mg-stat-chip">
            <span className="material-symbol mg-stat-icon">groups</span>
            <div>
              <span className="mg-stat-label">Total Groups</span>
              <span className="mg-stat-num">{groups.length}</span>
            </div>
          </div>
          <div className="mg-stat-chip">
            <span className="material-symbol mg-stat-icon">person</span>
            <div>
              <span className="mg-stat-label">Total Members</span>
              <span className="mg-stat-num">{totalMembers}+</span>
            </div>
          </div>
          <div className="mg-stat-chip">
            <span className="material-symbol mg-stat-icon">sensors</span>
            <div>
              <span className="mg-stat-label">Live Now</span>
              <span className="mg-stat-num mg-stat-num--live">2 Active</span>
            </div>
          </div>
          <div className="mg-stat-chip mg-stat-chip--trend">
            <span className="material-symbol mg-stat-icon">trending_up</span>
            <div>
              <span className="mg-stat-label">Growth</span>
              <span className="mg-stat-num">+12% this month</span>
            </div>
          </div>
        </div>

        {/* ── Content Grid ────────────────────────────────────────────── */}
        <div className="mg-content">
          {/* Left: groups */}
          <div className="mg-groups-col">
            {featured && (
              <FeaturedGroupCard group={featured} onEdit={() => openEdit(featured)} />
            )}

            <div className="mg-grid">
              {rest.map((g) => (
                <GroupCard key={g.id} group={g} onEdit={() => openEdit(g)} />
              ))}
            </div>
          </div>

          {/* Right: activity panel */}
          <aside className="mg-sidebar">
            <div className="mg-sidebar-enrollment">
              <div className="mg-sidebar-enroll-header">
                <span className="mg-stat-label">Total Enrollment</span>
                <span
                  className="material-symbol"
                  style={{ color: "var(--primary)", fontSize: "1.2rem" }}
                >
                  trending_up
                </span>
              </div>
              <div className="mg-sidebar-enroll-num">
                <span className="mg-enroll-big">{totalMembers}</span>
                <span className="mg-enroll-growth">+12% this month</span>
              </div>
            </div>

            <div className="mg-sidebar-activity">
              <h4 className="mg-sidebar-section-title">Recent Changes</h4>
              <ul className="mg-activity-list">
                {recentActivity.map((item) => (
                  <li key={item.text} className="mg-activity-item">
                    <span
                      className={`mg-activity-dot mg-activity-dot--${item.variant}`}
                    />
                    <div>
                      <p className="mg-activity-text">{item.text}</p>
                      <p className="mg-activity-time">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mg-sidebar-actions">
              <button className="mg-outline-btn">
                <span className="material-symbol" style={{ fontSize: "1rem" }}>
                  download
                </span>
                Export Roster
              </button>
              {/* <button className="mg-danger-btn">
                <span className="material-symbol" style={{ fontSize: "1rem" }}>
                  archive
                </span>
                Archive All Groups
              </button> */}
            </div>
          </aside>
        </div>
      </main>

      {/* ── Create Group Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="mg-modal-overlay"
            onClick={closeModal}
          />
          <dialog
            className="mg-modal"
            open
            aria-label={editingGroup ? 'Edit group' : 'Create new group'}
            onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          >
            <div className="mg-modal-header">
              <h3>{editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
              <button
                className="admin-icon-btn"
                onClick={closeModal}
              >
                <span className="material-symbol">close</span>
              </button>
            </div>
            <div className="admin-form-grid">
              <label>
                <span>Group Name</span>
                <input type="text" placeholder="e.g. Valorant Academy" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </label>
              <label>
                <span>Category</span>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  <option value="" disabled>
                    Select…
                  </option>
                  <option>Academy</option>
                  <option>Competitive</option>
                  <option>Community</option>
                  <option>Creative</option>
                  <option>Elite Academy</option>
                  <option>Tier 1 Competitive</option>
                </select>
              </label>
              <label>
                <span>Max Members</span>
                <input type="number" placeholder="e.g. 16" min={1} value={formMaxMembers} onChange={(e) => setFormMaxMembers(e.target.value)} />
              </label>
              <label>
                <span>Schedule</span>
                <input type="text" placeholder="e.g. Mon / Wed" value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Description</span>
                <input
                  type="text"
                  placeholder="Short description of the group…"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </label>
            </div>
            <div className="mg-modal-footer">
              <button
                className="mg-outline-btn"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="admin-primary-btn"
                onClick={closeModal}
              >
                {editingGroup ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </dialog>
        </>
      )}

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────── */}
      <nav className="admin-bottom-nav" aria-label="Mobile navigation">
        <a href="/admin">
          <span className="material-symbol">dashboard</span>
          Overview
        </a>
        <a href="/groups" className="is-active">
          <span className="material-symbol">group</span>
          Groups
        </a>
        <a href="/challenges">
          <span className="material-symbol">emoji_events</span>
          Challenges
        </a>
        <a href="/leaderboard">
          <span className="material-symbol">leaderboard</span>
          Boards
        </a>
      </nav>
    </div>
  );
}

export default ManageGroups;
