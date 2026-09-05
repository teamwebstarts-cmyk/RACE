import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';
import { getServiceById } from '../../data/catalog';
import { getApiErrorMessage } from '../../services/api';
import {
  createDriverBookingWithPayment,
  createTowingBookingWithPayment,
  type ServiceBookingType,
} from '../../services/bookingService';
import { useVehicleStore } from '../../store/vehicleStore';

const DEFAULT_COORDS = { latitude: 20.2961, longitude: 85.8245 };

const PACKAGE_HOURS = [2, 4, 8, 12, 24] as const;

function parseBookingType(value: string | null): ServiceBookingType | null {
  if (value === 'towing' || value === 'driver') return value;
  return null;
}

export function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingType = parseBookingType(searchParams.get('type'));
  const categoryId = searchParams.get('category') || '';
  const serviceId = searchParams.get('service') || '';

  const vehicles = useVehicleStore((s) => s.vehicles);
  const vehiclesLoading = useVehicleStore((s) => s.isLoading);
  const fetchVehicles = useVehicleStore((s) => s.fetchVehicles);

  const [vehicleId, setVehicleId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [packageHours, setPackageHours] = useState<(typeof PACKAGE_HOURS)[number]>(4);
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isScheduledTowing = bookingType === 'towing' && serviceId === 'towing_scheduled';
  const needsDropoff = bookingType === 'towing';

  useEffect(() => {
    void fetchVehicles().catch(() => undefined);
  }, [fetchVehicles]);

  useEffect(() => {
    if (!vehicleId && vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles, vehicleId]);

  if (!bookingType) {
    return (
      <PageShell narrow>
        <ScreenHeader title="New booking" />
        <div className="card">
          <p className="muted">Choose a service from the catalog to start a booking.</p>
          <Button block style={{ marginTop: 16 }} onClick={() => navigate('/app/services')}>
            Browse services
          </Button>
        </div>
      </PageShell>
    );
  }

  const title = bookingType === 'towing' ? 'Book towing' : 'Hire a driver';
  const catalogMatch = categoryId && serviceId ? getServiceById(categoryId, serviceId) : undefined;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vehicleId) {
      setError('Select a vehicle to continue.');
      return;
    }
    if (!pickupAddress.trim()) {
      setError('Enter a pickup address.');
      return;
    }
    if (needsDropoff && !dropoffAddress.trim()) {
      setError('Enter a drop-off address for towing.');
      return;
    }

    setSubmitting(true);
    try {
      const pickup = {
        address: pickupAddress.trim(),
        ...DEFAULT_COORDS,
      };
      const dropoff = dropoffAddress.trim()
        ? { address: dropoffAddress.trim(), ...DEFAULT_COORDS }
        : undefined;

      const result =
        bookingType === 'towing'
          ? await createTowingBookingWithPayment({
              vehicleId,
              pickup,
              dropoff: dropoff!,
              ...(isScheduledTowing && scheduledAt
                ? { scheduledAt: new Date(scheduledAt).toISOString() }
                : {}),
            })
          : await createDriverBookingWithPayment({
              vehicleId,
              pickup,
              ...(dropoff ? { dropoff } : {}),
              packageHours,
            });

      navigate(`/app/bookings/${result.booking.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create booking'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell narrow>
      <ScreenHeader title={title} />

      {catalogMatch ? (
        <p className="muted" style={{ marginBottom: 16 }}>
          {catalogMatch.category.title} · {catalogMatch.service.label}
        </p>
      ) : null}

      {error ? <div className="toast-error">{error}</div> : null}

      {vehiclesLoading && vehicles.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <div className="spinner" />
        </div>
      ) : null}

      {!vehiclesLoading && vehicles.length === 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>No vehicles yet</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Add a vehicle before booking towing or driver hire.
          </p>
          <Button
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => navigate('/app/profile/vehicles/add')}
          >
            Add vehicle
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="field">
            <label htmlFor="vehicle">Vehicle</label>
            <select
              id="vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} · {v.vehicleNumber}
                </option>
              ))}
            </select>
          </div>

          <TextField
            label="Pickup address"
            placeholder="Where should we pick up?"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            required
            hint={
              <span className="muted" style={{ fontSize: 13 }}>
                Location defaults to Bhubaneswar if GPS is not set.
              </span>
            }
          />

          <TextField
            label={needsDropoff ? 'Drop-off address' : 'Drop-off address (optional)'}
            placeholder={needsDropoff ? 'Where should we drop off?' : 'Optional destination'}
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
            required={needsDropoff}
          />

          {bookingType === 'driver' ? (
            <div className="field">
              <label htmlFor="packageHours">Package hours</label>
              <select
                id="packageHours"
                value={packageHours}
                onChange={(e) =>
                  setPackageHours(Number(e.target.value) as (typeof PACKAGE_HOURS)[number])
                }
              >
                {PACKAGE_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h} hours
                  </option>
                ))}
              </select>
              <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Hatchback packages from ~₹1,499/mo on a driver subscription — see{' '}
                <Link to="/app/profile/subscriptions">Subscriptions</Link>.
              </p>
            </div>
          ) : null}

          {isScheduledTowing ? (
            <TextField
              label="Scheduled time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          ) : null}

          <div className="card-soft" style={{ margin: '12px 0 16px' }}>
            <strong>Advance payment</strong>
            <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
              After you confirm, we collect a stub advance payment and open your request to nearby
              partners.
            </p>
          </div>

          <Button type="submit" block disabled={submitting || !vehicleId}>
            {submitting ? 'Creating booking…' : 'Confirm & pay advance'}
          </Button>
        </form>
      )}
    </PageShell>
  );
}
