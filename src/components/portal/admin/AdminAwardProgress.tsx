import { useState, useEffect } from "react";
import type {
  AdminGroupDto,
  AdminGroupAwardViewDto,
  AdminAwardModuleDto,
  AdminGroupMemberAwardDto,
  AwardEntryDto,
  AdminUserSearchResultDto,
  AdminUserAwardStateDto,
  AdminSubBadgeDto,
} from "../../../api/types";
import {
  getAdminGroups,
  getAdminGroupAwardView,
  bulkAwardSubBadges,
  revokeSubBadgeAward,
  searchAdminUsers,
  getAdminUserAwardState,
  getAdminModules,
} from "../../../api/mockApi";
import type { AdminModuleDto } from "../../../api/types";
import "../../../portal.css";

type Tab = "group" | "individual";

export default function AdminAwardProgress() {
  // ── Shared state ─────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<AdminGroupDto[]>([]);
  const [allModules, setAllModules] = useState<AdminModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("group");
  const [toast, setToast] = useState<string | null>(null);

  // ── Group-award state ────────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [groupView, setGroupView] = useState<AdminGroupAwardViewDto | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  /** Set of "studentId:subBadgeId" keys for newly-ticked checkboxes */
  const [pendingAwards, setPendingAwards] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<{ studentId: number; subBadgeId: number; studentName: string; badgeName: string } | null>(null);

  // ── Individual-award state ───────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<AdminUserSearchResultDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserSearchResultDto | null>(null);
  const [userAwardState, setUserAwardState] = useState<AdminUserAwardStateDto | null>(null);
  const [indModuleId, setIndModuleId] = useState<number | 0>(0);
  const [indPending, setIndPending] = useState<Set<number>>(new Set());
  const [indAwarding, setIndAwarding] = useState(false);

  // ── Initial data fetch (groups + modules list) ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminGroups(), getAdminModules()])
      .then(([g, m]) => {
        if (!cancelled) { setGroups(g); setAllModules(m); }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Fetch group award view when group selection changes ──────────────────
  useEffect(() => {
    if (!selectedGroupId) { setGroupView(null); return; }
    let cancelled = false;
    setGroupLoading(true);
    setPendingAwards(new Set());
    getAdminGroupAwardView(selectedGroupId)
      .then((data) => { if (!cancelled) setGroupView(data); })
      .catch((err) => { if (!cancelled) setError(err.message ?? "Failed to load group"); })
      .finally(() => { if (!cancelled) setGroupLoading(false); });
    return () => { cancelled = true; };
  }, [selectedGroupId]);

  // ── User search debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userSearch.trim()) { setUserResults([]); return; }
    const timeout = setTimeout(() => {
      searchAdminUsers(userSearch).then(setUserResults);
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  // ── Fetch individual user award state ────────────────────────────────────
  useEffect(() => {
    if (!selectedUser) { setUserAwardState(null); setIndModuleId(0); setIndPending(new Set()); return; }
    let cancelled = false;
    getAdminUserAwardState(selectedUser.studentId)
      .then((data) => { if (!cancelled) setUserAwardState(data); })
      .catch(() => { if (!cancelled) setUserAwardState(null); });
    return () => { cancelled = true; };
  }, [selectedUser]);

  // ── Toast auto-dismiss ───────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function togglePending(studentId: number, subBadgeId: number) {
    const key = `${studentId}:${subBadgeId}`;
    setPendingAwards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function parsePendingAwards(): AwardEntryDto[] {
    return Array.from(pendingAwards).map((key) => {
      const [sid, sbid] = key.split(":");
      return { studentId: Number(sid), subBadgeId: Number(sbid) };
    });
  }

  function pendingXpTotal(): number {
    if (!groupView) return 0;
    const allSubs = groupView.modules.flatMap((m) => m.subBadges);
    return parsePendingAwards().reduce((sum, a) => {
      const sub = allSubs.find((s) => s.id === a.subBadgeId);
      return sum + (sub?.xpValue ?? 0);
    }, 0);
  }

  async function handleBulkAward() {
    setAwarding(true);
    try {
      const awards = parsePendingAwards();
      await bulkAwardSubBadges(awards);
      // Refresh group view
      const refreshed = await getAdminGroupAwardView(selectedGroupId);
      setGroupView(refreshed);
      setPendingAwards(new Set());
      setShowConfirmModal(false);
      setToast(`Awarded ${awards.length} sub-badge(s) successfully`);
    } catch (err: any) {
      setToast(err.message ?? "Award failed");
    } finally {
      setAwarding(false);
    }
  }

  async function handleRevoke(studentId: number, subBadgeId: number) {
    try {
      await revokeSubBadgeAward(studentId, subBadgeId);
      // Refresh group view if on group tab
      if (groupView && selectedGroupId) {
        const refreshed = await getAdminGroupAwardView(selectedGroupId);
        setGroupView(refreshed);
      }
      // Refresh individual view if on individual tab
      if (selectedUser && selectedUser.studentId === studentId) {
        const refreshed = await getAdminUserAwardState(studentId);
        setUserAwardState(refreshed);
      }
      setShowRevokeConfirm(null);
      setToast("Sub-badge revoked successfully");
    } catch (err: any) {
      setToast(err.message ?? "Revoke failed");
    }
  }

  async function handleIndividualAward() {
    if (!selectedUser || indPending.size === 0) return;
    setIndAwarding(true);
    try {
      const awards: AwardEntryDto[] = Array.from(indPending).map((subBadgeId) => ({
        studentId: selectedUser.studentId,
        subBadgeId,
      }));
      await bulkAwardSubBadges(awards);
      const refreshed = await getAdminUserAwardState(selectedUser.studentId);
      setUserAwardState(refreshed);
      setIndPending(new Set());
      setToast(`Awarded ${awards.length} sub-badge(s) to ${selectedUser.gamertag}`);
    } catch (err: any) {
      setToast(err.message ?? "Award failed");
    } finally {
      setIndAwarding(false);
    }
  }

  // ── Loading / error early returns ──────────────────────────────────────
  if (loading) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header">
          <h1 className="sp-page-title">Award Progress</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp-dashboard">
        <div className="sp-page-header">
          <h1 className="sp-page-title">Award Progress</h1>
        </div>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  // ── Derived data for group tab ───────────────────────────────────────────
  const allSubBadges: AdminSubBadgeDto[] = groupView?.modules.flatMap((m) => m.subBadges) ?? [];

  // ── Derived data for individual tab ──────────────────────────────────────
  const indModule = indModuleId ? allModules.find((m) => m.id === indModuleId) : null;

  return (
    <div className="sp-dashboard">
      {/* Toast */}
      {toast && <div className="aw-toast">{toast}</div>}

      {/* Page header */}
      <div className="sp-page-header">
        <h1 className="sp-page-title">Award Progress</h1>
        <p className="sp-page-subtitle">Award and manage sub-badges for students</p>
      </div>

      {/* Tab bar */}
      <div className="aw-tabs">
        <button className={`aw-tab ${activeTab === "group" ? "aw-tab--active" : ""}`} onClick={() => setActiveTab("group")}>
          🏫 Group Award
        </button>
        <button className={`aw-tab ${activeTab === "individual" ? "aw-tab--active" : ""}`} onClick={() => setActiveTab("individual")}>
          👤 Individual Award
        </button>
      </div>

      {/* ─── GROUP TAB ─────────────────────────────────────────────────── */}
      {activeTab === "group" && (
        <div className="aw-section">
          {/* Group selector */}
          <div className="aw-group-selector">
            <label htmlFor="aw-group-select" className="aw-label">Select Group</label>
            <select
              id="aw-group-select"
              className="aw-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">— Choose a group —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.hub} ({g.memberCount} members)
                </option>
              ))}
            </select>
          </div>

          {/* Group loading */}
          {groupLoading && (
            <p style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>Loading group data…</p>
          )}

          {/* No group selected */}
          {!selectedGroupId && !groupLoading && (
            <p style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
              Select a group above to view and award sub-badges.
            </p>
          )}

          {/* Group award table */}
          {groupView && !groupLoading && (
            <div className="aw-table-wrap">
              <div className="aw-table-header">
                <h2 className="aw-table-title">{groupView.group.name}</h2>
                <span className="aw-table-meta">
                  {groupView.members.length} members · {allSubBadges.length} sub-badges across {groupView.modules.length} module(s)
                </span>
              </div>

              <div className="aw-table-scroll">
                <table className="aw-award-table">
                  <thead>
                    <tr>
                      <th className="aw-th-sticky">Student</th>
                      {groupView.modules.map((mod) =>
                        mod.subBadges.map((sb) => (
                          <th key={sb.id} className="aw-th-badge" title={`${mod.name} — ${sb.description}`}>
                            <span className="aw-th-badge-name">{sb.name}</span>
                            <span className="aw-th-badge-xp">+{sb.xpValue} XP</span>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {groupView.members.map((member) => (
                      <tr key={member.studentId}>
                        <td className="aw-td-student">
                          <div className="aw-student-info">
                            <span className="aw-student-name">{member.gamertag}</span>
                            <span className="aw-student-meta">Lv.{member.level} · {member.realName}</span>
                          </div>
                        </td>
                        {allSubBadges.map((sb) => {
                          const isAwarded = member.awardedSubBadgeIds.includes(sb.id);
                          const isPending = pendingAwards.has(`${member.studentId}:${sb.id}`);
                          return (
                            <td key={sb.id} className="aw-td-check">
                              {isAwarded ? (
                                <button
                                  className="aw-awarded-btn"
                                  title={`Awarded ${member.awardedDates[sb.id] ?? ""} — click to revoke`}
                                  onClick={() => setShowRevokeConfirm({
                                    studentId: member.studentId,
                                    subBadgeId: sb.id,
                                    studentName: member.gamertag,
                                    badgeName: sb.name,
                                  })}
                                >
                                  ✅
                                </button>
                              ) : (
                                <input
                                  type="checkbox"
                                  className="aw-checkbox"
                                  checked={isPending}
                                  onChange={() => togglePending(member.studentId, sb.id)}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Award button */}
              {pendingAwards.size > 0 && (
                <div className="aw-bulk-bar">
                  <span className="aw-bulk-summary">
                    {pendingAwards.size} sub-badge(s) selected · {pendingXpTotal()} XP total
                  </span>
                  <button className="am-btn am-btn--primary" onClick={() => setShowConfirmModal(true)}>
                    Award Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── INDIVIDUAL TAB ────────────────────────────────────────────── */}
      {activeTab === "individual" && (
        <div className="aw-section">

          {/* Step 1 — User search */}
          <div className="aw-ind-row">
            <div className="aw-ind-col">
              <label className="aw-label">Search Student</label>
              <div className="aw-search-wrap">
                <input
                  type="text"
                  className="aw-search-input"
                  placeholder="Gamertag, name or username…"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); }}
                />
                {userSearch && !selectedUser && userResults.length > 0 && (
                  <ul className="aw-search-results">
                    {userResults.map((u) => (
                      <li
                        key={u.studentId}
                        className="aw-search-result"
                        onClick={() => { setSelectedUser(u); setUserSearch(u.gamertag); setUserResults([]); }}
                      >
                        <span className="aw-result-gamertag">{u.gamertag}</span>
                        <span className="aw-result-meta">{u.username} · Lv.{u.level} · {u.hub}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {userSearch && !selectedUser && userResults.length === 0 && (
                  <div className="aw-search-empty">No students found</div>
                )}
              </div>
            </div>

            {/* Step 2 — Module selector (only once a user is selected) */}
            {selectedUser && (
              <div className="aw-ind-col">
                <label className="aw-label">Select Module</label>
                <select
                  className="aw-select"
                  value={indModuleId}
                  onChange={(e) => { setIndModuleId(Number(e.target.value)); setIndPending(new Set()); }}
                >
                  <option value={0}>— Choose a module —</option>
                  {allModules.filter((m) => m.status === "Active").map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selected user card */}
          {selectedUser && userAwardState && (
            <div className="aw-user-card">
              <div className="aw-user-card-info">
                <span className="aw-user-gamertag">{selectedUser.gamertag}</span>
                <span className="aw-user-meta">{selectedUser.username} · Lv.{selectedUser.level} · {selectedUser.hub}</span>
              </div>
              <button className="aw-clear-btn" onClick={() => { setSelectedUser(null); setUserSearch(""); setUserAwardState(null); setIndModuleId(0); setIndPending(new Set()); }}>
                ✕ Clear
              </button>
            </div>
          )}

          {/* Step 3 — Sub-badge checklist */}
          {selectedUser && userAwardState && indModule && (
            <div className="aw-ind-checklist">
              <h3 className="aw-checklist-title">{indModule.name} — Sub-Badges</h3>
              <div className="aw-checklist-grid">
                {indModule.subBadges.map((sb) => {
                  const isAwarded = userAwardState.awardedSubBadgeIds.includes(sb.id);
                  const isPending = indPending.has(sb.id);
                  return (
                    <div key={sb.id} className={`aw-checklist-item ${isAwarded ? "aw-checklist-item--awarded" : ""}`}>
                      <div className="aw-checklist-badge-info">
                        <span className="aw-checklist-name">{sb.name}</span>
                        <span className="aw-checklist-desc">{sb.description}</span>
                        <span className="aw-checklist-xp">+{sb.xpValue} XP</span>
                      </div>
                      {isAwarded ? (
                        <button
                          className="aw-awarded-btn"
                          title={`Awarded ${userAwardState.awardedDates[sb.id] ?? ""} — click to revoke`}
                          onClick={() => setShowRevokeConfirm({
                            studentId: selectedUser.studentId,
                            subBadgeId: sb.id,
                            studentName: selectedUser.gamertag,
                            badgeName: sb.name,
                          })}
                        >
                          ✅ Awarded
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          className="aw-checkbox"
                          checked={isPending}
                          onChange={() => {
                            setIndPending((prev) => {
                              const next = new Set(prev);
                              if (next.has(sb.id)) next.delete(sb.id); else next.add(sb.id);
                              return next;
                            });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit */}
              <div className="aw-ind-submit">
                <span className="aw-bulk-summary">
                  {indPending.size} sub-badge(s) selected
                </span>
                <button
                  className="am-btn am-btn--primary"
                  disabled={indPending.size === 0 || indAwarding}
                  onClick={handleIndividualAward}
                >
                  {indAwarding ? "Awarding…" : "Award Selected"}
                </button>
              </div>
            </div>
          )}

          {/* Prompt to pick a module */}
          {selectedUser && userAwardState && !indModule && (
            <p style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
              Select a module above to see its sub-badges.
            </p>
          )}

          {/* Initial prompt */}
          {!selectedUser && (
            <p style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
              Search for a student above to award individual sub-badges.
            </p>
          )}
        </div>
      )}

      {/* ─── Revoke confirmation modal ─────────────────────────────────── */}
      {showRevokeConfirm && (
        <div className="am-modal-backdrop" onClick={() => setShowRevokeConfirm(null)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="am-modal-title">Revoke Sub-Badge</h2>
            <p style={{ margin: "1rem 0", color: "#cbd5e1" }}>
              Remove <strong>{showRevokeConfirm.badgeName}</strong> from <strong>{showRevokeConfirm.studentName}</strong>?
              This will deduct the associated XP.
            </p>
            <div className="am-modal-actions">
              <button className="am-btn am-btn--secondary" onClick={() => setShowRevokeConfirm(null)}>Cancel</button>
              <button className="am-btn am-btn--danger" onClick={() => handleRevoke(showRevokeConfirm.studentId, showRevokeConfirm.subBadgeId)}>
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bulk-award confirmation modal ─────────────────────────────── */}
      {showConfirmModal && (
        <div className="am-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="am-modal-title">Confirm Bulk Award</h2>
            <p style={{ margin: "1rem 0", color: "#cbd5e1" }}>
              Award <strong>{pendingAwards.size}</strong> sub-badge(s) for a total of <strong>{pendingXpTotal()} XP</strong>?
            </p>
            <div style={{ maxHeight: 200, overflowY: "auto", margin: "1rem 0" }}>
              <table className="aw-confirm-table">
                <thead>
                  <tr><th>Student</th><th>Sub-Badge</th><th>XP</th></tr>
                </thead>
                <tbody>
                  {parsePendingAwards().map((a) => {
                    const member = groupView?.members.find((m) => m.studentId === a.studentId);
                    const sub = allSubBadges.find((s) => s.id === a.subBadgeId);
                    return (
                      <tr key={`${a.studentId}:${a.subBadgeId}`}>
                        <td>{member?.gamertag ?? "?"}</td>
                        <td>{sub?.name ?? "?"}</td>
                        <td>+{sub?.xpValue ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="am-modal-actions">
              <button className="am-btn am-btn--secondary" onClick={() => setShowConfirmModal(false)} disabled={awarding}>Cancel</button>
              <button className="am-btn am-btn--primary" onClick={handleBulkAward} disabled={awarding}>
                {awarding ? "Awarding…" : "Confirm Award"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
