import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getBooking } from '../../services/bookingService';
import { getApiErrorMessage } from '../../services/api';

export function BookingDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
  });

  const booking = query.data;

  return (
    <PageShell narrow>
      <ScreenHeader title="Booking detail" />
      {query.isLoading ? <div className="spinner" /> : null}
      {query.isError ? (
        <div className="toast-error">{getApiErrorMessage(query.error)}</div>
      ) : null}
      {booking ? (
        <div className="list">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong style={{ fontSize: 18 }}>{booking.serviceLabel}</strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  {booking.bookingNumber}
                </p>
              </div>
              <span className="chip">{booking.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {booking.pickup ? (
            <div className="card">
              <strong>Pickup</strong>
              <p className="muted" style={{ marginTop: 6 }}>
                {booking.pickup.address}
              </p>
            </div>
          ) : null}
          {booking.dropoff ? (
            <div className="card">
              <strong>Drop</strong>
              <p className="muted" style={{ marginTop: 6 }}>
                {booking.dropoff.address}
              </p>
            </div>
          ) : null}
          {booking.driver ? (
            <div className="card">
              <strong>Driver</strong>
              <p className="muted" style={{ marginTop: 6 }}>
                {booking.driver.name}
                {booking.driver.phone ? ` · ${booking.driver.phone}` : ''}
              </p>
            </div>
          ) : null}
          {typeof booking.estimatedFare === 'number' ? (
            <div className="card">
              <strong>Fare</strong>
              <p style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>
                ₹{booking.estimatedFare}
              </p>
              <p className="muted" style={{ marginTop: 4 }}>
                Payment:{' '}
                {booking.paymentStatus || (booking.advancePaid ? 'Advance paid' : 'Pending')}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
