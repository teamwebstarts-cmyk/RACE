import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import { api, getApiErrorMessage, unwrapApi } from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

export function QrScanPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter a vehicle QR / ID');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      // Best-effort lookup via vehicle verify endpoint pattern used on mobile.
      const data = await unwrapApi(
        api.get(`${API_ENDPOINTS.vehicles}/${code.trim()}/verify`),
      );
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to verify QR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page sos-page">
      <ScreenHeader title="Scan / enter QR" onBack={() => navigate('/app/call')} />
      <p className="muted" style={{ marginBottom: 16 }}>
        Camera scanning can be added with Ionic Capacitor later. Enter a vehicle ID or QR payload
        for now.
      </p>
      {error ? <div className="toast-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <TextField
          label="Vehicle QR / ID"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste QR value"
        />
        <Button block type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Verify'}
        </Button>
      </form>
      {result ? (
        <pre
          className="card"
          style={{
            marginTop: 16,
            background: '#141414',
            color: '#f5a800',
            overflow: 'auto',
            fontSize: 12,
          }}
        >
          {result}
        </pre>
      ) : null}
    </div>
  );
}
