/**
 * ManageBadges.tsx – Admin Badge Management
 *
 * Features:
 *   - View all badge categories
 *   - Manage sub-badges per module
 *   - Manual XP awards
 *   - View tier thresholds
 */

import { useState, useMemo } from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Zap,
  Search,
  X,
  User,
  Star,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { SubBadge, User as UserType, BadgeCategory } from '../../types';

type Tab = 'badges' | 'award' | 'tiers';

// Badge category display info
const BADGE_COLORS: Record<BadgeCategory, string> = {
  'Game Mastery': '#F59E0B',
  'Teamwork': '#3B82F6',
  'Esports Citizen': '#8B5CF6',
  'Personal Development': '#EC4899',
  'Digital Skills': '#10B981',
};

export default function ManageBadges() {
  const { isSuperAdmin, currentUser } = useAuth();
  const { state, dispatch, getTotalXP } = useData();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('badges');

  // Badge expansion
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);

  // Search for XP award
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | ''>('');
  const [xpAmount, setXpAmount] = useState<number>(100);
  const [awardSuccess, setAwardSuccess] = useState(false);

  // Sub-badge modal
  const [showSubBadgeModal, setShowSubBadgeModal] = useState(false);
  const [editingSubBadge, setEditingSubBadge] = useState<SubBadge | null>(null);
  const [subBadgeModule, setSubBadgeModule] = useState<string>('');
  const [subBadgeCategory, setSubBadgeCategory] = useState<BadgeCategory>('Teamwork');
  const [subBadgeName, setSubBadgeName] = useState('');
  const [subBadgeDesc, setSubBadgeDesc] = useState('');
  const [subBadgeXP, setSubBadgeXP] = useState<number>(100);

  // Filter users for XP award by centre (admins only see their centre)
  const centreId = currentUser?.centreId ?? '';

  const filteredUsers = useMemo(() => {
    let users = state.users.filter((u) => u.role === 'user' && u.isActive);
    if (!isSuperAdmin) {
      users = users.filter((u) => u.centreId === centreId);
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      users = users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }
    return users.slice(0, 10); // Limit results
  }, [state.users, centreId, isSuperAdmin, userSearch]);

  // Get sub-badges for a badge category
  const getSubBadgesByCategory = (category: BadgeCategory): SubBadge[] => {
    return state.subBadges.filter((sb) => sb.badgeCategory === category);
  };

  // Toggle badge expansion
  const toggleBadge = (badgeId: string) => {
    setExpandedBadge(expandedBadge === badgeId ? null : badgeId);
  };

  // Open add sub-badge modal
  const handleAddSubBadge = (category: BadgeCategory) => {
    setSubBadgeModule(state.modules[0]?.id ?? '');
    setSubBadgeCategory(category);
    setSubBadgeName('');
    setSubBadgeDesc('');
    setSubBadgeXP(100);
    setEditingSubBadge(null);
    setShowSubBadgeModal(true);
  };

  // Open edit sub-badge modal
  const handleEditSubBadge = (subBadge: SubBadge) => {
    setSubBadgeModule(subBadge.moduleId);
    setSubBadgeCategory(subBadge.badgeCategory);
    setSubBadgeName(subBadge.name);
    setSubBadgeDesc(subBadge.description);
    setSubBadgeXP(subBadge.xpValue);
    setEditingSubBadge(subBadge);
    setShowSubBadgeModal(true);
  };

  // Save sub-badge
  const handleSaveSubBadge = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingSubBadge) {
      dispatch({
        type: 'UPDATE_SUB_BADGE',
        payload: {
          ...editingSubBadge,
          name: subBadgeName.trim(),
          description: subBadgeDesc.trim(),
          xpValue: subBadgeXP,
          badgeCategory: subBadgeCategory,
          moduleId: subBadgeModule,
        },
      });
    } else {
      dispatch({
        type: 'ADD_SUB_BADGE',
        payload: {
          moduleId: subBadgeModule,
          badgeCategory: subBadgeCategory,
          name: subBadgeName.trim(),
          description: subBadgeDesc.trim(),
          xpValue: subBadgeXP,
          ysofSkillIds: [],
          order: 0,
        },
      });
    }

    setShowSubBadgeModal(false);
  };

  // Delete sub-badge
  const handleDeleteSubBadge = (subBadge: SubBadge) => {
    if (globalThis.confirm(`Delete "${subBadge.name}"? This cannot be undone.`)) {
      dispatch({
        type: 'DELETE_SUB_BADGE',
        payload: { id: subBadge.id },
      });
    }
  };

  // Award XP to user
  const handleAwardXP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedUser || !selectedCategory || xpAmount <= 0) return;

    dispatch({
      type: 'AWARD_XP',
      payload: {
        userId: selectedUser.id,
        badgeCategory: selectedCategory,
        xp: xpAmount,
      },
    });

    // Show success message
    setAwardSuccess(true);
    setTimeout(() => setAwardSuccess(false), 3000);

    // Reset form
    setSelectedUser(null);
    setUserSearch('');
    setXpAmount(100);
  };

  // Sort tiers for display
  const sortedTiers = useMemo(
    () => [...state.tierThresholds].sort((a, b) => a.minXP - b.minXP),
    [state.tierThresholds]
  );

  return (
    <AdminShell title="Manage Badges">
      <div className="admin-badges animate-fade-in">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'badges' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            <Award size={16} />
            Badge Categories
          </button>
          <button
            className={`admin-tab ${activeTab === 'award' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('award')}
          >
            <Zap size={16} />
            Award XP
          </button>
          <button
            className={`admin-tab ${activeTab === 'tiers' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('tiers')}
          >
            <Star size={16} />
            Tier Thresholds
          </button>
        </div>

        {/* Badge Categories Tab */}
        {activeTab === 'badges' && (
          <div className="admin-badges__list">
            {state.badges.map((badge) => {
              const subBadges = getSubBadgesByCategory(badge.category);
              const isExpanded = expandedBadge === badge.id;
              const badgeColor = BADGE_COLORS[badge.category];

              return (
                <div key={badge.id} className="admin-badge-card">
                  <button
                    type="button"
                    className="admin-badge-card__header"
                    onClick={() => toggleBadge(badge.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="admin-badge-card__icon">
                      <Award size={24} style={{ color: badgeColor }} />
                    </div>
                    <div className="admin-badge-card__info">
                      <h3 className="admin-badge-card__name">{badge.name}</h3>
                      <p className="admin-badge-card__desc">{badge.description}</p>
                    </div>
                    <div className="admin-badge-card__meta">
                      <span className="admin-badge-card__count">
                        {subBadges.length} sub-badge{subBadges.length === 1 ? '' : 's'}
                      </span>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="admin-badge-card__body animate-fade-in-down">
                      <div className="admin-badge-card__subbadges">
                        {subBadges.length > 0 ? (
                          subBadges.map((sb) => (
                            <div key={sb.id} className="admin-subbadge-item">
                              <div className="admin-subbadge-item__info">
                                <span className="admin-subbadge-item__name">{sb.name}</span>
                                <span className="admin-subbadge-item__desc">{sb.description}</span>
                              </div>
                              <div className="admin-subbadge-item__xp">
                                <Zap size={14} />
                                {sb.xpValue} XP
                              </div>
                              <div className="admin-subbadge-item__actions">
                                <button
                                  className="btn btn-ghost btn-sm btn-icon"
                                  onClick={() => handleEditSubBadge(sb)}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm btn-icon text-danger"
                                  onClick={() => handleDeleteSubBadge(sb)}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="admin-badge-card__empty">
                            No sub-badges yet. Add one to get started.
                          </p>
                        )}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm admin-badge-card__add"
                        onClick={() => handleAddSubBadge(badge.category)}
                      >
                        <Plus size={14} />
                        Add Sub-Badge
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Award XP Tab */}
        {activeTab === 'award' && (
          <div className="admin-award">
            {awardSuccess && (
              <div className="admin-success-message animate-fade-in">
                <Zap size={16} />
                XP awarded successfully!
              </div>
            )}

            <form onSubmit={handleAwardXP} className="admin-award__form">
              <div className="form-group">
                <label className="label label-required" htmlFor="award-user-search">
                  Select User
                </label>
                <div className="admin-award__user-search">
                  <div className="admin-award__search-input">
                    <Search size={16} />
                    <input
                      id="award-user-search"
                      type="text"
                      className="input"
                      placeholder="Search by name or username..."
                      value={selectedUser ? selectedUser.displayName : userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setSelectedUser(null);
                      }}
                    />
                    {selectedUser && (
                      <button
                        type="button"
                        className="admin-award__clear"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearch('');
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* User dropdown */}
                  {!selectedUser && userSearch && filteredUsers.length > 0 && (
                    <div className="admin-award__dropdown">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="admin-award__dropdown-item"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearch('');
                          }}
                        >
                          <User size={14} />
                          <span className="admin-award__dropdown-name">
                            {user.displayName}
                          </span>
                          <span className="admin-award__dropdown-xp">
                            {getTotalXP(user.id).toLocaleString()} XP
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label label-required" htmlFor="award-badge">
                  Badge Category
                </label>
                <select
                  id="award-badge"
                  className="select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | '')}
                  required
                >
                  <option value="">Select a category...</option>
                  {state.badges.map((badge) => (
                    <option key={badge.id} value={badge.category}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label label-required" htmlFor="award-xp">
                  XP Amount
                </label>
                <input
                  id="award-xp"
                  type="number"
                  className="input"
                  min={1}
                  max={10000}
                  value={xpAmount}
                  onChange={(e) => setXpAmount(Number(e.target.value))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!selectedUser || !selectedCategory || xpAmount <= 0}
              >
                <Zap size={16} />
                Award {xpAmount} XP
              </button>
            </form>
          </div>
        )}

        {/* Tier Thresholds Tab */}
        {activeTab === 'tiers' && (
          <div className="admin-tiers">
            <p className="admin-tiers__intro">
              Tiers are assigned based on total XP across all badge categories.
            </p>
            <div className="admin-tiers__list">
              {sortedTiers.map((tier, index) => {
                const nextTier = sortedTiers[index + 1];
                return (
                  <div
                    key={tier.tier}
                    className="admin-tier-card"
                    style={{ borderLeftColor: tier.colour }}
                  >
                    <div
                      className="admin-tier-card__icon"
                      style={{ backgroundColor: tier.colour }}
                    >
                      <Star size={20} />
                    </div>
                    <div className="admin-tier-card__info">
                      <h3 className="admin-tier-card__name">{tier.tier}</h3>
                      <p className="admin-tier-card__range">
                        {tier.minXP.toLocaleString()} XP
                        {nextTier ? ` – ${(nextTier.minXP - 1).toLocaleString()} XP` : '+'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-Badge Modal */}
        {showSubBadgeModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">
                  {editingSubBadge ? 'Edit Sub-Badge' : 'Add Sub-Badge'}
                </h2>
                <button
                  className="admin-modal__close"
                  onClick={() => setShowSubBadgeModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSubBadge} className="admin-modal__body">
                <div className="form-group">
                  <label className="label label-required" htmlFor="subbadge-name">
                    Name
                  </label>
                  <input
                    id="subbadge-name"
                    type="text"
                    className="input"
                    value={subBadgeName}
                    onChange={(e) => setSubBadgeName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="subbadge-desc">
                    Description
                  </label>
                  <input
                    id="subbadge-desc"
                    type="text"
                    className="input"
                    value={subBadgeDesc}
                    onChange={(e) => setSubBadgeDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="subbadge-module">
                    Module
                  </label>
                  <select
                    id="subbadge-module"
                    className="select"
                    value={subBadgeModule}
                    onChange={(e) => setSubBadgeModule(e.target.value)}
                    required
                  >
                    {state.modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="subbadge-category">
                    Badge Category
                  </label>
                  <select
                    id="subbadge-category"
                    className="select"
                    value={subBadgeCategory}
                    onChange={(e) => setSubBadgeCategory(e.target.value as BadgeCategory)}
                    required
                  >
                    {state.badges.map((badge) => (
                      <option key={badge.id} value={badge.category}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="subbadge-xp">
                    XP Value
                  </label>
                  <input
                    id="subbadge-xp"
                    type="number"
                    className="input"
                    min={1}
                    value={subBadgeXP}
                    onChange={(e) => setSubBadgeXP(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowSubBadgeModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingSubBadge ? 'Save Changes' : 'Add Sub-Badge'}
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
