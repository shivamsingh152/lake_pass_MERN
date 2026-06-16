import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabels } from '../utils/format';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = [user?.marina?.city, user?.marina?.state].filter(Boolean).join(', ');

  return (
    <header className="bg-white border-b border-slate-200/50 px-4 md:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left Section */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button 
          type="button" 
          onClick={onMenuClick} 
          className="lg:hidden btn-secondary p-2 hover:bg-slate-100 transition-colors" 
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 truncate">
            {user?.marina?.name || 'Marina Dashboard'}
          </h2>
          {location && <p className="text-xs md:text-sm text-slate-500 truncate">{location}</p>}
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs md:text-sm font-medium text-slate-900 truncate max-w-xs">{user?.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[user?.role]}</p>
        </div>
        <button 
          onClick={logout} 
          className="btn-secondary p-2 hover:bg-slate-100 transition-colors" 
          title="Logout"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </header>
  );
}
