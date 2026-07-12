import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import { getApiErrorMessage } from '../../services/api';
import { useProfileStore } from '../../store/profileStore';

export function PersonalInfoPage() {
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    void fetchProfile().catch(() => undefined);
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      line1: profile.address?.line1 || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      pincode: profile.address?.pincode || '',
    });
  }, [profile]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        fullName: form.fullName,
        email: form.email,
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: 'India',
        },
      });
      setSuccess('Profile updated');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell narrow>
      <ScreenHeader title="Personal information" />
      {error ? <div className="toast-error">{error}</div> : null}
      {success ? <div className="toast-success">{success}</div> : null}
      <form onSubmit={onSubmit}>
        <TextField
          label="Full name"
          value={form.fullName}
          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <TextField
          label="Address"
          value={form.line1}
          onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
        />
        <div className="grid-2">
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          />
          <TextField
            label="Pincode"
            value={form.pincode}
            onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
          />
        </div>
        <TextField
          label="State"
          value={form.state}
          onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
        />
        <div className="form-actions">
          <Button block type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
