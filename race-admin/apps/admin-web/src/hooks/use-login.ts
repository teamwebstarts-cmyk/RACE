import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { loginWithCredentials } from '@/api/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginFormValues } from '@/types/auth';

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginWithCredentials(values),
    onSuccess: (response) => {
      setUser(response.user, response.tokens.accessToken);
      navigate('/dashboard', { replace: true });
    },
  });
}
