import { useMutation } from '@tanstack/react-query';

import { useAppDispatch } from '../../redux/hooks';
import {
  completeProfileSuccess,
  setCredentials,
  setLoading,
  setPendingMobileNumber,
} from '../../redux/auth/authSlice';
import { completeProfile, sendOtp, verifyOtp } from '../../services/auth/authApi';
import type { CompleteProfileRequest } from '../../types/auth';
import { getApiErrorMessage } from '../api/apiClient';

export function useSendOtpMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: sendOtp,
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: (_data, variables) => {
      dispatch(setPendingMobileNumber(variables.mobileNumber));
      dispatch(setLoading(false));
    },
    onError: () => {
      dispatch(setLoading(false));
    },
  });
}

export function useVerifyOtpMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: verifyOtp,
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          onboardingRequired: data.onboardingRequired,
        }),
      );
    },
    onError: () => {
      dispatch(setLoading(false));
    },
  });
}

export function useCompleteProfileMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: CompleteProfileRequest) => completeProfile(payload),
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: (user) => {
      dispatch(completeProfileSuccess(user));
    },
    onError: () => {
      dispatch(setLoading(false));
    },
  });
}

export { getApiErrorMessage };
