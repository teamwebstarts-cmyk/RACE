import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import {
  getVendorDashboard,
  getVendorProfile,
  getVendorStatus,
  registerVendor,
  saveVendorDraft,
  updateVendor,
  uploadVendorDocument,
  uploadVendorSelfie,
} from './vendorApi';
import type { VendorRegistrationRequest } from '../../types/vendor';

export function useVendorStatusQuery(enabled = true) {
  return useQuery({
    queryKey: ['vendor', 'status'],
    queryFn: async () => {
      try {
        return await getVendorStatus();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    // While waiting on admin review, poll so dashboard updates after approve.
    refetchInterval: query => {
      const status = query.state.data?.status;
      if (!status || status === 'approved' || status === 'rejected') return false;
      return 15_000;
    },
  });
}

export function useVendorDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: getVendorDashboard,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useVendorProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: getVendorProfile,
    enabled,
    retry: false,
  });
}

export function useSaveVendorDraftMutation() {
  return useMutation({
    mutationFn: saveVendorDraft,
  });
}

export function useUpdateVendorMutation() {
  return useMutation({
    mutationFn: updateVendor,
  });
}

export function useRegisterVendorMutation() {
  return useMutation({
    mutationFn: (payload: VendorRegistrationRequest) => registerVendor(payload),
  });
}

export function useUploadVendorDocumentMutation() {
  return useMutation({
    mutationFn: ({
      documentType,
      file,
      onProgress,
    }: {
      documentType: string;
      file: { uri: string; name: string; mimeType: string };
      onProgress?: (progress: number) => void;
    }) => uploadVendorDocument(documentType, file, onProgress),
  });
}

export function useUploadVendorSelfieMutation() {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: { uri: string; name: string; mimeType: string };
      onProgress?: (progress: number) => void;
    }) => uploadVendorSelfie(file, onProgress),
  });
}
