/**
 * ManageCentres.tsx – Admin Centre & Group Management
 *
 * Features:
 *   - Superadmins: Create/edit/deactivate centres
 *   - Admins & Superadmins: Create/edit groups within centres
 *   - View users and stats per centre
 */

import { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Power,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  Gamepad2,
  MapPin,
  Calendar,
  Tag,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import type { Centre, Group, Game, GroupType } from '../../types';

const COUNTRIES: Centre['country'][] = ['Scotland', 'Ireland', 'England', 'Wales', 'Other'];

const GAMES: Game[] = [
  'Minecraft',
  'Rocket League',
  'Fortnite',
  'Multi / Casual',
  'Broadcast & Podcast',
  'General',
];

const GROUP_TYPES: GroupType[] = [
  'Juniors',
  'Competitive',
  'Media',
  'Casual',
  'Tournament',
];

export default function ManageCentres() {
  const { isSuperAdmin, currentUser } = useAuth();
  const { state, dispatch } = useData();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded centre (to show groups)
  const [expandedCentre, setExpandedCentre] = useState<string | null>(null);

  // Centre modal
  const [showCentreModal, setShowCentreModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [centreName, setCentreName] = useState('');
  const [centreLocation, setCentreLocation] = useState('');
  const [centreCountry, setCentreCountry] = useState<Centre['country']>('Scotland');
  const [centreError, setCentreError] = useState('');

  // Group modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupCentreId, setGroupCentreId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupNickname, setGroupNickname] = useState('');
  const [groupGame, setGroupGame] = useState<Game>('Minecraft');
  const [groupType, setGroupType] = useState<GroupType>('Juniors');
  const [groupAgeRange, setGroupAgeRange] = useState('8-14');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupInitialMembers, setGroupInitialMembers] = useState<string[]>([]);
  const [groupError, setGroupError] = useState('');

  const centreId = currentUser?.centreId ?? '';

  // Filter centres (admins only see their centre, superadmins see all)
  const filteredCentres = useMemo(() => {
    let centres = state.centres;

    if (!isSuperAdmin) {
      centres = centres.filter((c) => c.id === centreId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      centres = centres.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    return centres.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.centres, centreId, isSuperAdmin, searchQuery]);

  // Get groups for a centre
  const getCentreGroups = (cId: string): Group[] => {
    return state.groups.filter((g) => g.centreId === cId);
  };

  // Get user count for a centre
  const getCentreUserCount = (cId: string): number => {
    return state.users.filter((u) => u.centreId === cId && u.role === 'user').length;
  };

  // Get admin count for a centre
  const getCentreAdminCount = (cId: string): number => {
    return state.users.filter((u) => u.centreId === cId && u.role === 'admin').length;
  };

  // Reset centre form
  const resetCentreForm = () => {
    setCentreName('');
    setCentreLocation('');
    setCentreCountry('Scotland');
    setCentreError('');
    setEditingCentre(null);
  };

  // Open add centre modal
  const handleOpenAddCentre = () => {
    resetCentreForm();
    setShowCentreModal(true);
  };

  // Open edit centre modal
  const handleOpenEditCentre = (centre: Centre) => {
    setCentreName(centre.name);
    setCentreLocation(centre.location);
    setCentreCountry(centre.country);
    setCentreError('');
    setEditingCentre(centre);
    setShowCentreModal(true);
  };

  // Save centre
  const handleSaveCentre = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCentreError('');

    if (!centreName.trim() || !centreLocation.trim()) {
      setCentreError('Please fill in all required fields');
      return;
    }

    if (editingCentre) {
      dispatch({
        type: 'UPDATE_CENTRE',
        payload: {
          ...editingCentre,
          name: centreName.trim(),
          location: centreLocation.trim(),
          country: centreCountry,
        },
      });
    } else {
      dispatch({
        type: 'ADD_CENTRE',
        payload: {
          name: centreName.trim(),
          location: centreLocation.trim(),
          country: centreCountry,
          isActive: true,
        },
      });
    }

    setShowCentreModal(false);
    resetCentreForm();
  };

  // Toggle centre active status
  const handleToggleCentreActive = (centre: Centre) => {
    dispatch({
      type: 'UPDATE_CENTRE',
      payload: {
        ...centre,
        isActive: !centre.isActive,
      },
    });
  };

  // Reset group form
  const resetGroupForm = () => {
    setGroupName('');
    setGroupNickname('');
    setGroupGame('Minecraft');
    setGroupType('Juniors');
    setGroupAgeRange('8-14');
    setGroupDescription('');
    setGroupInitialMembers([]);
    setGroupError('');
    setEditingGroup(null);
  };

  // Open add group modal
  const handleOpenAddGroup = (cId: string) => {
    resetGroupForm();
    setGroupCentreId(cId);
    setShowGroupModal(true);
  };

  // Open edit group modal
  const handleOpenEditGroup = (group: Group) => {
    setGroupCentreId(group.centreId);
    setGroupName(group.name);
    setGroupNickname(group.nickname ?? '');
    setGroupGame(group.game);
    setGroupType(group.type);
    setGroupAgeRange(group.ageRange);
    setGroupDescription(group.description ?? '');
    setGroupInitialMembers([]);
    setGroupError('');
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  // Save group
  const handleSaveGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGroupError('');

    if (!groupName.trim()) {
      setGroupError('Please enter a group name');
      return;
    }

    // Require at least 1 member when creating a new group
    if (!editingGroup && groupInitialMembers.length === 0) {
      setGroupError('Please add at least one member to the group');
      return;
    }

    if (editingGroup) {
      dispatch({
        type: 'UPDATE_GROUP',
        payload: {
          ...editingGroup,
          name: groupName.trim(),
          nickname: groupNickname.trim() || undefined,
          game: groupGame,
          type: groupType,
          ageRange: groupAgeRange,
          description: groupDescription.trim() || undefined,
        },
      });
    } else {
      const newGroupId = crypto.randomUUID();
      dispatch({
        type: 'ADD_GROUP',
        payload: {
          id: newGroupId,
          centreId: groupCentreId,
          name: groupName.trim(),
          nickname: groupNickname.trim() || undefined,
          game: groupGame,
          type: groupType,
          ageRange: groupAgeRange,
          description: groupDescription.trim() || undefined,
          isActive: true,
        },
      });

      // Add each selected member — dispatched after group creation, batched by React
      groupInitialMembers.forEach((userId) => {
        dispatch({
          type: 'ADD_USER_TO_GROUP',
          payload: { userId, groupId: newGroupId },
        });
      });
    }

    setShowGroupModal(false);
    resetGroupForm();
  };

  // Toggle group active status
  const handleToggleGroupActive = (group: Group) => {
    dispatch({
      type: 'UPDATE_GROUP',
      payload: {
        ...group,
        isActive: !group.isActive,
      },
    });
  };

  // Toggle expansion
  const toggleExpand = (cId: string) => {
    setExpandedCentre(expandedCentre === cId ? null : cId);
  };

  // Format date
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminShell title="Manage Centres">
      <div className="admin-centres animate-fade-in">
        {/* Header Actions */}
        <div className="admin-centres__header">
          <div className="admin-centres__search">
            <Search size={18} className="admin-centres__search-icon" />
            <input
              type="text"
              className="input admin-centres__search-input"
              placeholder="Search centres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSuperAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddCentre}
            >
              <Plus size={16} />
              Add Centre
            </button>
          )}
        </div>

        {/* Centres List */}
        <div className="admin-centres__list">
          {filteredCentres.length > 0 ? (
            filteredCentres.map((centre) => {
              const groups = getCentreGroups(centre.id);
              const userCount = getCentreUserCount(centre.id);
              const adminCount = getCentreAdminCount(centre.id);
              const isExpanded = expandedCentre === centre.id;

              return (
                <div
                  key={centre.id}
                  className={`admin-centre-card ${centre.isActive ? '' : 'admin-centre-card--inactive'}`}
                >
                  <div className="admin-centre-card__main">
                    <div className="admin-centre-card__icon">
                      <Building2 size={28} />
                    </div>

                    <div className="admin-centre-card__info">
                      <div className="admin-centre-card__header-row">
                        <h3 className="admin-centre-card__name">
                          {centre.name}
                          {!centre.isActive && (
                            <span className="admin-centre-card__inactive-badge">
                              Inactive
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="admin-centre-card__meta">
                        <span className="admin-centre-card__location">
                          <MapPin size={14} />
                          {centre.location}, {centre.country}
                        </span>
                        <span className="admin-centre-card__users">
                          <Users size={14} />
                          {userCount} users, {adminCount} admins
                        </span>
                        <span className="admin-centre-card__groups">
                          <Gamepad2 size={14} />
                          {groups.length} groups
                        </span>
                        <span className="admin-centre-card__created">
                          <Calendar size={14} />
                          Created {formatDate(centre.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-centre-card__actions">
                      {isSuperAdmin && (
                        <>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleOpenEditCentre(centre)}
                            title="Edit centre"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`btn btn-ghost btn-sm btn-icon ${centre.isActive ? '' : 'text-success'}`}
                            onClick={() => handleToggleCentreActive(centre)}
                            title={centre.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={16} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => toggleExpand(centre.id)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content - groups */}
                  {isExpanded && (
                    <div className="admin-centre-card__expanded animate-fade-in-down">
                      <div className="admin-centre-card__groups-header">
                        <h4 className="admin-centre-card__section-title">
                          Groups ({groups.length})
                        </h4>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenAddGroup(centre.id)}
                        >
                          <Plus size={14} />
                          Add Group
                        </button>
                      </div>

                      {groups.length > 0 ? (
                        <div className="admin-centre-card__groups-list">
                          {groups.map((group) => (
                            <div
                              key={group.id}
                              className={`admin-group-item ${group.isActive ? '' : 'admin-group-item--inactive'}`}
                            >
                              <div className="admin-group-item__info">
                                <span className="admin-group-item__name">
                                  {group.name}
                                  {group.nickname && (
                                    <span className="admin-group-item__nickname">
                                      <Tag size={10} />
                                      {group.nickname}
                                    </span>
                                  )}
                                  {!group.isActive && (
                                    <span className="admin-group-item__inactive">Inactive</span>
                                  )}
                                </span>
                                <span className="admin-group-item__details">
                                  {group.game} • {group.type} • Ages {group.ageRange}
                                </span>
                              </div>
                              <div className="admin-group-item__actions">
                                <button
                                  className="btn btn-ghost btn-sm btn-icon"
                                  onClick={() => handleOpenEditGroup(group)}
                                  title="Edit group"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className={`btn btn-ghost btn-sm btn-icon ${group.isActive ? '' : 'text-success'}`}
                                  onClick={() => handleToggleGroupActive(group)}
                                  title={group.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  <Power size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="admin-centre-card__empty">
                          No groups created yet. Add a group to organize participants.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Building2 size={40} className="empty-state-icon" />
              <p className="empty-state-title">No centres found</p>
              <p className="empty-state-description">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : isSuperAdmin
                    ? 'Create your first centre to get started.'
                    : 'No centre is assigned to your account.'}
              </p>
            </div>
          )}
        </div>

        {/* Centre Modal */}
        {showCentreModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">
                  {editingCentre ? 'Edit Centre' : 'Add New Centre'}
                </h2>
                <button
                  className="admin-modal__close"
                  onClick={() => {
                    setShowCentreModal(false);
                    resetCentreForm();
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCentre} className="admin-modal__body">
                {centreError && (
                  <div className="admin-form-error">{centreError}</div>
                )}

                <div className="form-group">
                  <label className="label label-required" htmlFor="centre-name">
                    Centre Name
                  </label>
                  <input
                    id="centre-name"
                    type="text"
                    className="input"
                    value={centreName}
                    onChange={(e) => setCentreName(e.target.value)}
                    placeholder="e.g., Wishaw YMCA"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="centre-location">
                    Location
                  </label>
                  <input
                    id="centre-location"
                    type="text"
                    className="input"
                    value={centreLocation}
                    onChange={(e) => setCentreLocation(e.target.value)}
                    placeholder="e.g., Wishaw, North Lanarkshire"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="centre-country">
                    Country
                  </label>
                  <select
                    id="centre-country"
                    className="select"
                    value={centreCountry}
                    onChange={(e) => setCentreCountry(e.target.value as Centre['country'])}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowCentreModal(false);
                      resetCentreForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCentre ? 'Save Changes' : 'Add Centre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Modal */}
        {showGroupModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">
                  {editingGroup ? 'Edit Group' : 'Add New Group'}
                </h2>
                <button
                  className="admin-modal__close"
                  onClick={() => {
                    setShowGroupModal(false);
                    resetGroupForm();
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGroup} className="admin-modal__body">
                {groupError && (
                  <div className="admin-form-error">{groupError}</div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="label label-required" htmlFor="group-name">
                      Group Name
                    </label>
                    <input
                      id="group-name"
                      type="text"
                      className="input"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Monday Minecraft Juniors"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="group-nickname">
                      Nickname / Tag
                    </label>
                    <input
                      id="group-nickname"
                      type="text"
                      className="input"
                      value={groupNickname}
                      onChange={(e) => setGroupNickname(e.target.value)}
                      placeholder="e.g., MC Jnrs"
                      maxLength={12}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label label-required" htmlFor="group-game">
                      Game
                    </label>
                    <select
                      id="group-game"
                      className="select"
                      value={groupGame}
                      onChange={(e) => setGroupGame(e.target.value as Game)}
                    >
                      {GAMES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label label-required" htmlFor="group-type">
                      Type
                    </label>
                    <select
                      id="group-type"
                      className="select"
                      value={groupType}
                      onChange={(e) => setGroupType(e.target.value as GroupType)}
                    >
                      {GROUP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label label-required" htmlFor="group-age">
                    Age Range
                  </label>
                  <input
                    id="group-age"
                    type="text"
                    className="input"
                    value={groupAgeRange}
                    onChange={(e) => setGroupAgeRange(e.target.value)}
                    placeholder="e.g., 8-14"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="group-desc">
                    Description
                  </label>
                  <textarea
                    id="group-desc"
                    className="textarea"
                    rows={2}
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Optional notes about this group..."
                  />
                </div>

                {!editingGroup && (
                  <div className="form-group">
                    <label className="label label-required" htmlFor="group-members">
                      Initial Members
                      <span className="label-hint"> (at least 1 required)</span>
                    </label>
                    <select
                      id="group-members"
                      className="select"
                      multiple
                      size={4}
                      value={groupInitialMembers}
                      onChange={(e) =>
                        setGroupInitialMembers(
                          Array.from(e.target.selectedOptions, (o) => o.value)
                        )
                      }
                    >
                      {state.users
                        .filter((u) => u.centreId === groupCentreId && u.role === 'user' && u.isActive)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.displayName} (@{u.username})
                          </option>
                        ))}
                    </select>
                    <p className="form-hint">Hold Ctrl / Cmd to select multiple.</p>
                  </div>
                )}

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowGroupModal(false);
                      resetGroupForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingGroup ? 'Save Changes' : 'Add Group'}
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
