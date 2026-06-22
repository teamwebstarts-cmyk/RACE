import { login as apiLogin, logout as apiLogout } from '@race/api';
import type { LoginResponse } from '@race/types';

import type { LoginFormValues } from '@/types/auth';

export async function loginWithCredentials(
  values: LoginFormValues,
): Promise<LoginResponse> {
  return apiLogin({
    identifier: values.identifier.trim(),
    password: values.password,
    rememberMe: values.rememberMe,
  });
}

export async function logoutSession(): Promise<void> {
  await apiLogout();
}
