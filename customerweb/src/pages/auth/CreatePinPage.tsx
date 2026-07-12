import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingLayout } from '../../components/auth/OnboardingLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { saveCustomerPin } from '../../utils/pinStorage';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function CreatePinPage() {
  const navigate = useNavigate();
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  const active = mode === 'create' ? pin : confirm;

  const finish = () => {
    advanceOnboarding('vehicle');
    navigate('/onboarding/vehicle', { replace: true });
  };

  const press = (key: string) => {
    if (!key) return;
    if (key === '⌫') {
      if (mode === 'create') setPin((p) => p.slice(0, -1));
      else setConfirm((p) => p.slice(0, -1));
      return;
    }
    if (active.length >= 4) return;
    if (mode === 'create') {
      const next = pin + key;
      setPin(next);
      if (next.length === 4) {
        setMode('confirm');
        setError('');
      }
    } else {
      const next = confirm + key;
      setConfirm(next);
      if (next.length === 4) {
        if (next !== pin) {
          setError('PINs do not match. Try again.');
          setConfirm('');
          setMode('create');
          setPin('');
          return;
        }
        saveCustomerPin(next);
        finish();
      }
    }
  };

  return (
    <OnboardingLayout
      step="pin"
      title={mode === 'create' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}
      subtitle="Used on this device for quick unlock. You can also skip and continue."
    >
      {error ? <div className="toast-error">{error}</div> : null}
      <div className="pin-dots">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`pin-dot ${i < active.length ? 'filled' : ''}`} />
        ))}
      </div>
      <div className="pin-pad">
        {KEYS.map((key, index) => (
          <button
            key={`${key}-${index}`}
            type="button"
            className="pin-key"
            style={{ visibility: key ? 'visible' : 'hidden' }}
            onClick={() => press(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="form-actions">
        <Button
          variant="ghost"
          block
          onClick={() => {
            saveCustomerPin('skip');
            finish();
          }}
        >
          Skip for now
        </Button>
      </div>
    </OnboardingLayout>
  );
}
