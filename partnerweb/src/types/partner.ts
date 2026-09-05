export type PartnerRole = 'vendor' | 'driver';

export type DriverJobBooking = {
  bookingType: 'towing' | 'driver';
  id: string;
  bookingNumber: string;
  status: string;
  pickup?: {
    label?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  dropoff?: {
    label?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  estimatedFare?: number;
  createdAt: string;
  distanceKm?: number;
  serviceLabel?: string;
};

export type FleetDriver = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  driverType: string;
  licenseNo: string;
  city: string;
  vehicleRegistration?: string;
  status: string;
  isAvailable: boolean;
  isBusy: boolean;
  rating: number;
  vendorId: string;
};

export type CreateFleetDriverInput = {
  name: string;
  phone: string;
  licenseNo: string;
  driverType: 'Tow Driver' | 'Full-Time' | 'Part-Time';
  city?: string;
  vehicleRegistration?: string;
  email?: string;
};

export type FleetVehicleStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export type FleetVehicle = {
  id: string;
  vendorId: string;
  registrationNo: string;
  type: string;
  model: string;
  year?: number;
  status: FleetVehicleStatus | string;
  insuranceExpiry?: string;
  maintenanceNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFleetVehicleInput = {
  registrationNo: string;
  type: string;
  model: string;
  year?: number;
  status?: FleetVehicleStatus;
  insuranceExpiry?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  rcNumber?: string;
};

export type DriverRegisterPayload = {
  fullName: string;
  email?: string;
  address?: string;
  licenseNo: string;
  driverType: 'Tow Driver' | 'Full-Time' | 'Part-Time';
  vehicleRegistration?: string;
  city: string;
  vehicleType?: string;
};
