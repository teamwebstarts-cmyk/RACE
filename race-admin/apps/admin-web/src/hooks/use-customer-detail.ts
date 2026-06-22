import { useQuery } from '@tanstack/react-query';

import { getCustomerById } from '@race/api';

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
  });
}
