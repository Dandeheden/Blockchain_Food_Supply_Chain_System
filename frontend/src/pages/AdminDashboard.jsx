import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate, statusBadgeClass } from '../utils/helpers';
import { Shield, Users, Package, AlertTriangle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [spoilage, setSpoilage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, usersRes, suspRes, spoilRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/suspicious'),
        api.get('/spoilage'),
      ]);
      setOverview(ov.data.overview);
      setUsers(usersRes.data.users);
      setSuspicious(suspRes.data.batches);
      setSpoilage(spoilRes.data.reports);
    } catch {
      toast.error('Failed to load admin data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated.');
    } catch { toast.error('Failed to update user.'); }
  };

  const updateInvestigation = async (id, status) => {
    try {
      await api.patch(`/spoilage/${id}/investigate`, { investigationStatus: status });
      setSpoilage(prev => prev.map(r => r._id === id ? { ...r, investigationStatus: status } : r));
      toast.success('Investigation status updated.');
    } catch { toast.error('Failed to update.'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id:'overview',    label: 'Overview' },
    { id:'users',       label: `Users (${users.length})` },
    { id:'suspicious',  label: `Flagged (${suspicious.length})` },
    { id:'spoilage',    label: `Investigations (${spoilage.length})` },
  ];

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-green-900">Admin / Regulator Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Monitor and manage the food supply chain system</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-green-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && overview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Total Batches',  value: overview.totalBatches,  icon: Package,       c:'text-blue-600',   bg:'bg-blue-50' },
              { label:'Total Users',    value: overview.totalUsers,    icon: Users,         c:'text-purple-600', bg:'bg-purple-50' },
              { label:'Spoilage Reports',value:overview.spoilageCount, icon: AlertTriangle, c:'text-red-600',    bg:'bg-red-50' },
              { label:'Flagged Batches',value: suspicious.length,      icon: Search,        c:'text-amber-600',  bg:'bg-amber-50' },
            ].map(card => (
              <div key={card.label} className="card">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.c}`} />
                </div>
                <div className="text-2xl font-bold">{card.value ?? 0}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            ))}
          </div>

          {suspicious.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Suspicious / Flagged Batches</h3>
              <div className="space-y-2">
                {suspicious.map(b => (
                  <div key={b._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <div className="font-semibold text-sm">{b.productName}</div>
                      <div className="hash-text">{b.batchId}</div>
                    </div>
                    <span className={statusBadgeClass(b.status)}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="section-title mb-4">Recent Spoilage Reports</h3>
            {overview.recentSpoilage?.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No pending spoilage reports.</p>
            ) : (
              <div className="space-y-3">
                {overview.recentSpoilage?.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{r.batch?.productName} — {r.batchId}</div>
                      <span className="badge-warning">{r.investigationStatus}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.reportedBy?.name} ({r.reportedBy?.role}) — {formatDate(r.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="section-title flex-1">All Users</h3>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input w-48 text-sm" placeholder="Search..." />
          </div>
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div>
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email} — {u.role} — {u.organization || 'N/A'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={u.isActive ? 'badge-normal' : 'badge-spoiled'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => toggleUser(u._id)}
                    className="text-xs border rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors">
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <p className="text-center text-gray-400 py-6">No users found.</p>}
          </div>
        </div>
      )}

      {/* Suspicious Tab */}
      {tab === 'suspicious' && (
        <div className="card">
          <h3 className="section-title mb-4">Flagged Batches</h3>
          {suspicious.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No suspicious batches detected.</p>
          ) : (
            <div className="space-y-3">
              {suspicious.map(b => (
                <div key={b._id} className="p-4 border rounded-xl bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{b.productName}</div>
                    <span className={statusBadgeClass(b.status)}>{b.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div>Batch ID: <span className="hash-text">{b.batchId}</span></div>
                    <div>Farmer: {b.farmer?.name || 'Unknown'}</div>
                    <div>Last Updated: {formatDate(b.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Investigations Tab */}
      {tab === 'spoilage' && (
        <div className="card">
          <h3 className="section-title mb-4">Spoilage Investigations</h3>
          {spoilage.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No reports to investigate.</p>
          ) : (
            <div className="space-y-4">
              {spoilage.map(r => (
                <div key={r._id} className="border rounded-2xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm">{r.batch?.productName || r.batchId}</div>
                    <span className={
                      r.investigationStatus === 'Resolved' ? 'badge-normal' :
                      r.investigationStatus === 'Under Investigation' ? 'badge-warning' : 'badge-spoiled'
                    }>{r.investigationStatus}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Stage: <strong>{r.stage}</strong> | Condition: <strong>{r.condition}</strong>
                    {r.temperature != null && <> | Temp: <strong>{r.temperature}°C</strong></>}
                  </div>
                  <p className="text-xs text-gray-500 italic mb-3">{r.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {['Pending','Under Investigation','Resolved','Closed'].map(s => (
                      <button key={s} onClick={() => updateInvestigation(r._id, s)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                          r.investigationStatus === s
                            ? 'bg-green-700 text-white border-green-700'
                            : 'hover:bg-green-50 border-gray-200 text-gray-600'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
