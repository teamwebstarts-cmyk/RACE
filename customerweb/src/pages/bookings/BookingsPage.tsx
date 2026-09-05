import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { listBookings } from '../../services/bookingService';
import { getApiErrorMessage } from '../../services/api';

export function BookingsPage() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['bookings'],
    queryFn: listBookings,
  });

  return (
    <div className="page">
      <div className="content-wrap">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 36 }}>Bookings</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Active and past service requests
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/app/services')}>
            Browse services
          </Button>
        </div>

        {query.isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" />
          </div>
        ) : null}

        {query.isError ? (
          <div className="toast-error">{getApiErrorMessage(query.error)}</div>
        ) : null}

        {query.data && query.data.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="When you book towing, driver, or roadside help, it will show up here."
            action={
              <Button onClick={() => navigate('/app/services')}>Browse services</Button>
            }
          />
        ) : null}

        <div className="bookings-grid">
          {query.data?.map((booking) => (
            <button
              key={booking.id}
              type="button"
              className="list-row"
              style={{ alignItems: 'flex-start', minHeight: 120 }}
              onClick={() => navigate(`/app/bookings/${booking.id}`)}
            >
              <div className="meta">
                <strong style={{ fontSize: 18 }}>{booking.serviceLabel}</strong>
                <span>
                  {booking.bookingNumber} · {booking.status.replace(/_/g, ' ')}
                </span>
                {booking.pickup?.address ? (
                  <span style={{ display: 'block', marginTop: 8 }}>
                    {booking.pickup.address}
                  </span>
                ) : null}
              </div>
              <span className="chip">{booking.bookingType || 'service'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
