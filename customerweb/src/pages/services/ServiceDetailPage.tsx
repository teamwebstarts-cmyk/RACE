import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import {
  getCategoryHero,
  getCategoryTheme,
  getServiceById,
  getServiceIcon,
  isEmergencyService,
  isFutureCategory,
  type CategoryId,
} from '../../data/catalog';

type BookingNavType = 'towing' | 'driver' | null;

function resolveBookingType(categoryId: string): BookingNavType {
  if (categoryId === 'towing') return 'towing';
  if (categoryId === 'driver') return 'driver';
  // Roadside catalog items are non-towing for now (flat tyre, battery, etc.)
  if (categoryId === 'roadside') return null;
  return null;
}

export function ServiceDetailPage() {
  const { categoryId = '', serviceId = '' } = useParams();
  const navigate = useNavigate();
  const match = getServiceById(categoryId, serviceId);

  if (!match) {
    return <Navigate to="/app/services" replace />;
  }

  const { category, service } = match;
  const theme = getCategoryTheme(category.id as CategoryId);
  const Icon = getServiceIcon(service.id);
  const future = isFutureCategory(category.id);
  const emergency = isEmergencyService(service.id);
  const bookingType = resolveBookingType(category.id);
  const canBook = !future && bookingType !== null;

  const goToBooking = () => {
    if (!bookingType) return;
    const params = new URLSearchParams({
      category: category.id,
      service: service.id,
      type: bookingType,
    });
    navigate(`/app/bookings/new?${params.toString()}`);
  };

  const goComingSoon = () => {
    navigate('/app/services/coming-soon', {
      state: { title: service.label },
    });
  };

  let nextCopy: string;
  if (future) {
    nextCopy = 'This service is listed on your dashboard and will open for booking soon.';
  } else if (emergency && bookingType === 'towing') {
    nextCopy =
      'For urgent help, open SOS now. You can also book a tow if you prefer a scheduled partner dispatch.';
  } else if (canBook) {
    nextCopy =
      'Confirm pickup details, pay a small advance, and we will match you with a nearby partner.';
  } else {
    nextCopy =
      'This roadside option is listed on the dashboard. Multi-step booking for this service ships next.';
  }

  return (
    <div className="page">
      <div className="content-wrap" style={{ maxWidth: 860 }}>
        <ScreenHeader title={service.label} />

        <div className="service-detail-layout">
          <div className="service-detail-media">
            <img src={getCategoryHero(category.id)} alt={service.label} />
          </div>

          <div className="service-detail-panel card">
            <div
              className="service-card-icon"
              style={{
                background: theme.background,
                color: theme.accent,
                width: 56,
                height: 56,
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <Icon size={26} />
            </div>

            <span className="chip" style={{ background: theme.background, color: theme.accent }}>
              {category.title}
            </span>
            <h1 style={{ fontSize: 32, marginTop: 12 }}>{service.label}</h1>
            <p className="muted" style={{ marginTop: 10, marginBottom: 24 }}>
              {service.description}
            </p>

            <div className="card-soft" style={{ marginBottom: 20 }}>
              <strong>What happens next</strong>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                {nextCopy}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {emergency ? (
                <Button block className="btn-danger" onClick={() => navigate('/app/call')}>
                  Open SOS now
                </Button>
              ) : null}

              {canBook ? (
                <Button block onClick={goToBooking}>
                  {emergency ? 'Book towing instead' : 'Continue to booking'}
                </Button>
              ) : (
                <Button block onClick={goComingSoon}>
                  {future ? 'Notify me when available' : 'Continue to booking'}
                </Button>
              )}

              <Button
                variant="outline"
                block
                onClick={() => navigate(`/app/services/${category.id}`)}
              >
                Back to {category.title}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
