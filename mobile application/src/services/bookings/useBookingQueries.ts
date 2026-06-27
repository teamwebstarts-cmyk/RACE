import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addBooking,
  setBookings,
  setBookingsLoading,
  updateBooking,
} from '../../redux/bookings/bookingsSlice';
import type { Booking, CreateBookingRequest, SubmitRatingRequest } from '../../types/booking';
import {
  createBookingApi,
  createLocalBooking,
  getBooking,
  listBookings,
  submitBookingRating,
} from './bookingApi';

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
};

export function useBookingsQuery() {
  const dispatch = useAppDispatch();
  const localBookings = useAppSelector((state) => state.bookings.items);

  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: async () => {
      dispatch(setBookingsLoading(true));
      const remote = await listBookings();
      const merged = remote.length > 0 ? remote : localBookings;
      dispatch(setBookings(merged));
      return merged;
    },
    initialData: localBookings,
  });
}

export function useBookingQuery(bookingId: string) {
  const dispatch = useAppDispatch();
  const localBooking = useAppSelector((state) =>
    state.bookings.items.find((b) => b.id === bookingId),
  );

  const query = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: async () => {
      const remote = await getBooking(bookingId);
      if (remote) {
        dispatch(updateBooking(remote));
        return remote;
      }
      return localBooking ?? null;
    },
    enabled: Boolean(bookingId),
    initialData: localBooking,
  });

  return query.data ?? null;
}

export function useCreateBookingMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      payload: CreateBookingRequest;
      vehicleNumber: string;
      vehicleLabel?: string;
    }) => {
      const remote = await createBookingApi(params.payload);
      if (remote) return remote;
      return createLocalBooking(params.payload, params.vehicleNumber, params.vehicleLabel);
    },
    onSuccess: (booking) => {
      dispatch(addBooking(booking));
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
    },
  });
}

export function useSubmitRatingMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: string; payload: SubmitRatingRequest }) => {
      try {
        return await submitBookingRating(params.bookingId, params.payload);
      } catch {
        const bookings = queryClient.getQueryData<Booking[]>(bookingKeys.all);
        const existing = bookings?.find((b) => b.id === params.bookingId);
        if (!existing) throw new Error('Booking not found');
        return {
          ...existing,
          rating: params.payload.rating,
          review: params.payload.review,
          status: 'PAID' as const,
        };
      }
    },
    onSuccess: (booking) => {
      dispatch(updateBooking(booking));
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
    },
  });
}
