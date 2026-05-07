import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../portal.css";
import { useAdminRecentActivities } from "../../../hooks/useAdminRecentActivities";
import type { AdminActivityType } from "../../../api/types";

const activityTypeClass: Record<AdminActivityType, string> = {
  badge: "sp-activity-item--badge",
  module: "sp-activity-item--workshop",
  user: "sp-activity-item--played",
};

const FILTER_OPTIONS: { value: AdminActivityType | "all"; label: string; icon: string }[] = [
  { value: "all",    label: "All",     icon: "📋" },
  { value: "badge",  label: "Badges",  icon: "🏅" },
  { value: "module", label: "Modules", icon: "📚" },
  { value: "user",   label: "Users",   icon: "👤" },
];

export default function AdminActivity() {
  const navigate = useNavigate();
  const { data: activities, loading, error } = useAdminRecentActivities();
  const [filter, setFilter] = useState<AdminActivityType | "all">("all");

  const filtered = filter === "all"
    ? activities
    : activities.filter((a) => a.type === filter);

  return (
    <div className="sp-dashboard">
      {/* Page header */}
      <div className="sp-card__header" style={{ marginBottom: "1rem" }}>
        <h1 className="sp-card__title" style={{ fontSize: "1.5rem" }}>⚡ Activity Feed</h1>
        <button
          className="sp-lb-filter-btn"
          onClick={() => navigate("/admin")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={
              "sp-lb-filter-btn" +
              (filter === opt.value ? " sp-lb-filter-btn--active" : "")
            }
            onClick={() => setFilter(opt.value)}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <section className="sp-card">
        <div className="sp-card__header">
          <h2 className="sp-card__title">
            {filter === "all" ? "All Activity" : `${FILTER_OPTIONS.find((o) => o.value === filter)?.label} Activity`}
          </h2>
          <span className="sp-card__see-all" style={{ cursor: "default" }}>
            {!loading && !error && `${filtered.length} ${filtered.length === 1 ? "event" : "events"}`}
          </span>
        </div>

        <ul className="sp-activity-list">
          {loading && (
            <li className="sp-activity-item">
              <span className="sp-activity-item__icon">⏳</span>
              <div className="sp-activity-item__info">
                <span className="sp-activity-item__action">Loading activity feed…</span>
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
          {!loading && !error && filtered.length === 0 && (
            <li className="sp-activity-item">
              <span className="sp-activity-item__icon">📭</span>
              <div className="sp-activity-item__info">
                <span className="sp-activity-item__action">
                  {filter === "all"
                    ? "No activity recorded yet."
                    : `No ${FILTER_OPTIONS.find((o) => o.value === filter)?.label.toLowerCase()} activity found.`}
                </span>
              </div>
            </li>
          )}
          {!loading && !error && filtered.map((a) => (
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
    </div>
  );
}
