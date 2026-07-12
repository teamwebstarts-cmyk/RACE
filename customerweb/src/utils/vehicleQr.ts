import { API_BASE_URL } from '../config/env';
import type { Profile, Vehicle } from '../types/models';

/** Public scan URL encoded into each vehicle QR (backend + client render). */
export function getVehicleQrScanUrl(vehicleId: string): string {
  return `${API_BASE_URL}/api/v1/qr/${vehicleId}`;
}

export function buildVehicleQrSummary(vehicle: Vehicle, profile: Profile | null) {
  return {
    scanUrl: getVehicleQrScanUrl(vehicle.id),
    ownerName: profile?.fullName || 'Customer',
    ownerMobile: profile?.mobileNumber || '',
    emergencyName: profile?.emergencyContact?.name || '',
    emergencyMobile: profile?.emergencyContact?.mobileNumber || '',
    emergencyRelationship: profile?.emergencyContact?.relationship || '',
    vehicleLabel: `${vehicle.brand} ${vehicle.model}`,
    vehicleNumber: vehicle.vehicleNumber,
    vehicleType: vehicle.vehicleType,
    color: vehicle.color || '—',
    fuelType: vehicle.fuelType,
  };
}

/** Prefer backend-generated PNG data URL; otherwise scan URL for client QR libs. */
export function getVehicleQrImageSrc(vehicle: Vehicle): string | null {
  if (vehicle.qrCode?.startsWith('data:image')) {
    return vehicle.qrCode;
  }
  return null;
}
