import { useParams } from 'react-router-dom';

import { CustomerDetailContent } from '@/components/customers/customer-detail-content';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <CustomerDetailContent customerId={id} />;
}
