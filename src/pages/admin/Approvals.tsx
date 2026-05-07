/**
 * Approvals.tsx – Admin Approvals Queue
 *
 * Features:
 *   - Pending activities (XP awards) requiring approval
 *   - Pending admin/superadmin user accounts
 *   - Pending modules for cross-centre use (superadmin only)
 *   - Approve/reject actions with optional reason
 */

import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Zap,
  MessageSquare,
  X,
  Filter,
  ChevronDown,
  Image,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { Activity, User as UserType, Module } from '../../types';

type Tab = 'activities' | 'users' | 'modules';
type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

export default function Approvals() {
  const { currentUser, isSuperAdmin } = useAuth();
  const { state, dispatch } = useData();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('activities');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [showFilters, setShowFilters] = useState(false);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<{ type: 'activity'; item: Activity } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Request evidence modal
  const [showRequestEvidenceModal, setShowRequestEvidenceModal] = useState(false);
  const [requestEvidenceActivity, setRequestEvidenceActivity] = useState<Activity | null>(null);
  const [requestEvidenceMessage, setRequestEvidenceMessage] = useState('');

  // Evidence lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const centreId = currentUser?.centreId ?? '';
  const adminId = currentUser?.id ?? '';

  // Filter activities by centre (admins) or all (superadmins)
  const filteredActivities = useMemo(() => {
    let activities = state.activities;

    if (!isSuperAdmin) {
      activities = activities.filter((a) => a.centreId === centreId);
    }

    if (filterStatus !== 'all') {
      activities = activities.filter((a) => a.status === filterStatus);
    }

    return activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.activities, centreId, isSuperAdmin, filterStatus]);

  // Pending admin users (awaiting approval)
  const pendingUsers = useMemo(() => {
    let users = state.users.filter(
      (u) => (u.role === 'admin' || u.role === 'superadmin') && !u.isApproved
    );

    if (!isSuperAdmin) {
      users = users.filter((u) => u.centreId === centreId);
    }

    return users.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.users, centreId, isSuperAdmin]);

  // Pending modules (superadmin only - modules awaiting cross-centre approval)
  const pendingModules = useMemo(() => {
    if (!isSuperAdmin) return [];
    return state.modules
      .filter((m) => !m.isApproved && m.centreId !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.modules, isSuperAdmin]);

  // Get counts for tabs
  const pendingActivityCount = state.activities.filter(
    (a) => a.status === 'pending' && (isSuperAdmin || a.centreId === centreId)
  ).length;

  const pendingUserCount = pendingUsers.length;
  const pendingModuleCount = pendingModules.length;

  // Get user display name
  const getUserName = (userId: string): string => {
    return state.users.find((u) => u.id === userId)?.displayName ?? 'Unknown User';
  };

  // Get centre name
  const getCentreName = (cId: string): string => {
    return state.centres.find((c) => c.id === cId)?.name ?? 'Unknown Centre';
  };

  // Format date
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Approve activity
  const handleApproveActivity = (activity: Activity) => {
    dispatch({
      type: 'APPROVE_ACTIVITY',
      payload: { id: activity.id, adminId },
    });
  };

  // Open reject modal
  const handleOpenReject = (activity: Activity) => {
    setRejectingItem({ type: 'activity', item: activity });
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirm rejection
  const handleConfirmReject = () => {
    if (!rejectingItem) return;

    if (rejectingItem.type === 'activity') {
      dispatch({
        type: 'REJECT_ACTIVITY',
        payload: {
          id: rejectingItem.item.id,
          adminId,
          reason: rejectReason.trim() || 'No reason provided',
        },
      });
    }

    setShowRejectModal(false);
    setRejectingItem(null);
    setRejectReason('');
  };

  // Approve user (update isApproved to true)
  const handleApproveUser = (user: UserType) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { ...user, isApproved: true },
    });
  };

  // Reject user (deactivate instead of delete)
  const handleRejectUser = (user: UserType) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { ...user, isApproved: false, isActive: false },
    });
  };

  // Approve module
  const handleApproveModule = (mod: Module) => {
    dispatch({
      type: 'UPDATE_MODULE',
      payload: { ...mod, isApproved: true, updatedAt: new Date().toISOString() },
    });
  };

  // Reject module (keep as not approved)
  const handleRejectModule = (mod: Module) => {
    dispatch({
      type: 'UPDATE_MODULE',
      payload: { ...mod, isApproved: false, status: 'draft', updatedAt: new Date().toISOString() },
    });
  };

  // Open request evidence modal
  const handleOpenRequestEvidence = (activity: Activity) => {
    setRequestEvidenceActivity(activity);
    setRequestEvidenceMessage('');
    setShowRequestEvidenceModal(true);
  };

  // Confirm request evidence
  const handleConfirmRequestEvidence = () => {
    if (!requestEvidenceActivity) return;
    dispatch({
      type: 'REQUEST_EVIDENCE',
      payload: {
        id: requestEvidenceActivity.id,
        adminId,
        message: requestEvidenceMessage.trim() || undefined,
      },
    });
    setShowRequestEvidenceModal(false);
    setRequestEvidenceActivity(null);
    setRequestEvidenceMessage('');
  };

  return (
    <AdminShell title="Approvals">
      <div className="admin-approvals animate-fade-in">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'activities' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <ClipboardCheck size={16} />
            Activities
            {pendingActivityCount > 0 && (
              <span className="admin-tab__badge">{pendingActivityCount}</span>
            )}
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <User size={16} />
            Admin Users
            {pendingUserCount > 0 && (
              <span className="admin-tab__badge">{pendingUserCount}</span>
            )}
          </button>
          {isSuperAdmin && (
            <button
              className={`admin-tab ${activeTab === 'modules' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('modules')}
            >
              <BookOpen size={16} />
              Modules
              {pendingModuleCount > 0 && (
                <span className="admin-tab__badge">{pendingModuleCount}</span>
              )}
            </button>
          )}
        </div>

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="admin-approvals__section">
            {/* Filters */}
            <div className="admin-approvals__header">
              <h2 className="admin-section-title">
                <Zap size={18} />
                XP Activity Approvals
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filter
                <ChevronDown size={14} />
              </button>
            </div>

            {showFilters && (
              <div className="admin-approvals__filters animate-fade-in-down">
                <div className="admin-approvals__filter-group">
                  <label className="label" htmlFor="filter-activity-status">Status</label>
                  <select
                    id="filter-activity-status"
                    className="select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            )}

            {/* Activities List */}
            <div className="admin-approvals__list">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="admin-approval-card">
                    <div
                      className={`admin-approval-card__status admin-approval-card__status--${activity.status}`}
                    >
                      {activity.status === 'pending' && <Clock size={16} />}
                      {activity.status === 'approved' && <CheckCircle size={16} />}
                      {activity.status === 'rejected' && <XCircle size={16} />}
                    </div>

                    <div className="admin-approval-card__info">
                      <h3 className="admin-approval-card__title">
                        {activity.type}: {activity.description}
                      </h3>
                      <div className="admin-approval-card__meta">
                        <span className="admin-approval-card__user">
                          <User size={12} />
                          {getUserName(activity.userId)}
                        </span>
                        <span className="admin-approval-card__xp">
                          <Zap size={12} />
                          {activity.xpAwarded} XP • {activity.badgeCategory}
                        </span>
                        <span className="admin-approval-card__date">
                          <Clock size={12} />
                          {formatDate(activity.createdAt)}
                        </span>
                        {isSuperAdmin && (
                          <span className="admin-approval-card__centre">
                            {getCentreName(activity.centreId)}
                          </span>
                        )}
                      </div>
                      {activity.status === 'rejected' && activity.rejectionReason && (
                        <div className="admin-approval-card__reason">
                          <MessageSquare size={12} />
                          {activity.rejectionReason}
                        </div>
                      )}

                      {/* Evidence requested notice */}
                      {activity.evidenceRequested && !activity.evidenceUrl && (
                        <div className="admin-approval-card__evidence-requested">
                          <AlertCircle size={12} />
                          Evidence requested
                          {activity.evidenceRequestedAt && (
                            <span className="admin-approval-card__evidence-requested-date">
                              • {formatDate(activity.evidenceRequestedAt)}
                            </span>
                          )}
                          {activity.evidenceRequestMessage && (
                            <span className="admin-approval-card__evidence-requested-msg">
                              : "{activity.evidenceRequestMessage}"
                            </span>
                          )}
                        </div>
                      )}

                      {/* Evidence attachment */}
                      {activity.evidenceUrl && (
                        <div className="admin-approval-card__evidence">
                          <span className="admin-approval-card__evidence-label">
                            {activity.evidenceUrl.startsWith('data:image/') ? (
                              <Image size={12} />
                            ) : (
                              <FileText size={12} />
                            )}
                            Evidence attached
                          </span>
                          {activity.evidenceUrl.startsWith('data:image/') ? (
                            <button
                              type="button"
                              className="admin-approval-card__evidence-thumb"
                              onClick={() => setLightboxUrl(activity.evidenceUrl!)}
                              aria-label="View evidence"
                            >
                              <img src={activity.evidenceUrl} alt="Evidence" />
                              <span className="admin-approval-card__evidence-view">
                                <Eye size={14} />
                                View
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => setLightboxUrl(activity.evidenceUrl!)}
                            >
                              <Eye size={12} />
                              View Document
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {activity.status === 'pending' && (
                      <div className="admin-approval-card__actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveActivity(activity)}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenReject(activity)}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                        {!activity.evidenceUrl && !activity.evidenceRequested && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOpenRequestEvidence(activity)}
                            title="Request evidence from user"
                          >
                            <AlertCircle size={14} />
                            Request Evidence
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <ClipboardCheck size={40} className="empty-state-icon" />
                  <p className="empty-state-title">No activities to show</p>
                  <p className="empty-state-description">
                    {filterStatus === 'pending'
                      ? 'All activities have been reviewed.'
                      : 'No activities match your filter.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-approvals__section">
            <h2 className="admin-section-title">
              <User size={18} />
              Pending Admin Accounts
            </h2>

            <div className="admin-approvals__list">
              {pendingUsers.length > 0 ? (
                pendingUsers.map((user) => (
                  <div key={user.id} className="admin-approval-card">
                    <div className="admin-approval-card__status admin-approval-card__status--pending">
                      <Clock size={16} />
                    </div>

                    <div className="admin-approval-card__info">
                      <h3 className="admin-approval-card__title">
                        {user.displayName}
                        <span className="admin-approval-card__role">{user.role}</span>
                      </h3>
                      <div className="admin-approval-card__meta">
                        <span className="admin-approval-card__user">
                          @{user.username}
                        </span>
                        <span className="admin-approval-card__date">
                          <Clock size={12} />
                          Registered {formatDate(user.createdAt)}
                        </span>
                        {isSuperAdmin && (
                          <span className="admin-approval-card__centre">
                            {getCentreName(user.centreId)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-approval-card__actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveUser(user)}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectUser(user)}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <User size={40} className="empty-state-icon" />
                  <p className="empty-state-title">No pending accounts</p>
                  <p className="empty-state-description">
                    All admin accounts have been reviewed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modules Tab (Superadmin only) */}
        {activeTab === 'modules' && isSuperAdmin && (
          <div className="admin-approvals__section">
            <h2 className="admin-section-title">
              <BookOpen size={18} />
              Modules Awaiting Cross-Centre Approval
            </h2>

            <div className="admin-approvals__list">
              {pendingModules.length > 0 ? (
                pendingModules.map((mod) => (
                  <div key={mod.id} className="admin-approval-card">
                    <div className="admin-approval-card__status admin-approval-card__status--pending">
                      <Clock size={16} />
                    </div>

                    <div className="admin-approval-card__info">
                      <h3 className="admin-approval-card__title">{mod.name}</h3>
                      <p className="admin-approval-card__desc">{mod.description}</p>
                      <div className="admin-approval-card__meta">
                        <span className="admin-approval-card__game">
                          {mod.game}
                        </span>
                        <span className="admin-approval-card__duration">
                          {mod.durationWeeks} weeks
                        </span>
                        <span className="admin-approval-card__date">
                          <Clock size={12} />
                          Created {formatDate(mod.createdAt)}
                        </span>
                        <span className="admin-approval-card__centre">
                          From: {getCentreName(mod.centreId ?? '')}
                        </span>
                      </div>
                    </div>

                    <div className="admin-approval-card__actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveModule(mod)}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectModule(mod)}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <BookOpen size={40} className="empty-state-icon" />
                  <p className="empty-state-title">No modules pending</p>
                  <p className="empty-state-description">
                    All modules have been reviewed for cross-centre use.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && rejectingItem && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Reject Activity</h2>
                <button
                  className="admin-modal__close"
                  onClick={() => setShowRejectModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal__body">
                <p className="admin-reject-preview">
                  Rejecting: <strong>{rejectingItem.item.description}</strong>
                </p>

                <div className="form-group">
                  <label className="label" htmlFor="reject-reason">
                    Reason for rejection (optional)
                  </label>
                  <textarea
                    id="reject-reason"
                    className="textarea"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for the rejection..."
                  />
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowRejectModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmReject}
                  >
                    <XCircle size={14} />
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Evidence Modal */}
        {showRequestEvidenceModal && requestEvidenceActivity && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Request Evidence</h2>
                <button
                  className="admin-modal__close"
                  onClick={() => setShowRequestEvidenceModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal__body">
                <p className="admin-reject-preview">
                  Requesting evidence for: <strong>{requestEvidenceActivity.description}</strong>
                </p>
                <p className="admin-modal__hint">
                  The user will see that evidence has been requested for this submission.
                </p>

                <div className="form-group">
                  <label className="label" htmlFor="evidence-request-message">
                    Message to user (optional)
                  </label>
                  <textarea
                    id="evidence-request-message"
                    className="textarea"
                    rows={3}
                    value={requestEvidenceMessage}
                    onChange={(e) => setRequestEvidenceMessage(e.target.value)}
                    placeholder="e.g., Please provide a screenshot or photo of your completed work..."
                  />
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowRequestEvidenceModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleConfirmRequestEvidence}
                  >
                    <AlertCircle size={14} />
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Lightbox */}
        {lightboxUrl && (
          <button
            type="button"
            className="evidence-lightbox"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close evidence viewer"
          >
            <div
              className="evidence-lightbox__content animate-scale-in"
              role="dialog"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === 'Escape') setLightboxUrl(null); }}
            >
              <button
                type="button"
                className="evidence-lightbox__close"
                onClick={() => setLightboxUrl(null)}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {lightboxUrl.startsWith('data:image/') ? (
                <img
                  src={lightboxUrl}
                  alt="Evidence full view"
                  className="evidence-lightbox__image"
                />
              ) : (
                <div className="evidence-lightbox__document">
                  <FileText size={48} />
                  <p>PDF Document</p>
                  <a
                    href={lightboxUrl}
                    download="evidence.pdf"
                    className="btn btn-primary btn-sm"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </button>
        )}
      </div>
    </AdminShell>
  );
}
