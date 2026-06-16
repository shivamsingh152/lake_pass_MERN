import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabels } from '../utils/format';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = [user?.marina?.city, user?.marina?.state].filter(Boolean).join(', ');

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onMenuClick} className="btn-secondary p-2 lg:hidden" aria-label="Open menu">
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">
          {user?.marina?.name || 'Marina Dashboard'}
        </h2>
        {location && <p className="text-sm text-slate-500 truncate">{location}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[user?.role]}</p>
        </div>
        <button onClick={logout} className="btn-secondary p-2" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
