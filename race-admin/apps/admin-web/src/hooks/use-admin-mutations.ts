import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAdminUser, deleteAdminUser, updateAdminUser } from '@race/api';

export function useAdminUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin-users'] });
  return {
    create: useMutation({ mutationFn: createAdminUser, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAdminUser>[1] }) =>
        updateAdminUser(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteAdminUser, onSuccess: invalidate }),
  };
}
