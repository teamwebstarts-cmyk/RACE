import { Car, ChevronRight, LogOut, Shield, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export function AccountPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const isVendor = user?.role === 'vendor';
  const name = profile?.fullName || user?.fullName || 'Partner';
  const phone = profile?.mobileNumber || user?.mobileNumber || '—';

  return (
    <div className="page-section">
      <h1>Account</h1>
      <p className="muted">Profile and partner settings</p>

      <div className="account-card" style={{ marginTop: 24 }}>
        <div className="avatar" style={{ width: 56, height: 56, borderRadius: 16, fontSize: 22 }}>
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{name}</h2>
          <p className="muted" style={{ marginTop: 4 }}>
            +91 {phone} · {user?.role ?? 'partner'}
          </p>
          {profile?.email ? (
            <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>
              {profile.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="account-links">
        {isVendor ? (
          <>
            <Link to="/app/account/drivers" className="account-link">
              <Users size={18} color="#F5A800" />
              <span>Fleet drivers</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/app/account/vehicles" className="account-link">
              <Car size={18} color="#F5A800" />
              <span>Fleet vehicles</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/app/account/verification" className="account-link">
              <Shield size={18} color="#F5A800" />
              <span>Verification status</span>
              <ChevronRight size={16} />
            </Link>
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 28, maxWidth: 280 }}>
        <Button
          variant="danger"
          block
          onClick={() => {
            void logout().then(() => navigate('/role', { replace: true }));
          }}
        >
          <LogOut size={16} style={{ marginRight: 8 }} />
          Log out
        </Button>
      </div>
    </div>
  );
}
