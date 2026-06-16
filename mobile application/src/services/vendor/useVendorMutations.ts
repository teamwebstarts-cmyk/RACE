import { useMutation } from '@tanstack/react-query';

import type { VendorRegistrationRequest } from '../../types/auth';
import { registerVendor } from './vendorApi';

export function useRegisterVendorMutation() {
  return useMutation({
    mutationFn: (payload: VendorRegistrationRequest) => registerVendor(payload),
  });
}
