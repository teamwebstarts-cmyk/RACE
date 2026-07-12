import { API_BASE_URL } from './env';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeoutMs: 15000,
} as const;

export const API_ENDPOINTS = {
  sendOtp: '/api/v1/auth/send-otp',
  verifyOtp: '/api/v1/auth/verify-otp',
  refreshToken: '/api/v1/auth/refresh-token',
  profile: '/api/v1/profile',
  profileComplete: '/api/v1/profile/complete',
  vehicles: '/api/v1/vehicles',
  bookings: '/api/v1/bookings',
  towingBooking: (id: string) => `/api/v1/bookings/towing/${id}`,
  driverBooking: (id: string) => `/api/v1/bookings/driver/${id}`,
  brand: '/api/v1/brand',
  services: '/api/v1/services',
  sosConfig: '/api/v1/sos/config',
  sosContext: '/api/v1/sos/context',
  sosAlert: '/api/v1/sos/alert',
  notifications: '/api/v1/profile/notifications',
  savedLocations: '/api/v1/profile/locations',
  subscriptionPlans: '/api/v1/subscriptions/plans',
} as const;
