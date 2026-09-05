import { useParams, useSearchParams } from 'react-router-dom';

import { BookingDetailContent } from '@/components/bookings/booking-detail-content';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  if (!id) return null;
  return (
    <BookingDetailContent
      bookingId={id}
      bookingType={type === 'towing' || type === 'driver' || type === 'legacy' ? type : undefined}
    />
  );
}
