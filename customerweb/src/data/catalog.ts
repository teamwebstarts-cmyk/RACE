import type { LucideIcon } from 'lucide-react';
import {
  Ambulance,
  BatteryCharging,
  Building2,
  Car,
  ClipboardCheck,
  Clock3,
  Droplets,
  Fuel,
  Moon,
  Route,
  Shield,
  Siren,
  Timer,
  Truck,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';

import { images } from '../assets';
import { categoryThemes } from '../theme/colors';
import servicesJson from './services.json';

export type CategoryId = 'towing' | 'driver' | 'roadside' | 'future';

export interface CatalogService {
  id: string;
  label: string;
  description: string;
}

export interface ServiceCategory {
  id: CategoryId;
  title: string;
  description: string;
  services: CatalogService[];
}

export const SERVICE_CATEGORIES = servicesJson as ServiceCategory[];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((category) => category.id === id);
}

export function getServiceById(
  categoryId: string,
  serviceId: string,
): { category: ServiceCategory; service: CatalogService } | undefined {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  const service = category.services.find((item) => item.id === serviceId);
  if (!service) return undefined;
  return { category, service };
}

export function getCategoryTheme(id: CategoryId) {
  return categoryThemes[id];
}

export function getCategoryImage(id: CategoryId) {
  switch (id) {
    case 'towing':
      return images.towingImg;
    case 'driver':
      return images.driverImg;
    case 'roadside':
      return images.roadsideImg;
    case 'future':
      return images.repairImg;
    default:
      return images.homeHero;
  }
}

export function getCategoryHero(id: CategoryId) {
  switch (id) {
    case 'towing':
      return images.towingHero;
    case 'driver':
      return images.driverHero;
    case 'roadside':
      return images.roadsideHero;
    case 'future':
      return images.repairImg;
    default:
      return images.homeHero;
  }
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  towing_instant: Timer,
  towing_scheduled: Clock3,
  towing_emergency: Siren,
  driver_part_time: UserRound,
  driver_full_time: Car,
  driver_outstation: Route,
  driver_night: Moon,
  roadside_flat_tyre: Droplets,
  roadside_battery_jump: BatteryCharging,
  roadside_fuel_delivery: Fuel,
  roadside_minor_repair: Wrench,
  car_wash: Droplets,
  vehicle_inspection: ClipboardCheck,
  insurance_assistance: Shield,
  ev_charging: Zap,
  ambulance: Ambulance,
  corporate_fleet: Building2,
  vehicle_pickup_drop: Truck,
  mechanic_on_demand: Wrench,
};

export function getServiceIcon(serviceId: string): LucideIcon {
  return SERVICE_ICONS[serviceId] ?? Wrench;
}

export function isFutureCategory(categoryId: string): boolean {
  return categoryId === 'future';
}

export function isEmergencyService(serviceId: string): boolean {
  return serviceId === 'towing_emergency' || serviceId === 'ambulance';
}
