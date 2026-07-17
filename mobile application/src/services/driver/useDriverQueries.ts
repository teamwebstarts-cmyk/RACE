import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptDriverJob,
  getDriverActiveJob,
  listDriverJobOffers,
  listDriverJobs,
  rejectDriverJob,
  setDriverAvailability,
  updateDriverBookingStatus,
  updateDriverLocation,
} from './driverApi';

export const driverQueryKeys = {
  jobs: ['driver', 'jobs'] as const,
  offers: ['driver', 'offers'] as const,
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

export function useDriverJobOffersQuery(enabled = true) {
  return useQuery({
    queryKey: driverQueryKeys.offers,
    queryFn: listDriverJobOffers,
    enabled,
    refetchInterval: 8_000,
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

export function useAcceptDriverJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; bookingType: 'towing' | 'driver' }) =>
      acceptDriverJob(input.bookingId, input.bookingType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.offers });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.active });
    },
  });
}

export function useRejectDriverJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; bookingType: 'towing' | 'driver' }) =>
      rejectDriverJob(input.bookingId, input.bookingType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.offers });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.active });
    },
  });
}

export function useUpdateDriverBookingStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      bookingId: string;
      bookingType: 'towing' | 'driver';
      status: string;
      tripOtp?: string;
    }) =>
      updateDriverBookingStatus(
        input.bookingId,
        input.bookingType,
        input.status,
        input.tripOtp,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.active });
    },
  });
}

export function useUpdateDriverLocationMutation() {
  return useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) =>
      updateDriverLocation(coords.latitude, coords.longitude),
  });
}
