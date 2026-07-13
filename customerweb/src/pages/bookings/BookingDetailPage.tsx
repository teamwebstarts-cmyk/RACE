import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getBooking } from '../../services/bookingService';
import { getApiErrorMessage } from '../../services/api';

const POLL_STATUSES = new Set([
  'PENDING',
  'CONFIRMED',
  'DRIVER_ASSIGNED',
  'CREATED',
  'ASSIGNED',
  'ACCEPTED',
]);

function shouldPoll(status: string | undefined, hasDriver: boolean): boolean {
  if (!status || hasDriver) return false;
  return POLL_STATUSES.has(status);
}

function statusHeadline(status: string, hasDriver: boolean): string {
  if (hasDriver || status === 'DRIVER_EN_ROUTE' || status === 'EN_ROUTE') {
    return 'Partner on the way';
  }
  if (status === 'DRIVER_ARRIVED' || status === 'ARRIVED') {
    return 'Partner has arrived';
  }
  if (
    status === 'IN_PROGRESS' ||
    status === 'SERVICE_STARTED' ||
    status === 'SERVICE_COMPLETED' ||
    status === 'COMPLETED'
  ) {
    return 'Service in progress';
  }
  if (status === 'CANCELLED') {
    return 'Booking cancelled';
  }
  return 'Finding nearby partners…';
}

export function BookingDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
    refetchInterval: (q) => {
      const booking = q.state.data;
      return shouldPoll(booking?.status, Boolean(booking?.driver)) ? 4000 : false;
    },
  });

  const booking = query.data;
  const hasDriver = Boolean(booking?.driver);
  const headline = booking
    ? statusHeadline(booking.status, hasDriver)
    : 'Loading booking…';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: 18 }}>{booking.serviceLabel}</strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  {booking.bookingNumber}
                  {booking.bookingType ? ` · ${booking.bookingType}` : ''}
                </p>
              </div>
              <span className="chip">{booking.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="card">
            <strong>{headline}</strong>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              {hasDriver
                ? 'Your partner accepted the trip. Track details below.'
                : 'We are notifying nearby partners. This page updates automatically.'}
            </p>
            {shouldPoll(booking.status, hasDriver) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span className="muted" style={{ fontSize: 13 }}>
                  Searching for partners…
                </span>
              </div>
            ) : null}
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
              <strong>Partner assigned</strong>
              <p style={{ marginTop: 6, fontWeight: 600 }}>{booking.driver.name}</p>
              {booking.driver.phone ? (
                <p className="muted" style={{ marginTop: 4 }}>
                  {booking.driver.phone}
                </p>
              ) : null}
              {typeof booking.driver.rating === 'number' ? (
                <p className="muted" style={{ marginTop: 4 }}>
                  Rating {booking.driver.rating.toFixed(1)}
                </p>
              ) : null}
              {booking.assignedFleetVehicleLabel ? (
                <p className="muted" style={{ marginTop: 8 }}>
                  Vehicle: {booking.assignedFleetVehicleLabel}
                </p>
              ) : null}
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
