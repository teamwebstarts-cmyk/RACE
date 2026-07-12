import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  formatPhoneE164,
  getPhoneDigits,
  isValidIndianMobile,
} from '../../utils/phone';

export function LoginPage() {
  const navigate = useNavigate();
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidIndianMobile(phoneDigits)) {
      setError('Enter a valid 10-digit mobile number');
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
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <img src={images.towingHero} alt="Towing service" />
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 40px)', marginBottom: 10 }}>
                Welcome back
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 400, lineHeight: 1.55 }}>
                Secure OTP login — same account as the mobile app.
              </p>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <h1>Enter mobile number</h1>
            <p className="muted" style={{ marginBottom: 28, marginTop: 8 }}>
              We will send a 6-digit OTP to verify your account.
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
                  New here? <Link to="/create-account">Create an account</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
