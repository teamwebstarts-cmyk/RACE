import { useMutation, useQuery } from '@tanstack/react-query';
import { Ambulance, MapPin, Phone, QrCode, Truck, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import { getSosConfig, getSosContext, triggerSosAlert } from '../../services/sosService';
import { useVehicleStore } from '../../store/vehicleStore';

export function CallPage() {
  const navigate = useNavigate();
  const vehicleId = useVehicleStore((s) => s.vehicles[0]?.id);
  const configQuery = useQuery({ queryKey: ['sos-config'], queryFn: getSosConfig });
  const contextQuery = useQuery({
    queryKey: ['sos-context', vehicleId],
    queryFn: () => getSosContext(vehicleId),
  });
  const alertMutation = useMutation({
    mutationFn: triggerSosAlert,
  });

  const emergency =
    contextQuery.data?.emergencyNumber ||
    configQuery.data?.emergencyPhone ||
    '112';

  const runAction = async (
    action: 'sos' | 'towing' | 'ambulance' | 'share_location' | 'notify_contacts',
  ) => {
    try {
      const result = await alertMutation.mutateAsync({
        action,
        vehicleId,
      });
      window.alert(result.message || 'Alert sent');
    } catch (err) {
      window.alert(getApiErrorMessage(err, 'Unable to send SOS alert'));
    }
  };

  return (
    <div className="sos-page">
      <div className="content-wrap">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <h1 style={{ fontSize: 36 }}>Emergency SOS</h1>
          <button
            type="button"
            className="icon-btn"
            style={{ background: '#1a1a1a', borderColor: '#333', color: 'white' }}
            onClick={() => navigate('/app/home')}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 28 }}>
          Avg arrival ~{configQuery.data?.avgArrivalMinutes ?? 15} min · verified responders
        </p>

        {(configQuery.isError || contextQuery.isError) && (
          <div className="toast-error">
            {getApiErrorMessage(configQuery.error || contextQuery.error)}
          </div>
        )}

        <div
          className="card"
          style={{
            background: '#141414',
            borderColor: '#2a2a2a',
            color: 'white',
            marginBottom: 20,
          }}
        >
          <strong style={{ fontSize: 18 }}>
            {contextQuery.data?.owner?.name || 'Your profile'}
          </strong>
          <p className="muted" style={{ marginTop: 6 }}>
            {contextQuery.data?.vehicle
              ? `${contextQuery.data.vehicle.label} · ${contextQuery.data.vehicle.number}`
              : 'Add a vehicle for richer SOS context'}
          </p>
          {contextQuery.data?.emergencyContact ? (
            <p className="muted" style={{ marginTop: 6 }}>
              Emergency: {contextQuery.data.emergencyContact.name} (
              {contextQuery.data.emergencyContact.relationship || 'Contact'})
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn-danger btn-block"
          style={{ minHeight: 64, fontSize: 18, maxWidth: 420 }}
          onClick={() => void runAction('sos')}
          disabled={alertMutation.isPending}
        >
          <Phone size={18} />
          SOS ALERT
        </button>

        <div className="sos-grid" style={{ marginTop: 20 }}>
          <button type="button" className="sos-action" onClick={() => void runAction('towing')}>
            <Truck size={22} color="#FFB800" />
            <strong style={{ display: 'block', marginTop: 12 }}>Request towing</strong>
          </button>
          <button type="button" className="sos-action" onClick={() => void runAction('ambulance')}>
            <Ambulance size={22} color="#E53935" />
            <strong style={{ display: 'block', marginTop: 12 }}>Ambulance</strong>
          </button>
          <button
            type="button"
            className="sos-action"
            onClick={() => void runAction('share_location')}
          >
            <MapPin size={22} color="#1565C0" />
            <strong style={{ display: 'block', marginTop: 12 }}>Share location</strong>
          </button>
          <button
            type="button"
            className="sos-action"
            onClick={() => void runAction('notify_contacts')}
          >
            <Users size={22} color="#E65100" />
            <strong style={{ display: 'block', marginTop: 12 }}>Notify contacts</strong>
          </button>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => navigate('/app/call/qr')}>
            <QrCode size={16} />
            Scan vehicle QR
          </Button>
          <a
            className="btn btn-outline"
            href={`tel:${emergency}`}
            style={{ color: 'white', borderColor: '#444' }}
          >
            Call {emergency}
          </a>
        </div>
      </div>
    </div>
  );
}
