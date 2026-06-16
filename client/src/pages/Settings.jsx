import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const [marina, setMarina] = useState(null);
  const [saved, setSaved] = useState(false);
  const canManage = ['owner', 'manager'].includes(user?.role);

  useEffect(() => {
    const marinaId = user?.marina?._id || user?.marina;
    if (marinaId && canManage) {
      api.get(`/marinas/${marinaId}`).then((res) => setMarina(res.data));
    }
  }, [user, canManage]);

  if (!canManage) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field, value) => {
    setMarina({ ...marina, [field]: value });
    setSaved(false);
  };

  const handleSettingsChange = (field, value) => {
    setMarina({ ...marina, settings: { ...marina.settings, [field]: value } });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/marinas/${marina._id}`, marina);
    setSaved(true);
  };

  if (!marina) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-lake-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Marina Settings</h1>
        <p className="text-slate-500">Configure your marina profile and payment settings</p>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Marina Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Marina Name</label>
              <input className="input" value={marina.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={marina.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={marina.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input className="input" value={marina.address} onChange={(e) => handleChange('address', e.target.value)} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={marina.city} onChange={(e) => handleChange('city', e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" value={marina.state} onChange={(e) => handleChange('state', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Website</label>
              <input className="input" value={marina.website} onChange={(e) => handleChange('website', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Payment & Booking Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Deposit Percent (%)</label>
              <input type="number" className="input" value={marina.settings?.depositPercent} onChange={(e) => handleSettingsChange('depositPercent', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Damage Fee ($)</label>
              <input type="number" className="input" value={marina.settings?.damageFee} onChange={(e) => handleSettingsChange('damageFee', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Turnaround Buffer (hours)</label>
              <input type="number" className="input" value={marina.settings?.turnaroundHours} onChange={(e) => handleSettingsChange('turnaroundHours', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Stripe Account ID</label>
              <input className="input" value={marina.stripeAccountId || ''} onChange={(e) => handleChange('stripeAccountId', e.target.value)} placeholder="acct_..." />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
