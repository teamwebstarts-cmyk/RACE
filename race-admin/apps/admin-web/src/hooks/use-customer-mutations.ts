import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCustomer, deleteCustomer, updateCustomer } from '@race/api';

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['customers'] });

  const create = useMutation({
    mutationFn: createCustomer,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCustomer>[1] }) =>
      updateCustomer(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
