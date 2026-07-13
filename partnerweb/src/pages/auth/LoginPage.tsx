import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { Button } from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { usePartnerOnboardingStore } from '../../store/partnerOnboardingStore';
import {
  formatPhoneE164,
  getPhoneDigits,
  isValidIndianMobile,
} from '../../utils/phone';

export function LoginPage() {
  const navigate = useNavigate();
  const selectedRole = usePartnerOnboardingStore((s) => s.selectedRole);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!selectedRole) {
    return <Navigate to="/role" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidIndianMobile(phoneDigits)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const digits = getPhoneDigits(phoneDigits);
      const result = await sendOtp({ mobileNumber: digits });
      navigate('/otp', {
        state: {
          phone: formatPhoneE164(digits),
          mobileNumber: digits,
          isExistingUser: result.isExistingUser,
          devOtp: result.devOtp,
        },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send OTP'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle={`Signing in as ${selectedRole === 'vendor' ? 'Vendor' : 'Driver'} with a secure OTP.`}
    >
      <h1>Enter mobile number</h1>
      <p className="muted" style={{ marginBottom: 28, marginTop: 8 }}>
        We will send a 6-digit OTP to verify your partner account.
      </p>
      {error ? <div className="toast-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="phone">Mobile number</label>
          <div className="phone-row">
            <div className="phone-prefix">+91</div>
            <input
              id="phone"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phoneDigits}
              onChange={(e) => {
                setPhoneDigits(getPhoneDigits(e.target.value).slice(0, 10));
                if (error) setError('');
              }}
            />
          </div>
        </div>
        <div className="form-actions" style={{ gap: 12 }}>
          <Button block type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Continue'}
          </Button>
          <p className="muted" style={{ textAlign: 'center', fontSize: 13 }}>
            Wrong role? <Link to="/role">Change role</Link>
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
