import { useParams } from 'react-router-dom';

import { VendorDetailContent } from '@/components/vendors/vendor-detail-content';

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <VendorDetailContent vendorId={id} />;
}
