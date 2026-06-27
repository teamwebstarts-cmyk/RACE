export interface AuthUser {
  id: string;
  mobileNumber: string;
  role: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  fullName?: string;
  email?: string;
  gender?: string;
}

export type User = AuthUser;

export interface SendOtpRequest {
  mobileNumber: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  isExistingUser: boolean;
  isProfileCompleted: boolean;
}

export interface VerifyOtpRequest {
  mobileNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
  onboardingRequired: boolean;
}

export interface CompleteProfileRequest {
  fullName: string;
  email: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyContact: {
    name: string;
    mobileNumber: string;
    relationship?: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}
