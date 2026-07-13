import { NavLink, useNavigate } from 'react-router-dom';

import { BrandMark } from '../ui/BrandMark';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export function WebHeader() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? profile?.role;
  const isDriver = role === 'driver';
  const isVendor = role === 'vendor';
  const name = profile?.fullName || user?.fullName || 'Partner';

  const nav = [
    { to: '/app/dashboard', label: 'Dashboard' },
    ...(isDriver || isVendor ? [{ to: '/app/jobs', label: 'Jobs' }] : []),
    { to: '/app/account', label: 'Account' },
  ];

  return (
    <header className="web-header">
      <div className="content-wrap web-header-inner">
        <NavLink to="/app/dashboard" className="web-logo" style={{ textDecoration: 'none' }}>
          <BrandMark variant="light" size="sm" />
        </NavLink>

        <nav className="web-nav" aria-label="Main">
          {nav.map((item) => (
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
          <span className="partner-badge">Partner</span>
          <button
            type="button"
            className="location-pill"
            onClick={() => navigate('/app/account')}
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
