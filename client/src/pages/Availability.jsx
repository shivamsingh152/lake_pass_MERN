import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../api/api';
import { formatDateRange } from '../utils/format';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

const blockTypes = {
  maintenance: 'Maintenance',
  blocked: 'Blocked',
  locked_deal: 'Locked Deal',
  holiday: 'Holiday',
};

export default function Availability() {
  const [boats, setBoats] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    boat: '', type: 'maintenance', startDate: '', endDate: '', reason: '',
  });

  const load = async () => {
    const [boatsRes, blocksRes] = await Promise.all([
      api.get('/boats'),
      api.get('/availability'),
    ]);
    setBoats(boatsRes.data.filter((b) => b.isActive));
    setBlocks(blocksRes.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/availability', form);
    setModal(false);
    setForm({ boat: '', type: 'maintenance', startDate: '', endDate: '', reason: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this block?')) return;
    await api.delete(`/availability/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Availability & Scheduling</h1>
          <p className="text-slate-500">Manage maintenance, blocked dates, and turnaround buffers</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Block Dates
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Boat</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Type</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Dates</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Reason</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blocks.map((block) => (
              <tr key={block._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{block.boat?.name}</td>
                <td className="p-4"><Badge status={block.type} /></td>
                <td className="p-4 text-sm">{formatDateRange(block.startDate, block.endDate)}</td>
                <td className="p-4 text-sm text-slate-500">{block.reason || '—'}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(block._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {blocks.length === 0 && (
          <p className="p-8 text-center text-slate-500">No blocked periods. All boats are available.</p>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Block Availability">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Boat</label>
            <select className="input" value={form.boat} onChange={(e) => setForm({ ...form, boat: e.target.value })} required>
              <option value="">Select boat</option>
              {boats.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Block Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(blockTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Annual engine service" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Block</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
