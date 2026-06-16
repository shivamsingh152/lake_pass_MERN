import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/api';
import { roleLabels } from '../utils/format';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', phone: '' });
  const canManage = ['owner', 'manager'].includes(user?.role);

  const load = () => api.get('/auth/users').then((res) => setUsers(res.data));
  useEffect(() => {
    if (canManage) load();
  }, [canManage]);

  if (!canManage) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/auth/users', form);
    setModal(false);
    setForm({ name: '', email: '', password: '', role: 'staff', phone: '' });
    load();
  };

  const toggleActive = async (u) => {
    await api.put(`/auth/users/${u._id}`, { isActive: !u.isActive });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-slate-500">Manage owners, managers, and staff access</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Name</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Email</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Role</th>
              <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-slate-500">{u.email}</td>
                <td className="p-4"><span className="badge bg-lake-100 text-lake-800">{roleLabels[u.role]}</span></td>
                <td className="p-4">
                  <span className={`badge ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  {u._id !== user._id && (
                    <button onClick={() => toggleActive(u)} className="btn-secondary text-xs">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Team Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
