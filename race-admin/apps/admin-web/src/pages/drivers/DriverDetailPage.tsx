import { useParams } from 'react-router-dom';

import { DriverDetailContent } from '@/components/drivers/driver-detail-content';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <DriverDetailContent driverId={id} />;
}
