import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', marinaName: '', marinaSlug: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, role: 'owner' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lake-900 via-lake-800 to-lake-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Anchor className="w-10 h-10 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Register Your Marina</h1>
        </div>

        <div className="card p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Your Name</label>
                <input name="name" className="input" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input name="email" type="email" className="input" value={form.email} onChange={handleChange} required />
              </div>
              <div className="col-span-2">
                <label className="label">Password</label>
                <input name="password" type="password" className="input" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div>
                <label className="label">Marina Name</label>
                <input name="marinaName" className="input" value={form.marinaName} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <input name="marinaSlug" className="input" value={form.marinaSlug} onChange={handleChange} placeholder="my-marina" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Marina Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-lake-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
