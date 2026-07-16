import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { assignVendorBooking, listVendorBookingOffers } from './vendorBookingsApi';
import { listVendorVehicles } from './vendorVehiclesApi';
import { listVendorDrivers } from './vendorDriversApi';
import { driverQueryKeys } from '../driver/useDriverQueries';

export const vendorBookingQueryKeys = {
  offers: ['vendor', 'booking-offers'] as const,
  drivers: ['vendor', 'drivers'] as const,
  vehicles: ['vendor', 'vehicles'] as const,
};

export function useVendorBookingOffersQuery(enabled = true) {
  return useQuery({
    queryKey: vendorBookingQueryKeys.offers,
    queryFn: listVendorBookingOffers,
    enabled,
    refetchInterval: 8_000,
  });
}

export function useVendorFleetDriversQuery(enabled = true) {
  return useQuery({
    queryKey: vendorBookingQueryKeys.drivers,
    queryFn: listVendorDrivers,
    enabled,
    refetchInterval: 15_000,
  });
}

export function useVendorFleetVehiclesQuery(enabled = true) {
  return useQuery({
    queryKey: vendorBookingQueryKeys.vehicles,
    queryFn: async () => {
      const vehicles = await listVendorVehicles();
      return vehicles.filter(v => v.status === 'ACTIVE');
    },
    enabled,
    refetchInterval: 30_000,
  });
}

export function useAssignVendorBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignVendorBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.offers });
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.drivers });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
    },
  });
}
