import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking, deleteBooking, updateBooking } from '@race/api';

export function useBookingMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['bookings'] });
  return {
    create: useMutation({ mutationFn: createBooking, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateBooking>[1] }) =>
        updateBooking(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteBooking, onSuccess: invalidate }),
  };
}
