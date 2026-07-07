import type { DriverFareBreakdown, TowingFareBreakdown } from './fare';

export type ServiceBookingType = 'towing' | 'driver';

export interface BookingLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ServiceBooking {
  id: string;
  bookingNumber: string;
  customerId: string;
  vehicleId: string;
  pickup: BookingLocation;
  dropoff?: BookingLocation;
  distanceKm?: number;
  estimatedDurationHours?: number;
  packageHours?: number;
  vehicleCategory?: string;
  includedKm?: number;
  estimatedFare: number;
  fareBreakdown?: TowingFareBreakdown | DriverFareBreakdown;
  advanceAmount: number;
  advancePaid: boolean;
  advancePaymentId?: string;
  remainingAmount: number;
  remainingPaid: boolean;
  paymentStatus: string;
  status: string;
  scheduledAt?: string;
  statusHistory: Array<{ status: string; timestamp: string }>;
  createdAt: string;
  updatedAt: string;
  rating?: {
    score: number;
    review?: string;
    tags?: string[];
    createdAt: string;
  };
}

export interface CreateTowingBookingRequest {
  vehicleId: string;
  pickup: BookingLocation;
  dropoff: BookingLocation;
  scheduledAt?: string;
}

export interface CreateDriverBookingRequest {
  vehicleId: string;
  pickup: BookingLocation;
  dropoff?: BookingLocation;
  packageHours?: 2 | 4 | 8 | 12 | 24;
  estimatedDurationHours?: number;
  scheduledAt?: string;
}

export interface CreateRoadsideBookingRequest {
  serviceType: string;
  vehicleId: string;
  pickup: BookingLocation;
  dropoff?: BookingLocation;
  scheduledAt?: string;
}

export interface RoadsideAvailabilityItem {
  serviceType: string;
  label: string;
  available: boolean;
}

export interface RoadsideAvailabilityResponse {
  bookableCount: number;
  items: RoadsideAvailabilityItem[];
}

export interface RoadsideBookingResponse {
  available: boolean;
  message?: string;
  redirectedTo?: 'towing';
  serviceType: string;
  booking?: ServiceBooking;
}

export interface PaymentSession {
  transactionId: string;
  bookingId: string;
  bookingType: string;
  paymentType: 'advance' | 'final';
  amount: number;
  status: string;
  gatewayReferenceId: string;
  message: string;
}

export interface InitiatePaymentRequest {
  bookingId: string;
  bookingType: ServiceBookingType;
}

export interface VerifyPaymentRequest {
  transactionId: string;
  status: 'success' | 'failed';
}

export interface ServiceBookingTracking {
  bookingId: string;
  status: string;
  statusHistory: Array<{ status: string; timestamp: string }>;
  driverLocation?: {
    latitude: number;
    longitude: number;
    updatedAt?: string;
    driverName?: string;
    driverPhone?: string;
  };
  pickup: BookingLocation;
  dropoff?: BookingLocation;
}

export interface CancellationPolicy {
  canCancel: boolean;
  refundAmount: number;
  refundPercent: number;
  reason: string;
  cancellationFee: number;
}

export interface CancelBookingResult {
  message: string;
  refundAmount: number;
  refundStatus: string;
  policy: CancellationPolicy;
  booking: ServiceBooking;
}

export interface CombinedBookingListItem extends ServiceBooking {
  bookingType: 'towing' | 'driver';
  serviceLabel: string;
}
