import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { approveVendor, createVendorVehicle, deleteVendorVehicle, getVendorById, rejectVendor, reviewVendorDocument, updateVendorVehicle } from '@race/api';

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

export function useVendorDocumentReview(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      docKey,
      status,
    }: {
      docKey: string;
      status: 'VERIFIED' | 'REJECTED';
    }) => reviewVendorDocument(vendorId, docKey, status),
    onSuccess: (data) => {
      queryClient.setQueryData(['vendor', vendorId], data);
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useVendorVehicleMutations(vendorId: string) {
  const queryClient = useQueryClient();

  const createVehicle = useMutation({
    mutationFn: (input: {
      registrationNo: string;
      type: string;
      model: string;
      year?: number;
      status?: string;
    }) => createVendorVehicle(vendorId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: ({
      vehicleId,
      input,
    }: {
      vehicleId: string;
      input: {
        type?: string;
        model?: string;
        year?: number;
        status?: string;
      };
    }) => updateVendorVehicle(vehicleId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const removeVehicle = useMutation({
    mutationFn: (vehicleId: string) => deleteVendorVehicle(vehicleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      void queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  return { createVehicle, updateVehicle, removeVehicle };
}
