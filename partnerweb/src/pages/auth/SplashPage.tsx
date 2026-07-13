import { useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Button } from '../../components/ui/Button';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <AuthSplitLayout
      title="Earn with RACE"
      subtitle="Join as a vendor or driver and take roadside jobs across Bhubaneswar."
    >
      <p className="muted" style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
        Partner web
      </p>
      <h1>RACE Partner</h1>
      <p className="muted" style={{ marginBottom: 32, marginTop: 8 }}>
        Manage availability, jobs, and your partner profile from the desktop.
      </p>
      <div className="form-actions" style={{ gap: 12 }}>
        <Button block onClick={() => navigate('/welcome')}>
          Continue
        </Button>
      </div>
    </AuthSplitLayout>
  );
}
