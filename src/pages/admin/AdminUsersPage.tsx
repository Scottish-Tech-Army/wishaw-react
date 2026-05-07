import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, centreApi } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { Link } from 'react-router-dom';
import { formatAge } from '../../utils/age';

export default function AdminUsersPage() {
  const { user, isMainAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [centres, setCentres] = useState([]);
  const [filterCentre, setFilterCentre] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', displayName: '', role: '', centreId: '', dob: '' });
  const [error, setError] = useState('');

  const TODAY = new Date().toISOString().split('T')[0];  // yyyy-mm-dd
  const MIN_DOB = '1900-01-01';
  const MIN_AGE_YEARS = 3;

  function validateDob(dob: string): string | null {
    if (!dob) return null; // emptiness handled separately by required check
    const dobDate = new Date(dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(dobDate.getTime())) return 'Please enter a valid date';
    if (dobDate > today) return 'Date of birth cannot be in the future';
    if (dob < MIN_DOB) return 'Date of birth cannot be before 1900';

    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(minAgeDate.getFullYear() - MIN_AGE_YEARS);
    if (dobDate > minAgeDate) return `Player must be at least ${MIN_AGE_YEARS} years old`;

    return null;
  }

  useEffect(() => {
    Promise.all([userApi.getAll(), centreApi.getAll()])
      .then(([uRes, cRes]) => {
        setUsers(uRes.data);
        setCentres(cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      username: '',
      password: '',
      displayName: '',
      role: isMainAdmin ? '' : 'USER',
      centreId: isMainAdmin ? '' : (user.centreId || ''),
      dob: ''
    });
    setError('');
    setShowModal(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({
      username: u.username,
      password: '',
      displayName: u.displayName || '',
      role: u.role,
      centreId: u.centreId || '',
      dob: u.dob || ''
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.displayName || !form.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!form.role) {
      setError('Please select a role');
      return;
    }
    if (!form.centreId) {
      setError('Please select a centre');
      return;
    }
    if (!editing && !form.dob) {
      setError('Date of birth is required');
      return;
    }
    if (form.dob) {
      const dobError = validateDob(form.dob);
      if (dobError) {
        setError(dobError);
        return;
      }
    }
    try {
      if (editing) {
        const payload = {
          displayName: form.displayName,
          role: form.role,
          centreId: form.centreId ? Number(form.centreId) : null,
          dob: form.dob || null
        };
        await userApi.update(editing.id, payload);
      } else {
        const payload = {
          username: form.username,
          password: form.password,
          displayName: form.displayName,
          role: form.role,
          centreId: form.centreId ? Number(form.centreId) : null,
          dob: form.dob || null
        };
        await userApi.create(payload);
      }
      setShowModal(false);
      // Reload
      const uRes = await userApi.getAll();
      setUsers(uRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userApi.remove(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  // Centre admin only sees their own centre's users
  let filtered = users;
  if (!isMainAdmin && user.centreId) {
    filtered = filtered.filter((u) => u.centreId === user.centreId);
  } else if (filterCentre) {
    filtered = filtered.filter((u) => String(u.centreId) === filterCentre);
  }

  // Roles available for creation
  const roleOptions = isMainAdmin
    ? [{ value: 'USER', label: 'Player' }, { value: 'CENTRE_ADMIN', label: 'Centre Admin' }, { value: 'MAIN_ADMIN', label: 'Main Admin' }]
    : [{ value: 'USER', label: 'Player' }];

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-row mb-2">
        <div className="page-header">
          <h1>👥 Manage Users</h1>
          <p>Create, edit and manage users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New User</button>
      </div>

      {isMainAdmin && (
        <div className="filter-bar">
          <select className="form-control" style={{ maxWidth: 250 }} value={filterCentre} onChange={(e) => setFilterCentre(e.target.value)}>
            <option value="">All Centres</option>
            {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Desktop table */}
      <table className="data-table desktop-only">
        <thead>
          <tr><th>ID</th><th>Username</th><th>Display Name</th><th>Age</th><th>DOB</th><th>Role</th><th>Centre</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td><strong>{u.username}</strong></td>
              <td>{u.displayName || '—'}</td>
              <td>{formatAge(u.dob)}</td>
              <td>{u.dob || '—'}</td>
              <td><span className={`level-tag ${u.role === 'MAIN_ADMIN' ? 'GOLD' : u.role === 'CENTRE_ADMIN' ? 'SILVER' : 'BRONZE'}`}>{u.role.replace('_', ' ')}</span></td>
              <td>{u.centreName || '—'}</td>
              <td>
                <div className="flex gap-1">
                  <Link to={`/profile/${u.id}`} className="btn btn-outline btn-sm">Profile</Link>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-light">No users found</td></tr>}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="mobile-card-list">
        {filtered.map((u) => (
          <div className="mobile-card" key={u.id}>
            <div className="mobile-card-row"><span className="mobile-card-label">Username</span><span className="mobile-card-value"><strong>{u.username}</strong></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Name</span><span className="mobile-card-value">{u.displayName || '—'}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Age</span><span className="mobile-card-value">{formatAge(u.dob)}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">DOB</span><span className="mobile-card-value">{u.dob || '—'}</span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Role</span><span className="mobile-card-value"><span className={`level-tag ${u.role === 'MAIN_ADMIN' ? 'GOLD' : u.role === 'CENTRE_ADMIN' ? 'SILVER' : 'BRONZE'}`}>{u.role.replace('_', ' ')}</span></span></div>
            <div className="mobile-card-row"><span className="mobile-card-label">Centre</span><span className="mobile-card-value">{u.centreName || '—'}</span></div>
            <div className="mobile-card-actions">
              <Link to={`/profile/${u.id}`} className="btn btn-outline btn-sm">Profile</Link>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-light text-center">No users found</p>}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit User' : 'New User'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            {!editing && (
              <>
                <div className="form-group">
                  <label>Username</label>
                  <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Display Name</label>
              <input className="form-control" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              {isMainAdmin ? (
                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
                  <option value="">-- Select a Role --</option>
                  {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              ) : (
                <input className="form-control" value="Player" disabled />
              )}
            </div>
            <div className="form-group">
              <label>Centre</label>
              {isMainAdmin ? (
                <select className="form-control" value={form.centreId} onChange={(e) => setForm({ ...form, centreId: e.target.value })} required>
                  <option value="">-- Select a Centre --</option>
                  {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input className="form-control" value={centres.find(c => c.id === user.centreId)?.name || 'Your Centre'} disabled />
              )}
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input className="form-control" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required={!editing} min={MIN_DOB} max={TODAY} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
