/**
 * ManageModules.tsx – Admin Module Management
 *
 * Features:
 *   - View all modules (filtered by centre for admins)
 *   - Create new module
 *   - Edit module details
 *   - Manage sub-badges within modules
 *   - Archive/activate modules
 *   - View enrolled users
 */

import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Archive,
  Play,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  Clock,
  Gamepad2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { Module, ModuleStatus, Game } from '../../types';

type FilterStatus = 'all' | ModuleStatus;

const GAMES: Game[] = [
  'Minecraft',
  'Rocket League',
  'Fortnite',
  'Multi / Casual',
  'Broadcast & Podcast',
  'General',
];

const STATUS_LABELS: Record<ModuleStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

const STATUS_COLORS: Record<ModuleStatus, string> = {
  draft: 'var(--color-warning)',
  active: 'var(--color-success)',
  archived: 'var(--color-text-muted)',
};

export default function ManageModules() {
  const { isSuperAdmin, currentUser } = useAuth();
  const { state, dispatch } = useData();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Expanded module (to show sub-badges)
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formGame, setFormGame] = useState<Game>('Minecraft');
  const [formOutcome, setFormOutcome] = useState('');
  const [formDuration, setFormDuration] = useState(12);
  const [formStatus, setFormStatus] = useState<ModuleStatus>('draft');
  const [formError, setFormError] = useState('');

  const centreId = currentUser?.centreId ?? '';

  // Filter modules
  const filteredModules = useMemo(() => {
    let modules = state.modules;

    // Centre filter (admins see their centre + global, superadmins see all)
    if (!isSuperAdmin) {
      modules = modules.filter(
        (m) => m.centreId === centreId || m.centreId === null
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      modules = modules.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.game.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      modules = modules.filter((m) => m.status === filterStatus);
    }

    return modules.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.modules, centreId, isSuperAdmin, searchQuery, filterStatus]);

  // Get sub-badges for a module
  const getModuleSubBadges = (moduleId: string) => {
    return state.subBadges.filter((sb) => sb.moduleId === moduleId);
  };

  // Get enrolled users count
  const getEnrolledCount = (moduleId: string): number => {
    return state.moduleProgress.filter((mp) => mp.moduleId === moduleId).length;
  };

  // Get centre name
  const getCentreName = (cId: string | null): string => {
    if (cId === null) return 'Global';
    return state.centres.find((c) => c.id === cId)?.name ?? 'Unknown';
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormGame('Minecraft');
    setFormOutcome('');
    setFormDuration(12);
    setFormStatus('draft');
    setFormError('');
  };

  // Open add modal
  const handleOpenAdd = () => {
    resetForm();
    setEditingModule(null);
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (mod: Module) => {
    setFormName(mod.name);
    setFormDescription(mod.description);
    setFormGame(mod.game);
    setFormOutcome(mod.learningOutcome);
    setFormDuration(mod.durationWeeks);
    setFormStatus(mod.status);
    setFormError('');
    setEditingModule(mod);
    setShowAddModal(true);
  };

  // Save module
  const handleSaveModule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (editingModule) {
      // Update existing module
      dispatch({
        type: 'UPDATE_MODULE',
        payload: {
          ...editingModule,
          name: formName.trim(),
          description: formDescription.trim(),
          game: formGame,
          learningOutcome: formOutcome.trim(),
          durationWeeks: formDuration,
          status: formStatus,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Add new module
      dispatch({
        type: 'ADD_MODULE',
        payload: {
          centreId: isSuperAdmin ? null : centreId,
          name: formName.trim(),
          description: formDescription.trim(),
          game: formGame,
          learningOutcome: formOutcome.trim(),
          durationWeeks: formDuration,
          status: formStatus,
          subBadgeIds: [],
          resources: [],
          isApproved: isSuperAdmin,
        },
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  // Toggle module status (archive/activate)
  const handleToggleStatus = (mod: Module) => {
    const newStatus: ModuleStatus = mod.status === 'archived' ? 'active' : 'archived';
    dispatch({
      type: 'UPDATE_MODULE',
      payload: {
        ...mod,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  // Toggle expansion
  const toggleExpand = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <AdminShell title="Manage Modules">
      <div className="admin-modules animate-fade-in">
        {/* Header Actions */}
        <div className="admin-modules__header">
          <div className="admin-modules__search">
            <Search size={18} className="admin-modules__search-icon" />
            <input
              type="text"
              className="input admin-modules__search-input"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-modules__actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={14} />
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              Add Module
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="admin-modules__filters animate-fade-in-down">
            <div className="admin-modules__filter-group">
              <label className="label" htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}

        {/* Modules List */}
        <div className="admin-modules__list">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod) => {
              const subBadges = getModuleSubBadges(mod.id);
              const enrolledCount = getEnrolledCount(mod.id);
              const isExpanded = expandedModule === mod.id;

              return (
                <div key={mod.id} className="admin-module-card">
                  <div className="admin-module-card__main">
                    <div className="admin-module-card__icon">
                      <Gamepad2 size={24} />
                    </div>

                    <div className="admin-module-card__info">
                      <div className="admin-module-card__header-row">
                        <h3 className="admin-module-card__name">{mod.name}</h3>
                        <span
                          className="admin-module-card__status"
                          style={{ color: STATUS_COLORS[mod.status] }}
                        >
                          {mod.status === 'active' && <CheckCircle size={14} />}
                          {mod.status === 'draft' && <AlertCircle size={14} />}
                          {mod.status === 'archived' && <Archive size={14} />}
                          {STATUS_LABELS[mod.status]}
                        </span>
                      </div>
                      <p className="admin-module-card__desc">{mod.description}</p>
                      <div className="admin-module-card__meta">
                        <span className="admin-module-card__game">
                          <Gamepad2 size={12} />
                          {mod.game}
                        </span>
                        <span className="admin-module-card__duration">
                          <Clock size={12} />
                          {mod.durationWeeks} weeks
                        </span>
                        <span className="admin-module-card__enrolled">
                          <Users size={12} />
                          {enrolledCount} enrolled
                        </span>
                        <span className="admin-module-card__badges">
                          <BookOpen size={12} />
                          {subBadges.length} sub-badges
                        </span>
                        {isSuperAdmin && (
                          <span className="admin-module-card__centre">
                            {getCentreName(mod.centreId)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-module-card__actions">
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleOpenEdit(mod)}
                        title="Edit module"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`btn btn-ghost btn-sm btn-icon ${mod.status === 'archived' ? 'text-success' : ''}`}
                        onClick={() => handleToggleStatus(mod)}
                        title={mod.status === 'archived' ? 'Activate' : 'Archive'}
                      >
                        {mod.status === 'archived' ? <Play size={16} /> : <Archive size={16} />}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => toggleExpand(mod.id)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content - sub-badges */}
                  {isExpanded && (
                    <div className="admin-module-card__expanded animate-fade-in-down">
                      <div className="admin-module-card__section">
                        <h4 className="admin-module-card__section-title">Learning Outcome</h4>
                        <p className="admin-module-card__outcome">
                          {mod.learningOutcome || 'No learning outcome specified.'}
                        </p>
                      </div>

                      <div className="admin-module-card__section">
                        <h4 className="admin-module-card__section-title">
                          Sub-Badges ({subBadges.length})
                        </h4>
                        {subBadges.length > 0 ? (
                          <div className="admin-module-card__subbadges">
                            {subBadges.map((sb) => (
                              <div key={sb.id} className="admin-module-subbadge">
                                <span className="admin-module-subbadge__name">{sb.name}</span>
                                <span className="admin-module-subbadge__xp">{sb.xpValue} XP</span>
                                <span className="admin-module-subbadge__category">
                                  {sb.badgeCategory}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="admin-module-card__empty">
                            No sub-badges assigned to this module yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <BookOpen size={40} className="empty-state-icon" />
              <p className="empty-state-title">No modules found</p>
              <p className="empty-state-description">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first module to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Module Modal */}
        {showAddModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--lg animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">
                  {editingModule ? 'Edit Module' : 'Create New Module'}
                </h2>
                <button
                  className="admin-modal__close"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingModule(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="admin-modal__body">
                {formError && (
                  <div className="admin-form-error">{formError}</div>
                )}

                <div className="form-row">
                  <div className="form-group form-group--flex">
                    <label className="label label-required" htmlFor="module-name">
                      Module Name
                    </label>
                    <input
                      id="module-name"
                      type="text"
                      className="input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Minecraft Teamwork Fundamentals"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label label-required" htmlFor="module-game">
                      Game
                    </label>
                    <select
                      id="module-game"
                      className="select"
                      value={formGame}
                      onChange={(e) => setFormGame(e.target.value as Game)}
                    >
                      {GAMES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="module-desc">
                    Description
                  </label>
                  <textarea
                    id="module-desc"
                    className="textarea"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of what this module covers..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="module-outcome">
                    Learning Outcome
                  </label>
                  <textarea
                    id="module-outcome"
                    className="textarea"
                    rows={2}
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    placeholder="What participants will achieve by completing this module..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="module-duration">
                      Duration (weeks)
                    </label>
                    <input
                      id="module-duration"
                      type="number"
                      className="input"
                      min={1}
                      max={52}
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="module-status">
                      Status
                    </label>
                    <select
                      id="module-status"
                      className="select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ModuleStatus)}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingModule(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingModule ? 'Save Changes' : 'Create Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
