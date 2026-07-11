import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptDriverJob,
  getDriverActiveJob,
  listDriverJobs,
  rejectDriverJob,
  setDriverAvailability,
  updateDriverBookingStatus,
  updateDriverLocation,
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

export function useAcceptDriverJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; bookingType: 'towing' | 'driver' }) =>
      acceptDriverJob(input.bookingId, input.bookingType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverQueryKeys.jobs });
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
    }) => updateDriverBookingStatus(input.bookingId, input.bookingType, input.status),
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
