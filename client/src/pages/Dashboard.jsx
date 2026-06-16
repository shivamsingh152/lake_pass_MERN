import { useEffect, useState } from 'react';
import { Ship, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import Badge from '../components/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const marinaId = user?.marina?._id || user?.marina;
    if (!marinaId) return;
    api.get(`/marinas/${marinaId}/dashboard`).then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-lake-600 border-t-transparent" /></div>;
  }

  const stats = [
    { label: 'Active Boats', value: data?.stats?.boats || 0, icon: Ship, color: 'bg-blue-500' },
    { label: 'Reservations', value: data?.stats?.reservations || 0, icon: Calendar, color: 'bg-green-500' },
    { label: 'Customers', value: data?.stats?.customers || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Revenue', value: formatCurrency(data?.stats?.revenue), icon: DollarSign, color: 'bg-lake-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">Welcome back! Here's your marina overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lake-600" />
              Upcoming Reservations
            </h2>
            <Link to="/reservations" className="text-sm text-lake-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.upcoming?.length === 0 && (
              <p className="p-6 text-slate-500 text-sm">No upcoming reservations</p>
            )}
            {data?.upcoming?.map((r) => (
              <div key={r._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.customer?.firstName} {r.customer?.lastName}</p>
                  <p className="text-sm text-slate-500">{r.boat?.name} · {formatDate(r.startDate)}</p>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentReservations?.map((r) => (
              <div key={r._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.boat?.name}</p>
                  <p className="text-sm text-slate-500">{r.customer?.firstName} {r.customer?.lastName}</p>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
