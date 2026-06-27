import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateUser } from '../redux/auth/authSlice';
import { getProfile } from '../services/auth/authApi';

/**
 * Refreshes the user profile on launch so role changes (e.g. vendor approval) apply without re-login.
 */
export function useAuthSessionSync() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    void getProfile()
      .then((profile) => dispatch(updateUser(profile)))
      .catch(() => undefined);
  }, [accessToken, dispatch]);
}
