import { useQuery } from '@tanstack/react-query';

import { getCustomerById } from '@race/api';

import { useAuthStore } from '@/stores/auth.store';

export function useCustomerDetail(id: string) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id) && hasHydrated,
  });
}
