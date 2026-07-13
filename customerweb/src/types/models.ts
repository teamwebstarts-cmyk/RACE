export type VehicleType = 'car' | 'bike' | 'ev' | 'truck' | 'auto' | 'bus' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | 'other';

export interface Vehicle {
  id: string;
  customerId: string;
  vehicleType: VehicleType;
  vehicleSubtype?: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  color?: string;
  fuelType: FuelType;
  qrCode: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  vehicleType: VehicleType;
  vehicleSubtype?: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  color?: string;
  fuelType: FuelType;
  photo?: string;
}

export interface Profile {
  id: string;
  mobileNumber: string;
  fullName?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    mobileNumber: string;
    relationship?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  profilePhoto?: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  role: 'customer' | 'vendor' | 'driver';
}

export type BookingStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingNumber: string;
  bookingType?: 'towing' | 'driver' | 'roadside';
  serviceLabel: string;
  status: string;
  vehicleId?: string;
  pickup?: { address: string; latitude?: number; longitude?: number };
  dropoff?: { address: string; latitude?: number; longitude?: number };
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedFare?: number;
  advancePaid?: boolean;
  paymentStatus?: string;
  driver?: { id: string; name: string; rating?: number; phone?: string };
  assignedFleetVehicleLabel?: string;
}
