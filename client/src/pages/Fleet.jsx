import { useEffect, useState } from 'react';
import { Plus, Ship, Edit, Trash2 } from 'lucide-react';
import api from '../api/api';
import { formatCurrency, boatTypes } from '../utils/format';
import Modal from '../components/Modal';

const emptyBoat = {
  name: '', type: 'pontoon', description: '', capacity: 6, length: 20,
  dailyRate: 299, hourlyRate: 50, turnaroundHours: 2, features: '',
};

export default function Fleet() {
  const [boats, setBoats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBoat);
  const [loading, setLoading] = useState(true);

  const loadBoats = () => {
    api.get('/boats').then((res) => {
      setBoats(res.data.filter((b) => b.isActive));
      setLoading(false);
    });
  };

  useEffect(() => { loadBoats(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyBoat);
    setModal(true);
  };

  const openEdit = (boat) => {
    setEditing(boat);
    setForm({
      ...boat,
      features: boat.features?.join(', ') || '',
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      capacity: Number(form.capacity),
      length: Number(form.length),
      dailyRate: Number(form.dailyRate),
      hourlyRate: Number(form.hourlyRate),
      turnaroundHours: Number(form.turnaroundHours),
    };

    if (editing) {
      await api.put(`/boats/${editing._id}`, payload);
    } else {
      await api.post('/boats', payload);
    }
    setModal(false);
    loadBoats();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this boat from fleet?')) return;
    await api.delete(`/boats/${id}`);
    loadBoats();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-lake-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Management</h1>
          <p className="text-slate-500">Manage your boats and fleet availability</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Boat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boats.map((boat) => (
          <div key={boat._id} className="card overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-lake-400 to-lake-600 flex items-center justify-center">
              <Ship className="w-16 h-16 text-white/80" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{boat.name}</h3>
                  <p className="text-sm text-slate-500">{boatTypes[boat.type]} · {boat.capacity} guests</p>
                </div>
                <span className="text-lg font-bold text-lake-600">{formatCurrency(boat.dailyRate)}/day</span>
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{boat.description}</p>
              {boat.features?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {boat.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs bg-slate-100 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(boat)} className="btn-secondary flex-1 text-xs">
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(boat._id)} className="btn-secondary text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {boats.length === 0 && (
        <div className="card p-12 text-center">
          <Ship className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No boats in fleet. Add your first boat to get started.</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Boat' : 'Add New Boat'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Boat Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(boatTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div>
              <label className="label">Daily Rate ($)</label>
              <input type="number" className="input" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Length (ft)</label>
              <input type="number" className="input" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Features (comma separated)</label>
              <input className="input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Bimini top, GPS, Cooler" />
            </div>
            <div>
              <label className="label">Turnaround Buffer (hours)</label>
              <input type="number" className="input" value={form.turnaroundHours} onChange={(e) => setForm({ ...form, turnaroundHours: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add Boat'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
