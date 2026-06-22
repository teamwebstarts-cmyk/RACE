import { useQuery } from '@tanstack/react-query';

import { getBookingById } from '@race/api';

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id),
    enabled: Boolean(id),
  });
}
