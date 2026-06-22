import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { changePassword, getProfile, updateProfile, updateProfileImage } from '@race/api';
import type { ChangePasswordPayload, ProfileData } from '@race/types';

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const update = useMutation({
    mutationFn: (data: Partial<ProfileData>) => updateProfile(data),
    onSuccess: (data) => queryClient.setQueryData(['profile'], data),
  });

  const password = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });

  const avatar = useMutation({
    mutationFn: (file: File) => updateProfileImage(file),
    onSuccess: (data) => queryClient.setQueryData(['profile'], data),
  });

  return { ...query, update, password, avatar };
}
