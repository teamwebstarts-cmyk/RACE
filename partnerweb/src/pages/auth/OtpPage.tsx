import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { usePartnerOnboardingStore } from '../../store/partnerOnboardingStore';
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
  const selectedRole = usePartnerOnboardingStore((s) => s.selectedRole);
  const [otp, setOtp] = useState(state.devOtp || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!selectedRole) {
    return <Navigate to="/role" replace />;
  }

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
      const { onboardingRequired } = useAuthStore.getState();
      if (onboardingRequired) {
        navigate(
          selectedRole === 'vendor' ? '/register/vendor/business' : '/register/driver/personal',
          { replace: true },
        );
      } else {
        navigate('/app/dashboard', { replace: true });
      }
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
    <AuthSplitLayout
      title="Almost there"
      subtitle="Enter the OTP sent to your phone to continue."
    >
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
    </AuthSplitLayout>
  );
}
