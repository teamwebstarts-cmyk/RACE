import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  claimVendorDriver,
  createVendorDriver,
  listVendorDrivers,
  removeVendorDriver,
  type CreateFleetDriverInput,
} from './vendorDriversApi';

export const vendorDriverKeys = {
  list: ['vendor', 'drivers'] as const,
};

export function useVendorDriversQuery(enabled = true) {
  return useQuery({
    queryKey: vendorDriverKeys.list,
    queryFn: listVendorDrivers,
    enabled,
  });
}

export function useCreateVendorDriverMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFleetDriverInput) => createVendorDriver(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorDriverKeys.list });
    },
  });
}

export function useClaimVendorDriverMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => claimVendorDriver(phone),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorDriverKeys.list });
    },
  });
}

export function useRemoveVendorDriverMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (driverId: string) => removeVendorDriver(driverId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorDriverKeys.list });
    },
  });
}
