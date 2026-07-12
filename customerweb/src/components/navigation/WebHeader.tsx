import { MapPin, Phone } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { BrandMark } from '../ui/BrandMark';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

const NAV = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/services', label: 'Services' },
  { to: '/app/bookings', label: 'Bookings' },
  { to: '/app/profile', label: 'Profile' },
] as const;

export function WebHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const hide = location.pathname.startsWith('/app/call');
  const profile = useProfileStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const name = profile?.fullName || user?.fullName || 'Account';

  if (hide) return null;

  return (
    <header className="web-header">
      <div className="content-wrap web-header-inner">
        <NavLink to="/app/home" className="web-logo" style={{ textDecoration: 'none' }}>
          <BrandMark variant="light" size="sm" />
        </NavLink>

        <nav className="web-nav" aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="web-header-actions">
          <button
            type="button"
            className="location-pill"
            onClick={() => navigate('/app/home/location')}
          >
            <MapPin size={16} color="#F5A800" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Bhubaneswar</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => window.open('tel:+916742000000')}
            aria-label="Call support"
          >
            <Phone size={18} />
          </button>
          <button type="button" className="sos-chip" onClick={() => navigate('/app/call')}>
            SOS
          </button>
          <button
            type="button"
            className="location-pill"
            onClick={() => navigate('/app/profile')}
            style={{ paddingRight: 16 }}
          >
            <span
              className="avatar"
              style={{ width: 28, height: 28, borderRadius: 10, fontSize: 12 }}
            >
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
