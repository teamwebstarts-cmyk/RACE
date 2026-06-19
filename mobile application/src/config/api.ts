import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extraApiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;

const DEV_API_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_CONFIG = {
  baseUrl: extraApiUrl ?? `http://${DEV_API_HOST}:3000`,
  timeoutMs: 12000,
} as const;

export const API_ENDPOINTS = {
  health: '/health',
  brand: '/api/v1/brand',
  services: '/api/v1/services',
  sendOtp: '/api/v1/auth/send-otp',
  verifyOtp: '/api/v1/auth/verify-otp',
  refreshToken: '/api/v1/auth/refresh-token',
  profile: '/api/v1/profile',
  profileComplete: '/api/v1/profile/complete',
  vehicles: '/api/v1/vehicles',
  vendorRegister: '/api/v1/vendor/register',
  vendorDraft: '/api/v1/vendor/draft',
  vendorUpdate: '/api/v1/vendor/update',
  vendorProfile: '/api/v1/vendor/profile',
  vendorStatus: '/api/v1/vendor/status',
  vendorUploadDocument: '/api/v1/vendor/upload-document',
  vendorSelfie: '/api/v1/vendor/selfie',
  bookings: '/api/v1/bookings',
  bookingRating: (id: string) => `/api/v1/bookings/${id}/rating`,
  savedLocations: '/api/v1/profile/locations',
  paymentMethods: '/api/v1/profile/payment-methods',
  notifications: '/api/v1/profile/notifications',
  subscriptions: '/api/v1/subscriptions',
  subscriptionPlans: '/api/v1/subscriptions/plans',
  tracking: (id: string) => `/api/v1/bookings/${id}/tracking`,
  sosConfig: '/api/v1/sos/config',
  sosContext: '/api/v1/sos/context',
  sosAlert: '/api/v1/sos/alert',
  wallet: '/api/v1/profile/wallet',
} as const;
