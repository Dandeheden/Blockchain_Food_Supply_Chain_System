import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, stageIcon, conditionBadgeClass, statusBadgeClass } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Package, Truck, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const COLORS = ['#16a34a','#2563eb','#d97706','#dc2626'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/batches/stats'),
      api.get('/batches?limit=5'),
    ]).then(([statsRes, batchRes]) => {
      setStats(statsRes.data);
      setBatches(batchRes.data.batches?.slice(0, 5) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Batches',    value: stats?.stats?.total || 0,     icon: Package,       colorClass: 'text-blue-600',  bgClass: 'bg-blue-50' },
    { label: 'In Transit',       value: stats?.stats?.inTransit || 0, icon: Truck,         colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
    { label: 'Delivered',        value: stats?.stats?.delivered || 0, icon: CheckCircle,   colorClass: 'text-green-600', bgClass: 'bg-green-50' },
    { label: 'Spoilage Reports', value: stats?.stats?.spoiled || 0,   icon: AlertTriangle, colorClass: 'text-red-600',   bgClass: 'bg-red-50' },
  ];

  const chartData = [
    { name: 'Total',     value: stats?.stats?.total || 0 },
    { name: 'In Transit',value: stats?.stats?.inTransit || 0 },
    { name: 'Delivered', value: stats?.stats?.delivered || 0 },
    { name: 'Spoiled',   value: stats?.stats?.spoiled || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}! Here's your supply chain overview.</p>
        </div>
        {(user?.role === 'farmer' || user?.role === 'admin') && (
          <Link to="/batch/new" className="btn-primary">+ Add Batch</Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="card">
            <div className={`w-10 h-10 ${card.bgClass} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.colorClass}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title">Batch Overview</h3>
          <p className="text-sm text-gray-400 mb-4">Distribution of batch statuses</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title">Status Breakdown</h3>
          <p className="text-sm text-gray-400 mb-4">Current batch status distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent batches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Batches</h3>
          <Link to="/track" className="text-sm text-green-700 hover:underline">View all →</Link>
        </div>
        {batches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No batches yet.{' '}
              {(user?.role === 'farmer' || user?.role === 'admin') && (
                <Link to="/batch/new" className="text-green-700 hover:underline">Register the first one!</Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map(b => (
              <Link key={b._id} to={`/batch/${b.batchId}`}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{stageIcon(b.currentStage)}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-green-800">{b.productName}</div>
                    <div className="text-xs text-gray-400 font-mono">{b.batchId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusBadgeClass(b.status)}>{b.status}</span>
                  <div className="text-xs text-gray-400 hidden sm:block">{formatDate(b.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-800">{act.participant?.name || 'Unknown'}</span>
                  <span className="text-sm text-gray-500"> updated </span>
                  <span className="text-sm font-medium text-green-700">{act.batch?.productName || act.batchId}</span>
                  <span className="text-sm text-gray-500"> → </span>
                  <span className="text-sm font-semibold">{stageIcon(act.stage)} {act.stage}</span>
                  <div className="text-xs text-gray-400">{formatDate(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
