import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleApi, centreApi } from '../services/api';
import Spinner from '../components/Spinner';

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    centreApi.getAll().then((res) => setCentres(res.data)).catch(() => {});
    loadModules();
  }, []);

  async function loadModules(centreId?: string | null) {
    setLoading(true);
    try {
      const res = centreId
        ? await moduleApi.getByCentre(centreId)
        : await moduleApi.getAll();
      setModules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCentreChange(e) {
    const val = e.target.value;
    setSelectedCentre(val);
    loadModules(val || null);
  }

  return (
    <div>
      <div className="page-header">
        <h1>📚 Modules</h1>
        <p>Game-based learning programmes (12–16 weeks each)</p>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ maxWidth: 250 }} value={selectedCentre} onChange={handleCentreChange}>
          <option value="">All Centres (Global)</option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card-grid">
          {modules.map((m) => (
            <Link to={`/modules/${m.id}`} key={m.id} className="module-card-link">
              <div className="card module-card">
                <div className="flex justify-between items-center">
                  <h3>{m.name}</h3>
                  {m.approved ? (
                    <span className="level-tag GOLD" style={{ fontSize: '0.7rem' }}>✓ Approved</span>
                  ) : (
                    <span className="level-tag SILVER" style={{ fontSize: '0.7rem' }}>Pending</span>
                  )}
                </div>
                <p className="text-light text-sm mt-1">{m.description || 'No description'}</p>
                <p className="text-sm mt-1">🏢 {m.centreName || '—'}</p>
              </div>
            </Link>
          ))}
          {modules.length === 0 && <p className="text-light">No modules found.</p>}
        </div>
      )}
    </div>
  );
}
