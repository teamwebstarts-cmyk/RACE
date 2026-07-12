import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '../../components/auth/OnboardingLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { getPhoneDigits, isValidIndianMobile } from '../../utils/phone';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const completeProfile = useProfileStore((s) => s.completeProfile);
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    gender: '' as '' | 'male' | 'female' | 'other' | 'prefer_not_to_say',
    dateOfBirth: '',
    emergencyName: '',
    emergencyMobile: '',
    relationship: 'Family',
    line1: '',
    line2: '',
    city: 'Bhubaneswar',
    state: 'Odisha',
    pincode: '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setError('Enter your full name');
      return;
    }
    if (!isValidIndianMobile(form.emergencyMobile)) {
      setError('Enter a valid 10-digit emergency contact number');
      return;
    }
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      setError('Address, city, and state are required');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError('Enter a valid 6-digit pincode');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await completeProfile({
        fullName: form.fullName.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        gender: form.gender || 'prefer_not_to_say',
        ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        emergencyContact: {
          name: form.emergencyName.trim() || 'Emergency contact',
          mobileNumber: getPhoneDigits(form.emergencyMobile),
          relationship: form.relationship || undefined,
        },
        address: {
          line1: form.line1.trim(),
          ...(form.line2.trim() ? { line2: form.line2.trim() } : {}),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          country: 'India',
        },
      });
      advanceOnboarding('pin');
      navigate('/onboarding/pin', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      step="profile"
      title="Complete your profile"
      subtitle="Required for SOS and bookings. Optional fields can be filled later."
    >
      {error ? <div className="toast-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <TextField
          label="Full name"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          placeholder="As on your ID"
          required
        />

        <TextField
          label={
            <>
              Email ID <span className="optional-tag">Optional</span>
            </>
          }
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
        />

        <div className="grid-2">
          <div className="field">
            <label htmlFor="gender">
              Gender <span className="optional-tag">Optional</span>
            </label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <TextField
            label={
              <>
                Date of birth <span className="optional-tag">Optional</span>
              </>
            }
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="field">
          <label>
            Profile photo <span className="optional-tag">Optional</span>
          </label>
          <div className="photo-upload">
            {photoPreview ? <img src={photoPreview} alt="Preview" /> : <div className="avatar">R</div>}
            <div className="photo-upload-meta">
              <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Preview only for now — upload to cloud storage comes with media APIs.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setPhotoPreview(url);
                }}
              />
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, margin: '8px 0 12px' }}>Emergency contact</h3>
        <TextField
          label="Contact name"
          value={form.emergencyName}
          onChange={(e) => set('emergencyName', e.target.value)}
          placeholder="Who should we call?"
        />
        <TextField
          label="Emergency contact number"
          inputMode="numeric"
          value={form.emergencyMobile}
          onChange={(e) => set('emergencyMobile', getPhoneDigits(e.target.value).slice(0, 10))}
          placeholder="10-digit mobile"
          required
        />
        <TextField
          label={
            <>
              Relationship <span className="optional-tag">Optional</span>
            </>
          }
          value={form.relationship}
          onChange={(e) => set('relationship', e.target.value)}
        />

        <h3 style={{ fontSize: 16, margin: '8px 0 12px' }}>Address</h3>
        <TextField
          label="Address line 1"
          value={form.line1}
          onChange={(e) => set('line1', e.target.value)}
          required
        />
        <TextField
          label={
            <>
              Address line 2 <span className="optional-tag">Optional</span>
            </>
          }
          value={form.line2}
          onChange={(e) => set('line2', e.target.value)}
        />
        <div className="grid-2">
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            required
          />
          <TextField
            label="Pincode"
            value={form.pincode}
            onChange={(e) => set('pincode', e.target.value)}
            required
          />
        </div>
        <TextField
          label="State"
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
          required
        />

        <div className="form-actions">
          <Button block type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Continue to PIN'}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
