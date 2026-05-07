import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loading, Modal } from '../../components/ui';
import toast from 'react-hot-toast';
import type { Sport } from '../../types';

const DEFAULT_SPORT_ICON = '\u{1F3CF}';

function createEmptyForm() {
  return { name: '', icon: DEFAULT_SPORT_ICON, description: '' };
}

export default function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(createEmptyForm);

  useEffect(() => { api.getSports().then(setSports).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    try {
      const s = await api.createSport({ ...form, icon: form.icon.trim() || DEFAULT_SPORT_ICON });
      setSports((p) => [...p, s]);
      setModal(false);
      setForm(createEmptyForm());
      toast.success('Sport created');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Sports Management</h1>
        <button className="btn-primary" onClick={() => { setForm(createEmptyForm()); setModal(true); }}>+ Add Sport</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sports.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{s.icon}</span><h3 className="font-semibold text-white">{s.name}</h3></div>
            <p className="text-sm text-surface-400">{s.description}</p>
          </div>
        ))}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Sport">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Icon (emoji)</label><input className="input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} /></div>
          <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <button className="btn-primary w-full" onClick={handleCreate}>Create</button>
        </div>
      </Modal>
    </div>
  );
}
