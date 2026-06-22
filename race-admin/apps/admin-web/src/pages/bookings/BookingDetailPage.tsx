import { useParams } from 'react-router-dom';

import { BookingDetailContent } from '@/components/bookings/booking-detail-content';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <BookingDetailContent bookingId={id} />;
}
