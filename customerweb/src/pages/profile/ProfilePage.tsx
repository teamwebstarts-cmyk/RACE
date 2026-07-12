import {
  Bell,
  Car,
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

const MENU = [
  {
    section: 'Account',
    items: [
      { to: '/app/profile/personal', label: 'Personal information', Icon: User },
      { to: '/app/profile/vehicles', label: 'My vehicles', Icon: Car },
      { to: '/app/profile/locations', label: 'Saved locations', Icon: MapPin },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { to: '/app/profile/notifications', label: 'Notifications', Icon: Bell },
      { to: '/app/profile/settings', label: 'Settings', Icon: Settings },
      { to: '/app/profile/help', label: 'Help & support', Icon: HelpCircle },
      { to: '/app/call', label: 'Emergency SOS', Icon: Shield },
    ],
  },
] as const;

export function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const name = profile?.fullName || user?.fullName || 'Customer';
  const phone = profile?.mobileNumber || user?.mobileNumber || '';
  const email = profile?.email || user?.email || '—';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="page">
      <div className="content-wrap">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 36 }}>Profile</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Manage your account, vehicles, and preferences
            </p>
          </div>
        </div>

        <div className="profile-layout">
          <aside>
            <div className="profile-hero">
              <div className="avatar">{initials || 'R'}</div>
              <div>
                <strong style={{ fontSize: 18 }}>{name}</strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  +91 {phone.slice(-10)}
                </p>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="muted" style={{ fontSize: 13 }}>Email</p>
              <strong>{email}</strong>
            </div>
            <Button
              variant="outline"
              block
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
            >
              <LogOut size={16} />
              Log out
            </Button>
          </aside>

          <div>
            {MENU.map((group) => (
              <div className="menu-section" key={group.section}>
                <h3>{group.section}</h3>
                <div className="list">
                  {group.items.map(({ to, label, Icon }) => (
                    <button
                      key={to}
                      type="button"
                      className="list-row"
                      onClick={() => navigate(to)}
                    >
                      <Icon size={18} color="#666" />
                      <div className="meta">
                        <strong>{label}</strong>
                      </div>
                      <ChevronRight size={18} color="#999" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
