/**
 * ManageUsers.tsx – Admin User Management
 *
 * Features:
 *   - User list with search/filter
 *   - Add new user modal
 *   - Edit user details
 *   - Activate/deactivate users
 *   - View user XP summary
 */

import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Search,
  UserPlus,
  Edit2,
  UserCheck,
  UserX,
  Filter,
  ChevronDown,
  X,
  Zap,
  MapPin,
  Cake,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';
import { computeAge } from '../../types';
import type { User, Role, TierThreshold } from '../../types';

type FilterRole = 'all' | Role;
type FilterStatus = 'all' | 'active' | 'inactive';

/** Get tier threshold for XP */
function getTierThreshold(xp: number, thresholds: TierThreshold[]): TierThreshold {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  return sorted.find((t) => xp >= t.minXP) ?? thresholds[0];
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ManageUsers() {
  const { currentUser, isSuperAdmin } = useAuth();
  const { state, dispatch, getTotalXP } = useData();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');
  const [newCentreId, setNewCentreId] = useState(currentUser?.centreId ?? '');
  const [formError, setFormError] = useState('');

  // Filter users based on admin's centre
  const centreId = currentUser?.centreId ?? '';

  const filteredUsers = useMemo(() => {
    let users = state.users;

    // Centre filter (admins only see their centre, superadmins see all)
    if (!isSuperAdmin) {
      users = users.filter((u) => u.centreId === centreId);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      users = users.filter((u) => u.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      users = users.filter((u) =>
        filterStatus === 'active' ? u.isActive : !u.isActive
      );
    }

    return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [state.users, centreId, isSuperAdmin, searchQuery, filterRole, filterStatus]);

  // Handle add user
  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!newUsername.trim() || !newFirstName.trim() || !newLastName.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    // Check if username exists
    if (state.users.some((u) => u.username.toLowerCase() === newUsername.toLowerCase())) {
      setFormError('Username already exists');
      return;
    }

    const displayName = `${newFirstName.trim()} ${newLastName.trim()}`;

    const newUser: User = {
      id: uuidv4(),
      username: newUsername.trim(),
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      displayName,
      dateOfBirth: newDob || undefined,
      role: newRole,
      centreId: newCentreId,
      passwordHash: 'plain:password123', // Default password
      groupIds: [],
      isApproved: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_USER',
      payload: newUser,
    });

    // Reset form
    setNewUsername('');
    setNewFirstName('');
    setNewLastName('');
    setNewDob('');
    setNewRole('user');
    setShowAddModal(false);
  };

  // Handle toggle active
  const handleToggleActive = (user: User) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { ...user, isActive: !user.isActive },
    });
  };

  // Handle edit user
  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    dispatch({
      type: 'UPDATE_USER',
      payload: {
        ...editingUser,
        displayName: `${editingUser.firstName} ${editingUser.lastName}`.trim(),
      },
    });

    setEditingUser(null);
  };

  // Get centre name
  const getCentreName = (cId: string): string => {
    return state.centres.find((c) => c.id === cId)?.name ?? 'Unknown';
  };

  return (
    <AdminShell title="Manage Users">
      <div className="admin-users animate-fade-in">
        {/* Header Actions */}
        <div className="admin-users__header">
          <div className="admin-users__search">
            <Search size={18} className="admin-users__search-icon" />
            <input
              type="text"
              className="input admin-users__search-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-users__actions">
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
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus size={16} />
              Add User
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="admin-users__filters animate-fade-in-down">
            <div className="admin-users__filter-group">
              <label className="label" htmlFor="filter-role">Role</label>
              <select
                id="filter-role"
                className="select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as FilterRole)}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                {isSuperAdmin && <option value="superadmin">Super Admins</option>}
              </select>
            </div>
            <div className="admin-users__filter-group">
              <label className="label" htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="admin-users__list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const userXP = getTotalXP(user.id);
              const tier = getTierThreshold(userXP, state.tierThresholds);

              return (
                <div
                  key={user.id}
                  className={`admin-user-card ${user.isActive ? '' : 'admin-user-card--inactive'}`}
                >
                  <div className="admin-user-card__avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} />
                    ) : (
                      <span>{getInitials(user.displayName)}</span>
                    )}
                  </div>

                  <div className="admin-user-card__info">
                    <div className="admin-user-card__name">
                      {user.displayName}
                      {!user.isActive && (
                        <span className="admin-user-card__inactive-badge">Inactive</span>
                      )}
                    </div>
                    <div className="admin-user-card__meta">
                      <span className="admin-user-card__username">@{user.username}</span>
                      <span className="admin-user-card__role">{user.role}</span>
                    </div>
                  </div>

                  <div className="admin-user-card__stats">
                    <div className="admin-user-card__xp">
                      <Zap size={14} />
                      <span>{userXP.toLocaleString()} XP</span>
                    </div>
                    <div
                      className="admin-user-card__tier"
                      style={{ color: tier.colour }}
                    >
                      {tier.tier}
                    </div>
                    {user.dateOfBirth && (
                      <div className="admin-user-card__age">
                        <Cake size={12} />
                        <span>Age {computeAge(user.dateOfBirth)}</span>
                      </div>
                    )}
                    {isSuperAdmin && (
                      <div className="admin-user-card__centre">
                        <MapPin size={12} />
                        <span>{getCentreName(user.centreId)}</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-user-card__actions">
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setEditingUser(user)}
                      title="Edit user"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={`btn btn-ghost btn-sm btn-icon ${user.isActive ? '' : 'text-success'}`}
                      onClick={() => handleToggleActive(user)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Search size={40} className="empty-state-icon" />
              <p className="empty-state-title">No users found</p>
              <p className="empty-state-description">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Add New User</h2>
                <button
                  className="admin-modal__close"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="admin-modal__body">
                {formError && (
                  <div className="admin-form-error">{formError}</div>
                )}

                <div className="form-group">
                  <label className="label label-required" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="input"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label label-required" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="input"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label label-required" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="input"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="dob">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className="input"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className="select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div className="form-group">
                    <label className="label" htmlFor="centre">
                      Centre
                    </label>
                    <select
                      id="centre"
                      className="select"
                      value={newCentreId}
                      onChange={(e) => setNewCentreId(e.target.value)}
                    >
                      {state.centres.map((centre) => (
                        <option key={centre.id} value={centre.id}>
                          {centre.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="form-hint">
                  Default password will be: <code>password123</code>
                </p>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="admin-modal-overlay">
            <div className="admin-modal animate-scale-in">
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Edit User</h2>
                <button
                  className="admin-modal__close"
                  onClick={() => setEditingUser(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="admin-modal__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="edit-firstName">
                      First Name
                    </label>
                    <input
                      id="edit-firstName"
                      type="text"
                      className="input"
                      value={editingUser.firstName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="edit-lastName">
                      Last Name
                    </label>
                    <input
                      id="edit-lastName"
                      type="text"
                      className="input"
                      value={editingUser.lastName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="edit-dob">
                    Date of Birth
                  </label>
                  <input
                    id="edit-dob"
                    type="date"
                    className="input"
                    value={editingUser.dateOfBirth ?? ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, dateOfBirth: e.target.value || undefined })
                    }
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="edit-role">
                    Role
                  </label>
                  <select
                    id="edit-role"
                    className="select"
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as Role })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div className="form-group">
                    <label className="label" htmlFor="edit-centre">
                      Centre
                    </label>
                    <select
                      id="edit-centre"
                      className="select"
                      value={editingUser.centreId}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, centreId: e.target.value })
                      }
                    >
                      {state.centres.map((centre) => (
                        <option key={centre.id} value={centre.id}>
                          {centre.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setEditingUser(null)}
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
      </div>
    </AdminShell>
  );
}
