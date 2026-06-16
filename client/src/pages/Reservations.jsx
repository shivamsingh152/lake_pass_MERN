import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard } from 'lucide-react';
import api from '../api/api';
import { formatCurrency, formatDateRange } from '../utils/format';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [boats, setBoats] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    boatId: '', customerId: '', startDate: '', endDate: '', notes: '',
  });

  const load = async () => {
    const [res, boatsRes, custRes] = await Promise.all([
      api.get('/reservations', { params: { search: search || undefined } }),
      api.get('/boats'),
      api.get('/customers'),
    ]);
    setReservations(res.data);
    setBoats(boatsRes.data.filter((b) => b.isActive));
    setCustomers(custRes.data);
  };

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/reservations', form);
    setModal(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/reservations/${id}`, { status });
    load();
  };

  const processPayment = async (id) => {
    await api.post('/payments/confirm-mock', { reservationId: id, paymentType: 'deposit' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reservations & Bookings</h1>
          <p className="text-slate-500">Centralized view of all marina reservations</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by customer or boat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Boat</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Dates</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Payment</th>
              <th className="p-4 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-medium">{r.customer?.firstName} {r.customer?.lastName}</p>
                  <p className="text-xs text-slate-500">{r.customer?.email}</p>
                </td>
                <td className="p-4">{r.boat?.name}</td>
                <td className="p-4 text-sm">{formatDateRange(r.startDate, r.endDate)}</td>
                <td className="p-4 font-medium">{formatCurrency(r.totalAmount)}</td>
                <td className="p-4"><Badge status={r.status} /></td>
                <td className="p-4"><Badge status={r.paymentStatus} /></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {r.paymentStatus === 'unpaid' && (
                      <button onClick={() => processPayment(r._id)} className="btn-secondary text-xs py-1 px-2" title="Collect deposit">
                        <CreditCard className="w-3 h-3" /> Pay
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <button onClick={() => updateStatus(r._id, 'confirmed')} className="btn-secondary text-xs py-1 px-2">Confirm</button>
                    )}
                    {r.status === 'confirmed' && (
                      <button onClick={() => updateStatus(r._id, 'checked_in')} className="btn-secondary text-xs py-1 px-2">Check In</button>
                    )}
                    {r.status === 'checked_in' && (
                      <button onClick={() => updateStatus(r._id, 'completed')} className="btn-secondary text-xs py-1 px-2">Complete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {reservations.length === 0 && (
          <p className="p-8 text-center text-slate-500">No reservations found</p>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Reservation" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Boat</label>
              <select className="input" value={form.boatId} onChange={(e) => setForm({ ...form, boatId: e.target.value })} required>
                <option value="">Select boat</option>
                {boats.map((b) => <option key={b._id} value={b._id}>{b.name} - {formatCurrency(b.dailyRate)}/day</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Customer</label>
              <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                <option value="">Select customer</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Reservation</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
