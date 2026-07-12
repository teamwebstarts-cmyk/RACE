import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getPhoneDigits } from '../../utils/phone';

type OtpState = {
  phone?: string;
  mobileNumber?: string;
  isExistingUser?: boolean;
  devOtp?: string;
};

export function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as OtpState;
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const [otp, setOtp] = useState(state.devOtp || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!state.mobileNumber && !state.phone) {
    return <Navigate to="/login" replace />;
  }

  const mobileNumber = state.mobileNumber || getPhoneDigits(state.phone || '');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await verifyOtp({ mobileNumber, otp });
      const step = useAuthStore.getState().customerOnboardingStep;
      if (step === 'done') navigate('/app/home', { replace: true });
      else if (step === 'pin') navigate('/onboarding/pin', { replace: true });
      else if (step === 'vehicle') navigate('/onboarding/vehicle', { replace: true });
      else navigate('/onboarding/profile', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid OTP'));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      const result = await sendOtp({ mobileNumber });
      if (result.devOtp) setOtp(result.devOtp);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resend OTP'));
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <img src={images.driverHero} alt="" />
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 36px)' }}>Almost there</h2>
              <p style={{ color: 'rgba(255,255,255,0.82)', marginTop: 8, lineHeight: 1.55 }}>
                Enter the OTP sent to your phone.
              </p>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <h1>Verify OTP</h1>
            <p className="muted" style={{ marginBottom: 24 }}>
              Sent to {state.phone || `+91 ${mobileNumber}`}
            </p>
            {state.devOtp ? <div className="toast-success">Dev OTP: {state.devOtp}</div> : null}
            {error ? <div className="toast-error">{error}</div> : null}
            <form onSubmit={onSubmit}>
              <OtpInput value={otp} onChange={setOtp} />
              <div className="form-actions">
                <Button block type="submit" disabled={submitting}>
                  {submitting ? 'Verifying…' : 'Verify & continue'}
                </Button>
                <Button variant="ghost" block type="button" onClick={() => void resend()}>
                  Resend OTP
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
