import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getApiErrorMessage } from '../../services/api';
import { useProfileStore } from '../../store/profileStore';
import { useVehicleStore } from '../../store/vehicleStore';
import {
  buildVehicleQrSummary,
  getVehicleQrImageSrc,
  getVehicleQrScanUrl,
} from '../../utils/vehicleQr';

export function VehicleDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const fetchVehicle = useVehicleStore((s) => s.fetchVehicle);
  const deleteVehicle = useVehicleStore((s) => s.deleteVehicle);
  const vehicle = useVehicleStore((s) => s.selectedVehicle);
  const profile = useProfileStore((s) => s.profile);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) void fetchVehicle(id).catch((err) => setError(getApiErrorMessage(err)));
  }, [id, fetchVehicle]);

  const summary = useMemo(
    () => (vehicle ? buildVehicleQrSummary(vehicle, profile) : null),
    [vehicle, profile],
  );
  const qrSrc = vehicle ? getVehicleQrImageSrc(vehicle) : null;
  const scanUrl = vehicle ? getVehicleQrScanUrl(vehicle.id) : '';

  return (
    <PageShell>
      <ScreenHeader title="Vehicle detail" />
      {error ? <div className="toast-error">{error}</div> : null}
      {vehicle ? (
        <div className="list">
          <div className="qr-card">
            <div className="qr-card-image">
              {qrSrc ? (
                <img src={qrSrc} alt={`QR for ${vehicle.vehicleNumber}`} />
              ) : (
                <p className="muted" style={{ fontSize: 12, padding: 12, wordBreak: 'break-all' }}>
                  {scanUrl}
                </p>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="muted" style={{ marginBottom: 12 }}>
                {vehicle.vehicleNumber}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="chip">{vehicle.vehicleType}</span>
                <span className="chip">{vehicle.fuelType}</span>
                {vehicle.color ? <span className="chip">{vehicle.color}</span> : null}
              </div>
              <div className="detail-grid">
                <div className="detail-row">
                  <span>Owner</span>
                  <strong>{summary?.ownerName}</strong>
                </div>
                <div className="detail-row">
                  <span>Emergency</span>
                  <strong>
                    {summary?.emergencyName || '—'}
                    {summary?.emergencyMobile
                      ? ` · +91 ${summary.emergencyMobile.slice(-10)}`
                      : ''}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="danger"
            block
            disabled={deleting}
            onClick={async () => {
              if (!window.confirm('Delete this vehicle?')) return;
              setDeleting(true);
              try {
                await deleteVehicle(vehicle.id);
                navigate('/app/profile/vehicles', { replace: true });
              } catch (err) {
                setError(getApiErrorMessage(err));
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? 'Deleting…' : 'Delete vehicle'}
          </Button>
        </div>
      ) : (
        <div className="spinner" />
      )}
    </PageShell>
  );
}
