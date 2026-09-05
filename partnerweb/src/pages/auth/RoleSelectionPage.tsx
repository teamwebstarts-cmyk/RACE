import { Building2, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Button } from '../../components/ui/Button';
import { usePartnerOnboardingStore } from '../../store/partnerOnboardingStore';
import type { PartnerRole } from '../../types/partner';

const ROLES: Array<{
  role: PartnerRole;
  title: string;
  description: string;
  Icon: typeof Building2;
}> = [
  {
    role: 'vendor',
    title: 'Vendor / Fleet',
    description: 'Register your towing company, manage drivers, and track verification.',
    Icon: Building2,
  },
  {
    role: 'driver',
    title: 'Driver',
    description: 'Go online, accept allotted jobs, and update trip status live.',
    Icon: Truck,
  },
];

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const selectedRole = usePartnerOnboardingStore((s) => s.selectedRole);
  const setSelectedRole = usePartnerOnboardingStore((s) => s.setSelectedRole);
  const [localRole, setLocalRole] = useState<PartnerRole | null>(selectedRole);

  return (
    <AuthSplitLayout
      title="How will you partner?"
      subtitle="Pick vendor or driver — you can use the same mobile number as the app."
    >
      <h1>Select your role</h1>
      <p className="muted" style={{ marginBottom: 24, marginTop: 8 }}>
        This decides which registration and dashboard you see.
      </p>
      <div className="role-grid">
        {ROLES.map(({ role, title, description, Icon }) => (
          <button
            key={role}
            type="button"
            className={`role-card ${localRole === role ? 'selected' : ''}`}
            onClick={() => setLocalRole(role)}
          >
            <Icon size={28} color="#F5A800" strokeWidth={2} />
            <strong>{title}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>
      <div className="form-actions" style={{ marginTop: 28 }}>
        <Button
          block
          disabled={!localRole}
          onClick={() => {
            if (!localRole) return;
            setSelectedRole(localRole);
            navigate('/login');
          }}
        >
          Continue
        </Button>
      </div>
    </AuthSplitLayout>
  );
}
