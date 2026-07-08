import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getDriverActiveJob,
  listDriverJobs,
  setDriverAvailability,
} from './driverApi';

export const driverQueryKeys = {
  jobs: ['driver', 'jobs'] as const,
  active: ['driver', 'active'] as const,
};

export function useDriverJobsQuery(enabled = true) {
  return useQuery({
    queryKey: driverQueryKeys.jobs,
    queryFn: () => listDriverJobs(),
    enabled,
    refetchInterval: 15_000,
  });
}

export function useDriverActiveJobQuery(enabled = true) {
  return useQuery({
    queryKey: driverQueryKeys.active,
    queryFn: getDriverActiveJob,
    enabled,
    refetchInterval: 10_000,
  });
}

export function useDriverAvailabilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) => setDriverAvailability(isAvailable),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.active });
    },
  });
}
