import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createVendor, deleteVendor, updateVendor } from '@race/api';

export function useVendorMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['vendors'] });
  return {
    create: useMutation({ mutationFn: createVendor, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateVendor>[1] }) =>
        updateVendor(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteVendor, onSuccess: invalidate }),
  };
}
