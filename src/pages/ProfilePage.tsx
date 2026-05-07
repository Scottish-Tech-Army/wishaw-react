import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
import api from '../services/api';
import { Loading } from '../components/ui';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import type { Profile } from '../types';

export default function ProfilePage() {
  const { profile: storeProfile, updateProfile } = useAuthStore();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => { setForm(p); setLoading(false); });
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const result = await api.uploadPhoto(file);
      if (result?.photoUrl) {
        setForm((f) => ({ ...f, photoUrl: result.photoUrl }));
        const current = useAuthStore.getState().profile;
        if (current) updateProfile({ ...current, photoUrl: result.photoUrl });
        toast.success('Photo updated');
      }
    } catch { toast.error('Photo upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(form);
      updateProfile(updated);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="page-header">Profile</h1>
      <div className="card space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="profile-photo-upload" className="cursor-pointer group relative">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary-500/30 group-hover:border-primary-400 transition-colors" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 text-3xl font-semibold">
                {form.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs shadow-lg">
              <Camera className="w-3 h-3" />
            </div>
            <input id="profile-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
          <div><p className="text-lg font-semibold text-white">{form.displayName}</p><p className="text-sm text-surface-400">{form.firstName} {form.lastName}</p>{uploading && <p className="text-xs text-primary-400">Uploading...</p>}</div>
        </div>
        <div><label className="label">Display Name</label><input className="input" value={form.displayName ?? ''} onChange={set('displayName')} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input className="input" value={form.firstName ?? ''} onChange={set('firstName')} /></div>
          <div><label className="label">Last Name</label><input className="input" value={form.lastName ?? ''} onChange={set('lastName')} /></div>
        </div>
        <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth ?? ''} onChange={set('dateOfBirth')} max={new Date().toISOString().split('T')[0]} /></div>
        <div><label className="label">Bio</label><textarea className="input" rows={3} value={form.bio ?? ''} onChange={set('bio')} /></div>
        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}
