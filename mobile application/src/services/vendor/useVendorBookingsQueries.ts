import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { assignVendorBooking, listVendorBookingOffers } from './vendorBookingsApi';
import {
  createVendorVehicle,
  listVendorVehicles,
  removeVendorVehicle,
  updateVendorVehicle,
  type CreateFleetVehicleInput,
  type UpdateFleetVehicleInput,
} from './vendorVehiclesApi';
import { createVendorDriver, listVendorDrivers, type CreateFleetDriverInput } from './vendorDriversApi';
import { driverQueryKeys } from '../driver/useDriverQueries';
import { vendorDriverKeys } from './useVendorDriversQueries';

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

export function useVendorFleetVehiclesQuery(enabled = true, activeOnly = true) {
  return useQuery({
    queryKey: [...vendorBookingQueryKeys.vehicles, activeOnly ? 'active' : 'all'] as const,
    queryFn: async () => {
      const vehicles = await listVendorVehicles();
      return activeOnly ? vehicles.filter(v => v.status === 'ACTIVE') : vehicles;
    },
    enabled,
    refetchInterval: 30_000,
  });
}

export function useCreateVendorVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFleetVehicleInput) => createVendorVehicle(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.vehicles });
    },
  });
}

export function useUpdateVendorVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      vehicleId,
      payload,
    }: {
      vehicleId: string;
      payload: UpdateFleetVehicleInput;
    }) => updateVendorVehicle(vehicleId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.vehicles });
    },
  });
}

export function useRemoveVendorVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => removeVendorVehicle(vehicleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.vehicles });
    },
  });
}

export function useAssignDriverToVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFleetDriverInput) => createVendorDriver(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorBookingQueryKeys.drivers });
      void queryClient.invalidateQueries({ queryKey: vendorDriverKeys.list });
    },
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
