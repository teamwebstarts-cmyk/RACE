import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addBooking, setBookings, setBookingsLoading, updateBooking } from '../../redux/bookings/bookingsSlice';
import type { CreateBookingRequest, SubmitRatingRequest } from '../../types/booking';
import {
  createBookingApi,
  createLocalBooking,
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
  const bookings = useAppSelector((state) => state.bookings.items);
  return bookings.find((b) => b.id === bookingId) ?? null;
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
    },
  });
}

export function useSubmitRatingMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bookingId: string;
      payload: SubmitRatingRequest;
    }) => {
      await submitBookingRating(params.bookingId, params.payload);
      return params;
    },
    onSuccess: ({ bookingId, payload }) => {
      const bookings = queryClient.getQueryData<import('../../types/booking').Booking[]>(
        bookingKeys.all,
      );
      const existing = bookings?.find((b) => b.id === bookingId);
      if (existing) {
        dispatch(
          updateBooking({
            ...existing,
            rating: payload.rating,
            review: payload.review,
            status: 'PAID',
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
