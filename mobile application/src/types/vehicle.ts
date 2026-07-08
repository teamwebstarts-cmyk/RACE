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

export type VehicleInput = CreateVehicleRequest;

export interface CreateVehicleRequest {
  vehicleType: VehicleType;
  vehicleSubtype?: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  color?: string;
  fuelType: FuelType;
  photo?: string;
}

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>;

export interface VehicleVerifyInvalidResponse {
  valid: false;
  vehicleId: string;
}

export interface VehicleVerifyValidResponse {
  valid: true;
  vehicleId: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  vehicleType: string;
  fuelType?: string;
  color?: string;
  ownerName?: string;
  ownerMobile?: string;
  emergencyName?: string;
  emergencyMobile?: string;
  emergencyRelationship?: string;
}

export type VehicleVerifyResponse = VehicleVerifyInvalidResponse | VehicleVerifyValidResponse;
