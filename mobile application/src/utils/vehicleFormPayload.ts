import type { CreateVehicleRequest, FuelType, VehicleType } from '../types/vehicle';

const HEX_COLOR_NAMES: Record<string, string> = {
  '#FFFFFF': 'White',
  '#9E9E9E': 'Gray',
  '#000000': 'Black',
  '#C0C0C0': 'Silver',
  '#EF4444': 'Red',
  '#3B82F6': 'Blue',
  '#6B7280': 'Gray',
};

export function hexToColorName(hex: string): string {
  const normalized = hex.trim().toUpperCase();
  return HEX_COLOR_NAMES[normalized] ?? 'Other';
}

export function labelToFuelType(label: string): FuelType {
  const normalized = label.trim().toLowerCase();
  if (normalized === 'ev') return 'electric';
  return normalized as FuelType;
}

export interface VehicleFormValues {
  vehicleType: string;
  vehicleSubtype?: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  colorHex: string;
  fuelLabel: string;
}

export function buildCreateVehiclePayload(values: VehicleFormValues): CreateVehicleRequest {
  const vehicleType = values.vehicleType as VehicleType;
  const fuelType =
    vehicleType === 'ev' ? 'electric' : labelToFuelType(values.fuelLabel);

  return {
    vehicleType,
    ...(values.vehicleSubtype ? { vehicleSubtype: values.vehicleSubtype } : {}),
    vehicleNumber: values.vehicleNumber.trim().toUpperCase(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    color: hexToColorName(values.colorHex),
    fuelType,
  };
}
