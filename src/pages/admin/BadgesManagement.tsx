import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loading, Modal } from '../../components/ui';
import toast from 'react-hot-toast';
import type { MainBadge } from '../../types';

export default function BadgesManagement() {
  const [badges, setBadges] = useState<MainBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '', description: '' });

  useEffect(() => { api.getBadges().then((b) => setBadges(b as MainBadge[])).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    try {
      const b = await api.createBadge(form);
      setBadges((p) => [...p, b as MainBadge]);
      setModal(false);
      setForm({ name: '', icon: '', description: '' });
      toast.success('Badge created');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Badges Management</h1>
        <button className="btn-primary" onClick={() => setModal(true)}>+ Add Badge</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div key={b.id} className="card text-center">
            <span className="text-4xl">{b.icon}</span>
            <h3 className="font-semibold text-white mt-2">{b.name}</h3>
            <p className="text-sm text-surface-400 mt-1">{b.description}</p>
          </div>
        ))}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Badge">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Icon (emoji)</label><input className="input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <button className="btn-primary w-full" onClick={handleCreate}>Create</button>
        </div>
      </Modal>
    </div>
  );
}
