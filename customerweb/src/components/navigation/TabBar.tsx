import { Calendar, Home, LayoutGrid, User } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { to: '/app/home', label: 'Home', Icon: Home },
  { to: '/app/services', label: 'Services', Icon: LayoutGrid },
  { to: '/app/bookings', label: 'Bookings', Icon: Calendar },
  { to: '/app/profile', label: 'Profile', Icon: User },
] as const;

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hide = location.pathname.startsWith('/app/call');

  if (hide) return null;

  return (
    <nav className="tab-bar" aria-label="Main">
      <NavLink
        to={TABS[0].to}
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        {TABS[0].label}
      </NavLink>
      <NavLink
        to={TABS[1].to}
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <LayoutGrid size={20} />
        {TABS[1].label}
      </NavLink>
      <div className="sos-fab-slot">
        <button
          type="button"
          className="sos-fab"
          onClick={() => navigate('/app/call')}
          aria-label="Emergency SOS"
        >
          SOS
        </button>
      </div>
      <NavLink
        to={TABS[2].to}
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <Calendar size={20} />
        {TABS[2].label}
      </NavLink>
      <NavLink
        to={TABS[3].to}
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        {TABS[3].label}
      </NavLink>
    </nav>
  );
}
