import { useQuery } from '@tanstack/react-query';

import { getDriverById } from '@race/api';

export function useDriverDetail(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => getDriverById(id),
    enabled: Boolean(id),
  });
}
