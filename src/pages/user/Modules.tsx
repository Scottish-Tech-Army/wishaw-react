/**
 * Modules.tsx – User Modules Page
 *
 * Displays:
 *   - Enrolled modules with progress
 *   - Available modules to enrol in
 *   - Sub-badge checklist per module
 *   - Completion status
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Target,
  Award,
  Play,
  Upload,
  X,
  Camera,
  AlertCircle,
} from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import EvidenceUpload from '../../components/ui/EvidenceUpload';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { Module, ModuleProgress, SubBadge } from '../../types';

type TabType = 'enrolled' | 'available';

interface EnrolledModule {
  module: Module;
  progress: ModuleProgress;
  completedSubBadges: Set<string>;
  totalSubBadges: number;
  totalXP: number;
  earnedXP: number;
}

/** Calculate total XP for a module from its sub-badges */
function calculateModuleXP(subBadgeIds: string[], subBadges: SubBadge[]): number {
  return subBadgeIds.reduce((sum, sbId) => {
    const sb = subBadges.find((s) => s.id === sbId);
    return sum + (sb?.xpValue ?? 0);
  }, 0);
}

/** Calculate earned XP from completed sub-badges */
function calculateEarnedXP(completedIds: string[], subBadges: SubBadge[]): number {
  return completedIds.reduce((sum, sbId) => {
    const sb = subBadges.find((s) => s.id === sbId);
    return sum + (sb?.xpValue ?? 0);
  }, 0);
}

export default function Modules() {
  const { currentUser } = useAuth();
  const { state, getUserModuleProgress, dispatch } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get the expand parameter from URL (if present)
  const expandFromUrl = searchParams.get('expand');

  const [activeTab, setActiveTab] = useState<TabType>('enrolled');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(expandFromUrl);

  // Clear the URL parameter after initial load if it was used
  useEffect(() => {
    if (expandFromUrl) {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Evidence submission modal state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceSubBadge, setEvidenceSubBadge] = useState<SubBadge | null>(null);
  const [evidenceModuleId, setEvidenceModuleId] = useState<string | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Open evidence modal for a sub-badge
  const openEvidenceModal = (subBadge: SubBadge, moduleId: string) => {
    setEvidenceSubBadge(subBadge);
    setEvidenceModuleId(moduleId);
    setEvidenceDescription('');
    setEvidenceUrl(undefined);
    setShowEvidenceModal(true);
  };

  // Close evidence modal
  const closeEvidenceModal = () => {
    setShowEvidenceModal(false);
    setEvidenceSubBadge(null);
    setEvidenceModuleId(null);
    setEvidenceDescription('');
    setEvidenceUrl(undefined);
    setSubmitting(false);
  };

  // Submit evidence for a sub-badge
  const handleSubmitEvidence = () => {
    if (!currentUser || !evidenceSubBadge || !evidenceModuleId) return;
    setSubmitting(true);

    // Check if there's an existing pending activity with evidence requested
    const existingActivity = state.activities.find(
      (a) =>
        a.userId === currentUser.id &&
        a.subBadgeId === evidenceSubBadge.id &&
        a.status === 'pending' &&
        a.evidenceRequested
    );

    if (existingActivity) {
      // Update the existing activity with the new evidence
      dispatch({
        type: 'UPDATE_ACTIVITY',
        payload: {
          ...existingActivity,
          evidenceUrl: evidenceUrl,
          description: evidenceDescription
            ? evidenceSubBadge.name + ' — ' + evidenceDescription
            : existingActivity.description,
          // Clear the evidence requested flag since user is now providing evidence
          evidenceRequested: false,
          evidenceRequestedAt: undefined,
          evidenceRequestMessage: undefined,
        },
      });
    } else {
      // Create a new activity
      dispatch({
        type: 'LOG_ACTIVITY',
        payload: {
          userId: currentUser.id,
          centreId: currentUser.centreId,
          type: 'Sub-Badge Completion',
          description: evidenceDescription
            ? evidenceSubBadge.name + ' — ' + evidenceDescription
            : evidenceSubBadge.name,
          badgeCategory: evidenceSubBadge.badgeCategory,
          xpAwarded: evidenceSubBadge.xpValue,
          subBadgeId: evidenceSubBadge.id,
          moduleId: evidenceModuleId,
          status: 'pending',
          evidenceUrl: evidenceUrl,
        },
      });
    }

    closeEvidenceModal();
  };

  // Check if a sub-badge already has a pending submission
  const hasPendingSubmission = (subBadgeId: string): boolean => {
    return state.activities.some(
      (a) =>
        a.userId === currentUser?.id &&
        a.subBadgeId === subBadgeId &&
        a.status === 'pending'
    );
  };

  // Check if evidence has been requested for a pending sub-badge submission
  const hasEvidenceRequested = (subBadgeId: string): { requested: boolean; message?: string } => {
    const activity = state.activities.find(
      (a) =>
        a.userId === currentUser?.id &&
        a.subBadgeId === subBadgeId &&
        a.status === 'pending' &&
        a.evidenceRequested
    );
    return {
      requested: !!activity?.evidenceRequested,
      message: activity?.evidenceRequestMessage,
    };
  };

  // Get user's module progress
  const userModuleProgress = useMemo(
    () => (currentUser ? getUserModuleProgress(currentUser.id) : []),
    [currentUser, getUserModuleProgress]
  );

  // Enrolled modules with progress data
  const enrolledModules = useMemo((): EnrolledModule[] => {
    const enrolledIds = new Set(userModuleProgress.map((mp) => mp.moduleId));

    return state.modules
      .filter((m) => enrolledIds.has(m.id))
      .map((module) => {
        const progress = userModuleProgress.find((mp) => mp.moduleId === module.id);
        if (!progress) {
          // Should not happen, but handle gracefully
          return null;
        }
        const completedSubBadges = new Set(progress.completedSubBadgeIds);
        const totalXP = calculateModuleXP(module.subBadgeIds, state.subBadges);
        const earnedXP = calculateEarnedXP(progress.completedSubBadgeIds, state.subBadges);

        return {
          module,
          progress,
          completedSubBadges,
          totalSubBadges: module.subBadgeIds.length,
          totalXP,
          earnedXP,
        };
      })
      .filter((item): item is EnrolledModule => item !== null)
      .sort((a, b) => {
        // Sort: in-progress first, then completed
        if (a.progress.completedAt && !b.progress.completedAt) return 1;
        if (!a.progress.completedAt && b.progress.completedAt) return -1;
        return 0;
      });
  }, [state.modules, state.subBadges, userModuleProgress]);

  // Available modules (not enrolled)
  const availableModules = useMemo(() => {
    const enrolledIds = new Set(userModuleProgress.map((mp) => mp.moduleId));
    return state.modules.filter(
      (m) =>
        !enrolledIds.has(m.id) &&
        m.status === 'active' &&
        (m.centreId === null || m.centreId === currentUser?.centreId)
    );
  }, [state.modules, userModuleProgress, currentUser]);

  // Enrol in a module
  const handleEnrol = (moduleId: string) => {
    if (!currentUser) return;
    dispatch({
      type: 'ENROL_USER_IN_MODULE',
      payload: { userId: currentUser.id, moduleId },
    });
  };

  // Toggle expanded module
  const toggleExpanded = (moduleId: string) => {
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  // Get sub-badge details
  const getSubBadge = (sbId: string): SubBadge | undefined => {
    return state.subBadges.find((sb) => sb.id === sbId);
  };

  if (!currentUser) {
    return (
      <PageShell title="Modules">
        <div className="page-spinner">
          <div className="spinner" />
          <span className="page-spinner-text">Loading...</span>
        </div>
      </PageShell>
    );
  }

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'enrolled', label: 'My Modules', count: enrolledModules.length },
    { id: 'available', label: 'Available', count: availableModules.length },
  ];

  return (
    <PageShell title="Modules">
      <div className="modules animate-fade-in">
        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="modules__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`modules__tab ${activeTab === tab.id ? 'modules__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="modules__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── Enrolled Modules ──────────────────────────────────────── */}
        {activeTab === 'enrolled' && (
          <div className="modules__list">
            {enrolledModules.length > 0 ? (
              enrolledModules.map((enrolled) => {
                const isExpanded = expandedModuleId === enrolled.module.id;
                const isComplete = !!enrolled.progress.completedAt;
                const progressPct = Math.round(
                  (enrolled.completedSubBadges.size / enrolled.totalSubBadges) * 100
                );

                return (
                  <div
                    key={enrolled.module.id}
                    className={`modules__card ${isComplete ? 'modules__card--complete' : ''}`}
                  >
                    {/* Header */}
                    <button
                      type="button"
                      className="modules__card-header"
                      onClick={() => toggleExpanded(enrolled.module.id)}
                    >
                      <div className="modules__card-icon">
                        {isComplete ? (
                          <CheckCircle size={24} className="modules__icon--complete" />
                        ) : (
                          <BookOpen size={24} />
                        )}
                      </div>

                      <div className="modules__card-info">
                        <h3 className="modules__card-title">{enrolled.module.name}</h3>
                        <div className="modules__card-meta">
                          <span className="modules__card-game">
                            <Gamepad2 size={14} />
                            {enrolled.module.game}
                          </span>
                          <span className="modules__card-duration">
                            <Clock size={14} />
                            {enrolled.module.durationWeeks} weeks
                          </span>
                        </div>
                      </div>

                      <div className="modules__card-progress">
                        <span className="modules__card-progress-text">
                          {enrolled.completedSubBadges.size}/{enrolled.totalSubBadges}
                        </span>
                        <span className="modules__card-xp">
                          {enrolled.earnedXP}/{enrolled.totalXP} XP
                        </span>
                      </div>

                      <span className="modules__card-expand" aria-label="Toggle details">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>

                    {/* Progress Bar */}
                    <div className="modules__progress-bar">
                      <div
                        className="modules__progress-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Expanded Content - Sub-badges */}
                    {isExpanded && (
                      <div className="modules__card-content animate-fade-in-down">
                        <p className="modules__card-desc">{enrolled.module.description}</p>

                        <div className="modules__learning-outcome">
                          <Target size={16} />
                          <span>{enrolled.module.learningOutcome}</span>
                        </div>

                        <h4 className="modules__subbadges-title">
                          <Award size={16} />
                          Sub-Badges to Complete
                        </h4>

                        <div className="modules__subbadges-list">
                          {enrolled.module.subBadgeIds.map((sbId) => {
                            const sb = getSubBadge(sbId);
                            if (!sb) return null;
                            const isCompleted = enrolled.completedSubBadges.has(sbId);
                            const isPending = hasPendingSubmission(sbId);
                            const evidenceRequest = hasEvidenceRequested(sbId);

                            return (
                              <div
                                key={sbId}
                                className={`modules__subbadge ${isCompleted ? 'modules__subbadge--complete' : ''} ${isPending ? 'modules__subbadge--pending' : ''} ${evidenceRequest.requested ? 'modules__subbadge--evidence-requested' : ''}`}
                              >
                                <div className="modules__subbadge-check">
                                  {isCompleted && <CheckCircle size={14} />}
                                  {isPending && !evidenceRequest.requested && <Clock size={14} />}
                                  {evidenceRequest.requested && <AlertCircle size={14} />}
                                </div>
                                <div className="modules__subbadge-info">
                                  <span className="modules__subbadge-name">{sb.name}</span>
                                  <span className="modules__subbadge-desc">{sb.description}</span>
                                  {isPending && !evidenceRequest.requested && (
                                    <span className="modules__subbadge-pending-label">Pending review</span>
                                  )}
                                  {evidenceRequest.requested && (
                                    <span className="modules__subbadge-evidence-requested-label">
                                      <AlertCircle size={10} />
                                      Evidence requested
                                      {evidenceRequest.message && (
                                        <span className="modules__subbadge-evidence-message">: "{evidenceRequest.message}"</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <div className="modules__subbadge-actions">
                                  <span className="modules__subbadge-xp">+{sb.xpValue} XP</span>
                                  {!isCompleted && !isPending && (
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-xs modules__submit-evidence-btn"
                                      onClick={() => openEvidenceModal(sb, enrolled.module.id)}
                                    >
                                      <Camera size={12} />
                                      Submit Evidence
                                    </button>
                                  )}
                                  {evidenceRequest.requested && (
                                    <button
                                      type="button"
                                      className="btn btn-warning btn-xs modules__submit-evidence-btn"
                                      onClick={() => openEvidenceModal(sb, enrolled.module.id)}
                                    >
                                      <Upload size={12} />
                                      Add Evidence
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {isComplete && enrolled.progress.completedAt && (
                          <div className="modules__completed-badge">
                            <CheckCircle size={16} />
                            Completed on{' '}
                            {new Date(enrolled.progress.completedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="modules__empty empty-state">
                <BookOpen size={48} className="empty-state-icon" />
                <p className="empty-state-title">No enrolled modules</p>
                <p className="empty-state-description">
                  Check out the available modules and start learning!
                </p>
                <button
                  className="btn btn-primary mt-md"
                  onClick={() => setActiveTab('available')}
                >
                  Browse Modules
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Available Modules ─────────────────────────────────────── */}
        {activeTab === 'available' && (
          <div className="modules__list">
            {availableModules.length > 0 ? (
              availableModules.map((module) => {
                const totalXP = calculateModuleXP(module.subBadgeIds, state.subBadges);

                return (
                  <div key={module.id} className="modules__card modules__card--available">
                    <div className="modules__card-header">
                      <div className="modules__card-icon">
                        <BookOpen size={24} />
                      </div>

                      <div className="modules__card-info">
                        <h3 className="modules__card-title">{module.name}</h3>
                        <div className="modules__card-meta">
                          <span className="modules__card-game">
                            <Gamepad2 size={14} />
                            {module.game}
                          </span>
                          <span className="modules__card-duration">
                            <Clock size={14} />
                            {module.durationWeeks} weeks
                          </span>
                        </div>
                        <p className="modules__card-desc-preview">{module.description}</p>
                      </div>

                      <div className="modules__card-actions">
                        <div className="modules__card-xp-badge">
                          <Award size={14} />
                          {totalXP} XP
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEnrol(module.id)}
                        >
                          <Play size={14} />
                          Enrol
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="modules__empty empty-state">
                <CheckCircle size={48} className="empty-state-icon" />
                <p className="empty-state-title">All caught up!</p>
                <p className="empty-state-description">
                  You've enrolled in all available modules. Check back later for new content.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Evidence Submission Modal ───────────────────────────────── */}
      {showEvidenceModal && evidenceSubBadge && (
        <div className="evidence-modal-overlay">
          <div className="evidence-modal animate-scale-in">
            <div className="evidence-modal__header">
              <h2 className="evidence-modal__title">
                <Upload size={20} />
                Submit for Review
              </h2>
              <button
                type="button"
                className="evidence-modal__close"
                onClick={closeEvidenceModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="evidence-modal__body">
              {/* Sub-badge info */}
              <div className="evidence-modal__badge-info">
                <div className="evidence-modal__badge-icon">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="evidence-modal__badge-name">{evidenceSubBadge.name}</h3>
                  <p className="evidence-modal__badge-desc">{evidenceSubBadge.description}</p>
                  <span className="evidence-modal__badge-xp">
                    +{evidenceSubBadge.xpValue} XP • {evidenceSubBadge.badgeCategory}
                  </span>
                </div>
              </div>

              {/* Description / Comment */}
              <div className="form-group">
                <label className="label" htmlFor="evidence-desc">
                  {evidenceUrl ? 'Description (optional)' : 'Comment / Reason *'}
                </label>
                <textarea
                  id="evidence-desc"
                  className="textarea"
                  rows={3}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder={
                    evidenceUrl
                      ? 'Tell us about what you did, what you learned…'
                      : 'Please explain why you cannot provide evidence (e.g., completed in-person session, verbal assessment, etc.)'
                  }
                />
                {!evidenceUrl && !evidenceDescription.trim() && (
                  <p className="form-hint form-hint--warning">
                    A comment is required when submitting without evidence.
                  </p>
                )}
              </div>

              {/* Evidence upload */}
              <div className="form-group">
                <label className="label" htmlFor="evidence-file">
                  Evidence (optional)
                </label>
                <p className="form-hint">
                  Upload a photo, screenshot, or document if available.
                </p>
                <EvidenceUpload
                  value={evidenceUrl}
                  onChange={setEvidenceUrl}
                />
              </div>

              {/* Actions */}
              <div className="evidence-modal__actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeEvidenceModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitEvidence}
                  disabled={submitting || (!evidenceUrl && !evidenceDescription.trim())}
                >
                  <Upload size={14} />
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
