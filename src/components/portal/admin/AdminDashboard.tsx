import { useNavigate } from "react-router-dom";
import "../../../portal.css";
import { useAdminRecentActivities } from "../../../hooks/useAdminRecentActivities";
import type { AdminActivityType } from "../../../api/types";

const STATS = [
  { icon: "👥", label: "Total Users", value: "84", sub: "+6 this week" },
  { icon: "🎯", label: "Active Groups", value: "9", sub: "Across 3 centres" },
  { icon: "📚", label: "Modules In Progress", value: "12", sub: "5 games covered" },
  { icon: "🏅", label: "Badges Awarded", value: "37", sub: "This week" },
];

const QUICK_ACTIONS = [
  { icon: "👤", label: "Add User", sub: "Create a new student account", route: "/admin/users" },
  { icon: "🏅", label: "Award Badge", sub: "Award a sub-badge to a student", route: "/admin/users" },
  { icon: "📚", label: "Create Module", sub: "Build a new learning module", route: "/admin/modules" },
  { icon: "🎯", label: "Add Group", sub: "Create a new group or centre", route: "/admin/groups" },
];

const activityTypeClass: Record<AdminActivityType, string> = {
  badge: "sp-activity-item--badge",
  module: "sp-activity-item--workshop",
  user: "sp-activity-item--played",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: activities, loading, error } = useAdminRecentActivities();

  return (
    <div className="sp-dashboard">
      {/* Welcome hero */}
      <div className="sp-dashboard__hero-card ap-hero-card">
        <div className="sp-dashboard__hero-left">
          <div className="ap-hero-card__shield">🛡️</div>
          <div>
            <h1 className="sp-dashboard__hero-name">Admin Dashboard</h1>
            <p className="sp-dashboard__hero-username">WYMCA Esports Academy</p>
            <div className="sp-dashboard__hero-stats">
              <div className="sp-stat-chip">🏫 3 Centres</div>
              <div className="sp-stat-chip">🎮 9 Active Groups</div>
              <div className="sp-stat-chip">🌱 5 Pilot Sites</div>
            </div>
          </div>
        </div>
        <div className="sp-dashboard__hero-right">
          <div className="ap-admin-badge">
            <span className="ap-admin-badge__icon">🛡️</span>
            <span className="ap-admin-badge__label">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Platform stats row */}
      <div className="sp-stats-row">
        {STATS.map((s) => (
          <div key={s.label} className="sp-stat-card">
            <span className="sp-stat-card__icon">{s.icon}</span>
            <div className="sp-stat-card__body">
              <span className="sp-stat-card__label">{s.label}</span>
              <span className="sp-stat-card__value">{s.value}</span>
            </div>
            <span className="ap-stat-card__sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Two-column: activity + quick actions */}
      <div className="sp-dashboard__grid">
        {/* Recent activity feed */}
        <section className="sp-card">
          <div className="sp-card__header">
            <h2 className="sp-card__title">⚡ Recent Activity</h2>
            <a href="/admin/activity" className="sp-card__see-all" onClick={(e) => { e.preventDefault(); navigate("/admin/activity"); }}>
              See all →
            </a>
          </div>
          <ul className="sp-activity-list">
            {loading && (
              <li className="sp-activity-item">
                <span className="sp-activity-item__icon">⏳</span>
                <div className="sp-activity-item__info">
                  <span className="sp-activity-item__action">Loading recent activity…</span>
                </div>
              </li>
            )}
            {error && (
              <li className="sp-activity-item">
                <span className="sp-activity-item__icon">⚠️</span>
                <div className="sp-activity-item__info">
                  <span className="sp-activity-item__action">{error}</span>
                </div>
              </li>
            )}
            {!loading && !error && activities.length === 0 && (
              <li className="sp-activity-item">
                <span className="sp-activity-item__icon">📭</span>
                <div className="sp-activity-item__info">
                  <span className="sp-activity-item__action">No recent activity yet.</span>
                </div>
              </li>
            )}
            {!loading && !error && activities.map((a) => (
              <li
                key={a.id}
                className={`sp-activity-item ${activityTypeClass[a.type]}`}
              >
                <span className="sp-activity-item__icon">{a.icon}</span>
                <div className="sp-activity-item__info">
                  <span className="sp-activity-item__action">
                    <strong>{a.action}</strong>
                  </span>
                  <span className="sp-activity-item__time">
                    {a.admin} · {a.centre} · {a.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="sp-card">
          <div className="sp-card__header">
            <h2 className="sp-card__title">🚀 Quick Actions</h2>
          </div>
          <div className="ap-quickactions-grid">
            {QUICK_ACTIONS.map((q) => (
              <button
                key={q.label}
                className="sp-quicklink-card ap-quicklink-card"
                onClick={() => navigate(q.route)}
              >
                <span className="sp-quicklink-card__icon">{q.icon}</span>
                <span className="sp-quicklink-card__label">{q.label}</span>
                <span className="sp-quicklink-card__sub">{q.sub}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
