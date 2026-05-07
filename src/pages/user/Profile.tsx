/**
 * Profile.tsx – User Profile Page
 *
 * Displays:
 *   - User avatar, name, username, centre, joined date
 *   - Overall tier & XP summary
 *   - Badge collection with tier progress
 *   - Completed modules list
 */

import { useMemo, useState, useRef } from 'react';
import {
  AtSign,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Check,
  Shield,
  Edit2,
  Users,
  Cake,
  Tag,
  X,
  Camera,
  Hash,
} from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import BadgeCard from '../../components/ui/BadgeCard';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import { computeAge } from '../../types';
import type { TierThreshold, Module } from '../../types';

/** Get full TierThreshold object for XP */
function getTierThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

/** Format date as "Month Year" */
function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function Profile() {
  const { currentUser } = useAuth();
  const { state, dispatch, getTotalXP, getBadgeProgress, getUserModuleProgress } = useData();

  // Profile edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editError, setEditError] = useState('');

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: 'UPDATE_USER',
        payload: { ...currentUser, avatarUrl: reader.result as string },
      });
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleOpenEdit = () => {
    if (!currentUser) return;
    // Fall back to splitting displayName in case firstName/lastName are absent
    // (can happen if localStorage was saved before the migration ran)
    const parts = currentUser.displayName.trim().split(' ');
    setEditFirstName(currentUser.firstName || parts[0] || '');
    setEditLastName(currentUser.lastName || parts.slice(1).join(' ') || '');
    setEditDob(currentUser.dateOfBirth ?? '');
    setEditNickname(currentUser.nickname ?? '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editFirstName.trim() || !editLastName.trim()) {
      setEditError('First and last name are required');
      return;
    }
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        ...currentUser,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        displayName: `${editFirstName.trim()} ${editLastName.trim()}`,
        dateOfBirth: editDob || undefined,
        nickname: editNickname.trim() || undefined,
      },
    });
    setShowEditModal(false);
  };

  // Computed data
  const totalXP = useMemo(
    () => (currentUser ? getTotalXP(currentUser.id) : 0),
    [currentUser, getTotalXP]
  );

  const currentTier = useMemo(
    () => getTierThreshold(totalXP, state.tierThresholds),
    [totalXP, state.tierThresholds]
  );

  const completedModules = useMemo(() => {
    if (!currentUser) return [];
    const userProgress = getUserModuleProgress(currentUser.id);
    const completedIds = new Set(
      userProgress
        .filter((mp) => mp.completedAt)
        .map((mp) => mp.moduleId)
    );
    return state.modules.filter((m) => completedIds.has(m.id));
  }, [currentUser, getUserModuleProgress, state.modules]);

  const userAge = useMemo(
    () => (currentUser?.dateOfBirth ? computeAge(currentUser.dateOfBirth) : undefined),
    [currentUser]
  );

  const userGroups = useMemo(() => {
    if (!currentUser) return [];
    return state.groups.filter((g) => currentUser.groupIds.includes(g.id));
  }, [currentUser, state.groups]);

  const userCentre = useMemo(() => {
    if (!currentUser) return null;
    return state.centres.find((c) => c.id === currentUser.centreId);
  }, [currentUser, state.centres]);

  // Calculate module XP (sum of sub-badge XP)
  const getModuleXP = (module: Module): number => {
    return module.subBadgeIds.reduce((sum, sbId) => {
      const subBadge = state.subBadges.find((sb) => sb.id === sbId);
      return sum + (subBadge?.xpValue ?? 0);
    }, 0);
  };

  if (!currentUser) {
    return (
      <PageShell title="Profile">
        <div className="page-spinner">
          <div className="spinner" />
          <span className="page-spinner-text">Loading...</span>
        </div>
      </PageShell>
    );
  }

  return (
    <>
      <PageShell title="Profile">
        <div className="profile animate-fade-in">
          {/* ── User Info Card ────────────────────────────────────────── */}
          <section className="profile__card">
            {/* Avatar — click to upload */}
            <button
              type="button"
              className="profile__avatar profile__avatar--upload"
              onClick={() => avatarInputRef.current?.click()}
              title="Change profile picture"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.displayName} />
              ) : (
                <span className="profile__avatar-initials">
                  {currentUser.displayName
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
              <span className="profile__avatar-overlay">
                <Camera size={18} />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="profile__avatar-input"
              onChange={handleAvatarChange}
              aria-label="Upload profile picture"
            />

            <div className="profile__info">
              <h2 className="profile__name">{currentUser.displayName}</h2>
              {currentUser.nickname && (
                <span className="profile__nickname">
                  <Hash size={12} />
                  {currentUser.nickname}
                </span>
              )}
              <div
                className="profile__tier-badge"
                style={{ backgroundColor: currentTier.colour }}
              >
                {currentTier.tier}
              </div>
            </div>

            <button
              className="btn btn-ghost btn-sm profile__edit-btn"
              onClick={handleOpenEdit}
              title="Edit profile"
            >
              <Edit2 size={14} />
              Edit
            </button>

            <div className="profile__details">
              <div className="profile__detail">
                <AtSign size={16} />
                <span>{currentUser.username}</span>
              </div>
              {userCentre && (
                <div className="profile__detail">
                  <MapPin size={16} />
                  <span>{userCentre.name}</span>
                </div>
              )}
              {userAge !== undefined && (
                <div className="profile__detail">
                  <Cake size={16} />
                  <span>
                    {currentUser.dateOfBirth
                      ? new Date(currentUser.dateOfBirth).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                      : ''}
                    {' '}(Age {userAge})
                  </span>
                </div>
              )}
              <div className="profile__detail">
                <Calendar size={16} />
                <span>Joined {formatJoinDate(currentUser.createdAt)}</span>
              </div>
              <div className="profile__detail">
                <Shield size={16} />
                <span className="profile__role">{currentUser.role}</span>
              </div>
            </div>

            <div className="profile__xp-summary">
              <div className="profile__xp-value">{totalXP.toLocaleString()}</div>
              <div className="profile__xp-label">Total XP</div>
            </div>
          </section>

          {/* ── Groups ──────────────────────────────────────────────── */}
          <section className="profile__section">
            <div className="profile__section-header">
              <h3 className="profile__section-title">
                <Users size={20} />
                My Groups
              </h3>
              <span className="profile__section-count">{userGroups.length}</span>
            </div>
            {userGroups.length > 0 ? (
              <div className="profile__groups-list">
                {userGroups.map((group) => (
                  <div key={group.id} className="profile__group-item">
                    <div className="profile__group-icon">
                      <Users size={16} />
                    </div>
                    <div className="profile__group-info">
                      <span className="profile__group-name">
                        {group.name}
                        {group.nickname && (
                          <span className="profile__group-tag">
                            <Tag size={10} />
                            {group.nickname}
                          </span>
                        )}
                      </span>
                      <span className="profile__group-meta">
                        {group.game} • {group.type} • Ages {group.ageRange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={32} className="empty-state-icon" />
                <p className="empty-state-title">No groups yet</p>
                <p className="empty-state-description">Ask your admin to assign you to a group.</p>
              </div>
            )}
          </section>

          {/* ── Badge Collection ────────────────────────────────────────── */}
          <section className="profile__section">
            <div className="profile__section-header">
              <h3 className="profile__section-title">
                <Award size={20} />
                Badge Collection
              </h3>
            </div>
            <div className="profile__badges-grid">
              {state.badges.map((badge) => {
                const progress = getBadgeProgress(currentUser.id, badge.category);
                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={progress}
                    thresholds={state.tierThresholds}
                    locked={!progress}
                    size="sm"
                  />
                );
              })}
            </div>
          </section>

          {/* ── Completed Modules ─────────────────────────────────────── */}
          <section className="profile__section">
            <div className="profile__section-header">
              <h3 className="profile__section-title">
                <BookOpen size={20} />
                Completed Modules
              </h3>
              <span className="profile__section-count">{completedModules.length}</span>
            </div>
            {completedModules.length > 0 ? (
              <div className="profile__modules-list">
                {completedModules.map((module: Module) => (
                  <div key={module.id} className="profile__module-item">
                    <Check size={16} className="profile__module-check" />
                    <div className="profile__module-info">
                      <span className="profile__module-name">{module.name}</span>
                      <span className="profile__module-game text-muted">{module.game}</span>
                    </div>
                    <span className="profile__module-xp">+{getModuleXP(module)} XP</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={40} className="empty-state-icon" />
                <p className="empty-state-title">No modules completed yet</p>
                <p className="empty-state-description">
                  Start working on modules to see them here!
                </p>
              </div>
            )}
          </section>
        </div>
      </PageShell>

      {/* ── Edit Profile Modal ─────────────────────────────────── */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal modal--sm animate-scale-in">
            <div className="modal__header">
              <h2 className="modal__title">Edit Profile</h2>
              <button
                className="modal__close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal__body">
              {editError && <div className="form-error">{editError}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label className="label label-required" htmlFor="profile-firstName">
                    First Name
                  </label>
                  <input
                    id="profile-firstName"
                    type="text"
                    className="input"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label label-required" htmlFor="profile-lastName">
                    Last Name
                  </label>
                  <input
                    id="profile-lastName"
                    type="text"
                    className="input"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="profile-dob">
                  Date of Birth
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  className="input"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="profile-nickname">
                  Nickname / Gamer Tag
                </label>
                <input
                  id="profile-nickname"
                  type="text"
                  className="input"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="e.g. xX_Destroyer_Xx"
                  maxLength={30}
                />
              </div>

              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}