import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { progressApi, userApi } from '../services/api';
import BadgeCard from '../components/BadgeCard';
import Spinner from '../components/Spinner';
import { formatAge } from '../utils/age';

export default function ProfilePage() {
  const { userId: paramId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const targetId = paramId || user?.userId;
  const isOwnProfile = !paramId || String(paramId) === String(user?.userId);

  useEffect(() => {
    if (!targetId) return;
    async function load() {
      try {
        const res = await progressApi.getProfile(targetId);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetId]);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await userApi.uploadProfileImage(targetId, file);
      // Reload profile to get updated image URL
      const res = await progressApi.getProfile(targetId);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await userApi.changePassword(targetId, { currentPassword, newPassword });
      setPwSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  }

  if (loading) return <Spinner />;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div>
      <div className="page-header page-header--profile">
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              cursor: isOwnProfile ? 'pointer' : 'default',
              border: '3px solid var(--primary)',
            }}
            onClick={() => isOwnProfile && fileInputRef.current?.click()}
            title={isOwnProfile ? 'Click to change profile picture' : ''}
          >
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}
          </div>
          {isOwnProfile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                className="btn btn-outline btn-sm"
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  padding: 0,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--surface)',
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload profile image"
              >
                {uploading ? '⏳' : '📷'}
              </button>
            </>
          )}
        </div>
        <div className="page-header__content">
          <h1>👤 {profile.displayName || profile.username}</h1>
          <p>{profile.centreName || 'No centre assigned'}</p>
          {profile.dob && <p>🎂 Age: {formatAge(profile.dob)} (DOB: {profile.dob})</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{profile.overallXp}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.completedSubBadges}</div>
          <div className="stat-label">Challenges Completed</div>
        </div>
      </div>

      {/* Badge cards */}
      <h2 style={{ marginBottom: '1rem' }}>🏅 Badge Progress</h2>
      <div className="card-grid">
        {profile.badges.map((b) => (
          <BadgeCard key={b.badgeId} badge={b} />
        ))}
      </div>

      {/* Change Password — own profile only */}
      {isOwnProfile && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>🔒 Change Password</h2>
          {!showPasswordForm ? (
            <button className="btn btn-outline" onClick={() => { setShowPasswordForm(true); setPwError(''); setPwSuccess(''); }}>
              Reset Password
            </button>
          ) : (
            <div className="card" style={{ maxWidth: 450 }}>
              <form onSubmit={handleChangePassword}>
                {pwError && <div className="error-msg">{pwError}</div>}
                {pwSuccess && <div className="card" style={{ background: 'var(--surface-hover)', marginBottom: '1rem', border: '1px solid var(--secondary)', padding: '0.75rem' }}><p style={{ color: 'var(--secondary)', margin: 0 }}>✅ {pwSuccess}</p></div>}
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input className="form-control" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input className="form-control" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input className="form-control" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div className="flex gap-1" style={{ marginTop: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={pwLoading}>{pwLoading ? 'Saving…' : 'Change Password'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setShowPasswordForm(false); setPwError(''); setPwSuccess(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
