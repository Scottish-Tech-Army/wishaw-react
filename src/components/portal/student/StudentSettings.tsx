import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../portal.css";
import { useAuth } from "../../../context/AuthContext";
import { useStudentProfile } from "../../../hooks/useStudentProfile";
import { updateStudentProfile, changePassword, uploadAvatar, ApiError } from "../../../api/index";
import { DEFAULT_AVATAR_URL } from "../../../constants";

export default function StudentSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.studentId ?? null;

  // Guard: redirect non-students and unauthenticated visitors out of the portal.
  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // ── profile hook ─────────────────────────────────────────────────────────
  const {
    data: profile,
    loading: profileLoading,
    error: profileFetchError,
    refresh,
  } = useStudentProfile(studentId);

  // ── field state ──────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [gamertag, setGamertag] = useState("");
  const [bio, setBio] = useState("");

  // Seed form fields once the backend data arrives
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setGamertag(profile.gamertag);
      setBio(profile.bio);
    }
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // ── save state ───────────────────────────────────────────────────────────
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── avatar state ─────────────────────────────────────────────────────────
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !studentId) return;
    setAvatarError(null);

    // Client-side validation: type and size (max 2 MB)
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2 MB or smaller.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(studentId, file);
      refresh(); // re-fetch profile so avatarUrl reflects the new upload
    } catch (err) {
      if (err instanceof ApiError) {
        setAvatarError(`Upload failed: ${err.message}`);
      } else {
        setAvatarError("Could not connect to the server. Check your network connection.");
      }
    } finally {
      setIsUploadingAvatar(false);
      // Reset the input so the same file can be re-selected after an error
      e.target.value = "";
    }
  }

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── handlers ─────────────────────────────────────────────────────────────
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setProfileSaveError(null);
    setIsSaving(true);
    try {
      await updateStudentProfile(studentId, { username, gamertag, bio });
      refresh();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileSaveError(`Failed to save profile: ${err.message}`);
      } else {
        setProfileSaveError("Could not connect to the server. Check your network connection.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    // ── client-side validation (kept as first layer) ──────────────────────
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // ── backend call ──────────────────────────────────────────────────────
    if (!studentId) return;
    setIsChangingPassword(true);
    try {
      await changePassword(studentId, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setPasswordError("Current password is incorrect.");
      } else if (err instanceof ApiError) {
        setPasswordError(err.message || "Failed to update password. Please try again.");
      } else {
        setPasswordError("Could not connect to the server. Check your network connection.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="sp-settings">
      {/* Page header */}
      <div className="sp-settings__header">
        <h1 className="sp-settings__title">⚙️ Settings</h1>
        <p className="sp-settings__subtitle">Manage your account details and preferences.</p>
      </div>

      {/* Guard: studentId missing — cannot safely load or save settings */}
      {!studentId && (
        <div className="sp-error-card" role="alert">
          <span className="sp-error-card__icon">⚠️</span>
          <p className="sp-error-card__msg">Unable to load settings — no student ID found.</p>
        </div>
      )}

      {/* Only render sections when we have a valid studentId */}
      {studentId && (
        <>
      {/* ── Profile section ───────────────────────────────────────────── */}
      <section className="sp-card sp-settings__section">
        <div className="sp-card__header">
          <h2 className="sp-card__title">👤 Profile</h2>
        </div>

        {/* Loading skeleton */}
        {profileLoading && (
          <div className="sp-settings__form" aria-busy="true" aria-label="Loading profile…">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sp-settings__field">
                <span className="sp-skeleton-block sp-skeleton-block--label" />
                <span className="sp-skeleton-block sp-skeleton-block--wide" />
              </div>
            ))}
          </div>
        )}

        {/* Fetch error */}
        {!profileLoading && profileFetchError && (
          <div className="sp-error-card" role="alert">
            <span className="sp-error-card__icon">⚠️</span>
            <p className="sp-error-card__msg">{profileFetchError}</p>
            <button className="sp-btn sp-btn--ghost" onClick={refresh}>
              Retry
            </button>
          </div>
        )}

        {/* Form — only shown when not loading and no fetch error */}
        {!profileLoading && !profileFetchError && (
          <form className="sp-settings__form" onSubmit={handleProfileSave} noValidate>
            {/* ── Avatar ── */}
            <div className="sp-settings__field sp-settings__field--avatar">
              <label className="sp-settings__label">Avatar</label>
              <div className="sp-settings__avatar-row">
                <img
                  src={profile?.avatarUrl ?? DEFAULT_AVATAR_URL}
                  alt="Current avatar"
                  className="sp-settings__avatar-preview"
                />
                <div className="sp-settings__avatar-controls">
                  <label
                    htmlFor="settings-avatar"
                    className={`sp-btn sp-btn--ghost${isUploadingAvatar ? " sp-btn--disabled" : ""}`}
                  >
                    {isUploadingAvatar ? "Uploading…" : "📷 Change Avatar"}
                  </label>
                  <input
                    id="settings-avatar"
                    type="file"
                    accept="image/*"
                    className="sp-settings__avatar-input"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                  <span className="sp-settings__hint">JPEG, PNG or GIF · max 2 MB</span>
                  {avatarError && (
                    <span className="sp-settings__error-msg">⚠️ {avatarError}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="sp-settings__field">
              <label className="sp-settings__label" htmlFor="settings-username">
                Username
              </label>
              <input
                id="settings-username"
                type="text"
                className="sp-settings__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@your_username"
                autoComplete="username"
              />
              <span className="sp-settings__hint">
                This is the name you use to login.
              </span>
            </div>

            {/* Gamertag */}
            <div className="sp-settings__field">
              <label className="sp-settings__label" htmlFor="settings-gamertag">
                Gamertag
              </label>
              <input
                id="settings-gamertag"
                type="text"
                className="sp-settings__input"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                placeholder="Your in-game name"
                autoComplete="nickname"
              />
              <span className="sp-settings__hint">
                Shown as your display name on your profile.
              </span>
            </div>

            {/* Bio */}
            <div className="sp-settings__field">
              <label className="sp-settings__label" htmlFor="settings-bio">
                Bio
              </label>
              <textarea
                id="settings-bio"
                className="sp-settings__textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell the community a bit about yourself…"
              />
              <span className="sp-settings__hint">
                Displayed on your public{" "}
                <Link to="/student/profile" className="sp-settings__inline-link">
                  profile page
                </Link>
                .
              </span>
            </div>

            <div className="sp-settings__actions">
              {profileSaveError && (
                <span className="sp-settings__error-msg">⚠️ {profileSaveError}</span>
              )}
              {profileSaved && (
                <span className="sp-settings__saved-msg">✅ Profile saved!</span>
              )}
              <button
                type="submit"
                className="sp-btn sp-btn--primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Password section ──────────────────────────────────────────── */}
      <section className="sp-card sp-settings__section">
        <div className="sp-card__header">
          <h2 className="sp-card__title">🔒 Change Password</h2>
          <button
            type="button"
            className="sp-btn sp-btn--ghost sp-settings__show-pass-btn"
            onClick={() => setShowPasswords((v) => !v)}
            aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
          >
            {showPasswords ? "🙈 Hide" : "👁️ Show"}
          </button>
        </div>

        <form className="sp-settings__form" onSubmit={handlePasswordSave} noValidate>
          <div className="sp-settings__field">
            <label className="sp-settings__label" htmlFor="settings-current-pw">
              Current Password
            </label>
            <input
              id="settings-current-pw"
              type={showPasswords ? "text" : "password"}
              className="sp-settings__input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
            />
          </div>

          <div className="sp-settings__field">
            <label className="sp-settings__label" htmlFor="settings-new-pw">
              New Password
            </label>
            <input
              id="settings-new-pw"
              type={showPasswords ? "text" : "password"}
              className="sp-settings__input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="sp-settings__field">
            <label className="sp-settings__label" htmlFor="settings-confirm-pw">
              Confirm New Password
            </label>
            <input
              id="settings-confirm-pw"
              type={showPasswords ? "text" : "password"}
              className="sp-settings__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat new password"
            />
          </div>

          <div className="sp-settings__actions">
            {passwordError && (
              <span className="sp-settings__error-msg">⚠️ {passwordError}</span>
            )}
            {passwordSaved && (
              <span className="sp-settings__saved-msg">✅ Password updated!</span>
            )}
            <button
                type="submit"
                className="sp-btn sp-btn--primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating…" : "Update Password"}
              </button>
          </div>
        </form>
      </section>
        </>
      )}
    </div>
  );
}
