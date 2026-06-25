import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { approveDriver, getDriverById, rejectDriver, reviewDriverDocument } from '@race/api';

export function useDriverDetail(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => getDriverById(id),
    enabled: Boolean(id),
  });
}

export function useDriverActions(id: string) {
  const queryClient = useQueryClient();

  const approve = useMutation({
    mutationFn: () => approveDriver(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['driver', id] });
      void queryClient.invalidateQueries({ queryKey: ['drivers'] });
      void queryClient.invalidateQueries({ queryKey: ['driver-status-counts'] });
    },
  });

  const reject = useMutation({
    mutationFn: () => rejectDriver(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['driver', id] });
      void queryClient.invalidateQueries({ queryKey: ['drivers'] });
      void queryClient.invalidateQueries({ queryKey: ['driver-status-counts'] });
    },
  });

  return { approve, reject };
}

export function useDriverDocumentReview(driverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      status,
    }: {
      documentId: string;
      status: 'VERIFIED' | 'REJECTED';
    }) => reviewDriverDocument(driverId, documentId, status),
    onSuccess: (data) => {
      queryClient.setQueryData(['driver', driverId], data);
      void queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
