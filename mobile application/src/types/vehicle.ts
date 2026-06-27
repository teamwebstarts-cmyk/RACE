export type VehicleType = 'car' | 'bike' | 'truck' | 'bus' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | 'other';

export interface Vehicle {
  id: string;
  customerId: string;
  vehicleType: VehicleType;
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
  vehicleNumber: string;
  brand: string;
  model: string;
  color?: string;
  fuelType: FuelType;
}

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>;
