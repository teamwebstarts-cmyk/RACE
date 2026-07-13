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
  driverRegister: '/api/v1/driver/register',
  driverAvailability: '/api/v1/driver/availability',
  driverLocation: '/api/v1/driver/location',
  driverMyBookings: '/api/v1/driver/bookings',
  driverBookingOffers: '/api/v1/driver/bookings/offers',
  driverActiveBooking: '/api/v1/driver/bookings/active',
  driverBookingStatus: (id: string) => `/api/v1/driver/bookings/${id}/status`,
  driverBookingAccept: (id: string) => `/api/v1/driver/bookings/${id}/accept`,
  driverBookingReject: (id: string) => `/api/v1/driver/bookings/${id}/reject`,
  vendorRegister: '/api/v1/vendor/register',
  vendorDraft: '/api/v1/vendor/draft',
  vendorUpdate: '/api/v1/vendor/update',
  vendorProfile: '/api/v1/vendor/profile',
  vendorStatus: '/api/v1/vendor/status',
  vendorDashboard: '/api/v1/vendor/dashboard',
  vendorUploadDocument: '/api/v1/vendor/upload-document',
  vendorSelfie: '/api/v1/vendor/selfie',
  vendorDrivers: '/api/v1/vendor/drivers',
  vendorDriverClaim: '/api/v1/vendor/drivers/claim',
  vendorDriver: (id: string) => `/api/v1/vendor/drivers/${id}`,
  vendorDriverUploadDocument: (id: string) =>
    `/api/v1/vendor/drivers/${id}/upload-document`,
  vendorVehicles: '/api/v1/vendor/vehicles',
  vendorVehicle: (id: string) => `/api/v1/vendor/vehicles/${id}`,
  vendorBookingOffers: '/api/v1/vendor/bookings/offers',
} as const;
