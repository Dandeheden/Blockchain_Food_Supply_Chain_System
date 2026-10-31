import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/helpers';
import {
  LayoutDashboard, Plus, Search, ArrowRightLeft,
  AlertTriangle, QrCode, Shield, Info, LogOut, Leaf,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',         icon: LayoutDashboard, roles: ['farmer','processor','distributor','retailer','admin'] },
  { to: '/batch/new',     label: 'Add Batch',          icon: Plus,            roles: ['farmer','admin'] },
  { to: '/stage/update',  label: 'Update Stage',       icon: ArrowRightLeft,  roles: ['processor','distributor','retailer','admin'] },
  { to: '/track',         label: 'Track Product',      icon: Search,          roles: ['farmer','processor','distributor','retailer','admin'] },
  { to: '/spoilage/report', label: 'Report Spoilage',  icon: AlertTriangle,   roles: ['farmer','processor','distributor','retailer','admin'] },
  { to: '/blockchain',    label: 'Blockchain History', icon: Shield,          roles: ['farmer','processor','distributor','retailer','admin'] },
  { to: '/qrcode',        label: 'QR Codes',           icon: QrCode,          roles: ['farmer','processor','distributor','retailer','admin'] },
  { to: '/admin',         label: 'Admin Dashboard',    icon: Shield,          roles: ['admin'] },
  { to: '/about',         label: 'About Project',      icon: Info,            roles: ['farmer','processor','distributor','retailer','admin'] },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-green-900 text-white z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-green-800">
          <div className="w-9 h-9 bg-green-400 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-900" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">FoodTrace</p>
            <p className="text-green-400 text-xs">Blockchain Supply Chain</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-green-800">
          <div className="bg-green-800 rounded-xl p-3">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-green-300 text-xs truncate">{user?.email}</p>
            <span className="mt-1.5 inline-block text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
              {roleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll space-y-1">
          {filtered.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'}`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-green-800 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-green-200 hover:bg-red-800 hover:text-white transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
