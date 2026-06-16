import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronRight } from 'lucide-react';
import api from '../api/api';
import { formatCurrency } from '../utils/format';
import Modal from '../components/Modal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    licenseNumber: '', insuranceProvider: '', insurancePolicy: '',
  });

  const load = () => {
    api.get('/customers', { params: { search: search || undefined } }).then((res) => setCustomers(res.data));
  };

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/customers', form);
    setModal(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', licenseNumber: '', insuranceProvider: '', insurancePolicy: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Profiles</h1>
          <p className="text-slate-500">Manage renter information, insurance, and rental history</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-10" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <Link key={c._id} to={`/customers/${c._id}`} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-lake-100 rounded-full flex items-center justify-center text-lake-700 font-bold text-lg">
                {c.firstName[0]}{c.lastName[0]}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-lake-600" />
            </div>
            <h3 className="font-semibold mt-3">{c.firstName} {c.lastName}</h3>
            <p className="text-sm text-slate-500">{c.email}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span>{c.totalRentals} rentals</span>
              <span>{formatCurrency(c.totalSpent)} spent</span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Customer" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">License Number</label>
              <input className="input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Insurance Provider</label>
              <input className="input" value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Insurance Policy #</label>
              <input className="input" value={form.insurancePolicy} onChange={(e) => setForm({ ...form, insurancePolicy: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
