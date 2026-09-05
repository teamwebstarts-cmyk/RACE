import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { OnboardingLayout } from '../../components/auth/OnboardingLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useVehicleStore } from '../../store/vehicleStore';
import {
  buildVehicleQrSummary,
  getVehicleQrImageSrc,
  getVehicleQrScanUrl,
} from '../../utils/vehicleQr';

/**
 * QR display:
 * - Backend already generates a PNG data-URL (`vehicle.qrCode`) encoding
 *   `${API}/api/v1/qr/:vehicleId` which opens owner + emergency details when scanned.
 * - Optional client library (you install): `npm i react-qr-code`
 *   then render <QRCode value={scanUrl} /> as a fallback if data-URL is missing.
 */
export function QrCodePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);
  const profile = useProfileStore((s) => s.profile);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const vehicleId = params.get('vehicleId');
  const vehicle =
    vehicles.find((v) => v.id === vehicleId) || vehicles[0] || null;

  const summary = useMemo(
    () => (vehicle ? buildVehicleQrSummary(vehicle, profile) : null),
    [vehicle, profile],
  );

  const qrSrc = vehicle ? getVehicleQrImageSrc(vehicle) : null;
  const scanUrl = vehicle ? getVehicleQrScanUrl(vehicle.id) : '';

  const finish = () => {
    advanceOnboarding('done');
    navigate('/app/home', { replace: true });
  };

  return (
    <OnboardingLayout
      step="qr"
      title="Emergency QR ready"
      subtitle="Scan this code to see vehicle, owner, and emergency contact details."
    >
      {!vehicle ? (
        <div className="toast-error">Vehicle not found. Add a vehicle first.</div>
      ) : (
        <>
          <div className="qr-card">
            <div className="qr-card-image">
              {qrSrc ? (
                <img src={qrSrc} alt={`QR for ${vehicle.vehicleNumber}`} />
              ) : (
                <div style={{ textAlign: 'center', padding: 12 }}>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    Install <code>react-qr-code</code> to render client-side, or reopen after API
                    returns the image.
                  </p>
                  <strong style={{ fontSize: 11, wordBreak: 'break-all' }}>{scanUrl}</strong>
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 20, marginBottom: 12 }}>
                {summary?.vehicleLabel} · {summary?.vehicleNumber}
              </h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <span>Owner</span>
                  <strong>{summary?.ownerName}</strong>
                </div>
                <div className="detail-row">
                  <span>Owner mobile</span>
                  <strong>+91 {summary?.ownerMobile?.slice(-10)}</strong>
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
                <div className="detail-row">
                  <span>Relationship</span>
                  <strong>{summary?.emergencyRelationship || '—'}</strong>
                </div>
                <div className="detail-row">
                  <span>Type / fuel</span>
                  <strong>
                    {summary?.vehicleType} · {summary?.fuelType}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Color</span>
                  <strong>{summary?.color}</strong>
                </div>
              </div>
              <p className="muted" style={{ marginTop: 14, fontSize: 12, wordBreak: 'break-all' }}>
                Scan URL: {scanUrl}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <Button block onClick={finish}>
              Finish & go to home
            </Button>
            <Button
              variant="outline"
              block
              onClick={() => navigate('/onboarding/vehicle', { replace: true })}
            >
              Add another vehicle
            </Button>
          </div>
        </>
      )}
    </OnboardingLayout>
  );
}
