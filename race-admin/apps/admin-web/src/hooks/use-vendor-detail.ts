import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { approveVendor, getVendorById, rejectVendor } from '@race/api';

export function useVendorDetail(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendorById(id),
    enabled: Boolean(id),
  });
}

export function useVendorActions(id: string) {
  const queryClient = useQueryClient();

  const approve = useMutation({
    mutationFn: () => approveVendor(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['vendor', id], data);
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
      void queryClient.invalidateQueries({ queryKey: ['vendor-status-counts'] });
    },
  });

  const reject = useMutation({
    mutationFn: () => rejectVendor(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['vendor', id], data);
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
      void queryClient.invalidateQueries({ queryKey: ['vendor-status-counts'] });
    },
  });

  return { approve, reject };
}
