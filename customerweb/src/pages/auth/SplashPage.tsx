import { useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <img src={images.splashHero} alt="RACE assistance" />
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', marginBottom: 12 }}>
                Help when you need it
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 440, lineHeight: 1.55 }}>
                Towing, driver hire, and roadside support — verified partners across Bhubaneswar.
              </p>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <p className="muted" style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
              Customer web
            </p>
            <h1>Get moving again</h1>
            <p className="muted" style={{ marginBottom: 32, marginTop: 8 }}>
              Sign in with your mobile number to manage bookings, vehicles, and emergency SOS.
            </p>
            <div className="form-actions" style={{ gap: 12 }}>
              <Button block onClick={() => navigate('/onboarding')}>
                Get started
              </Button>
              <Button variant="outline" block onClick={() => navigate('/login')}>
                I already have an account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
