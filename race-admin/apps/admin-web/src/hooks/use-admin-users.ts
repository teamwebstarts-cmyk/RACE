import { useQuery } from '@tanstack/react-query';

import { getAdminUsersData } from '@race/api';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsersData,
  });
}
