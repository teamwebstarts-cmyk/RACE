import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDriver, deleteDriver, updateDriver } from '@race/api';

export function useDriverMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['drivers'] });
  return {
    create: useMutation({ mutationFn: createDriver, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDriver>[1] }) =>
        updateDriver(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteDriver, onSuccess: invalidate }),
  };
}
