import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Ship, Calendar, Users, UserCog,
  Settings, Anchor, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fleet', icon: Ship, label: 'Fleet' },
  { to: '/availability', icon: Calendar, label: 'Availability' },
  { to: '/reservations', icon: Anchor, label: 'Reservations' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/users', icon: UserCog, label: 'Team', roles: ['owner', 'manager'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['owner', 'manager'] },
  { to: '/widget', icon: Globe, label: 'Booking Widget' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-lake-900 text-white flex flex-col shrink-0 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="p-6 border-b border-lake-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lake-500 rounded-lg flex items-center justify-center">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Lake Pass</h1>
            <p className="text-lake-300 text-xs">Marina OS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role))
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lake-700 text-white'
                    : 'text-lake-200 hover:bg-lake-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="p-4 border-t border-lake-800">
        <NavLink
          to="/book"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-sm text-lake-300 hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4" />
          Consumer Booking App →
        </NavLink>
      </div>
      </aside>
    </>
  );
}
