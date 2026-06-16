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
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-blue-900 via-lake-900 to-blue-950 text-white flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-800/50 bg-gradient-to-r from-blue-900 to-lake-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-white">Lake Pass</h1>
              <p className="text-blue-200 text-xs font-semibold">Marina OS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-blue-800/50 bg-gradient-to-r from-blue-950 to-blue-900 space-y-2">
          <NavLink
            to="/book"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-lg transition-all duration-200 font-medium"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>Consumer App →</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
