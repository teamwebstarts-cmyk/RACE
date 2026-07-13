import { useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Button } from '../../components/ui/Button';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <AuthSplitLayout
      title="Partner with RACE"
      subtitle="Towing companies and drivers — one place to go online and serve customers."
    >
      <h1>Get started</h1>
      <p className="muted" style={{ marginBottom: 32, marginTop: 8 }}>
        Choose how you work with RACE, then sign in with your mobile number.
      </p>
      <div className="form-actions" style={{ gap: 12 }}>
        <Button block onClick={() => navigate('/role')}>
          Get Started
        </Button>
        <Button variant="outline" block onClick={() => navigate('/login')}>
          Login
        </Button>
      </div>
    </AuthSplitLayout>
  );
}
