import { BadRequestError } from '../../../shared/utils/errors';
import { serviceRepository } from '../../services/service.repository';
import { towingBookingService } from '../towing/towing-booking.service';
import type { CreateRoadsideBookingDto } from './roadside-booking.validator';

/** Service slugs / category ids that route to the towing booking flow. */
const TOWING_SERVICE_TYPES = new Set([
  'towing',
  'towing_instant',
  'towing_scheduled',
  'towing_emergency',
]);

const ROADSIDE_SERVICE_LABELS: Record<string, string> = {
  towing: 'Towing Service',
  towing_instant: 'Instant Towing',
  towing_scheduled: 'Scheduled Towing',
  towing_emergency: 'Emergency Towing',
  roadside_flat_tyre: 'Flat Tyre Assistance',
  roadside_battery_jump: 'Battery Jump Start',
  roadside_fuel_delivery: 'Fuel Delivery',
  roadside_minor_repair: 'Minor Repairs',
};

function resolveServiceLabel(serviceType: string): string {
  return ROADSIDE_SERVICE_LABELS[serviceType] ?? serviceType.replace(/_/g, ' ');
}

export class RoadsideBookingService {
  async createBooking(customerId: string, dto: CreateRoadsideBookingDto) {
    const normalizedType = dto.serviceType.trim().toLowerCase();

    if (TOWING_SERVICE_TYPES.has(normalizedType)) {
      if (!dto.dropoff) {
        throw new BadRequestError('dropoff is required for towing services');
      }

      const booking = await towingBookingService.createBooking(customerId, {
        vehicleId: dto.vehicleId,
        pickup: dto.pickup,
        dropoff: dto.dropoff,
        scheduledAt: dto.scheduledAt,
      });

      return {
        available: true,
        redirectedTo: 'towing' as const,
        serviceType: normalizedType,
        booking,
      };
    }

    return {
      available: false,
      message: `${resolveServiceLabel(normalizedType)} is coming soon`,
      serviceType: normalizedType,
    };
  }

  async getAvailability() {
    const services = await serviceRepository.findAllActive();
    const roadsideServices = services.filter((service) => service.category === 'roadside');
    const towingServices = services.filter((service) => service.category === 'towing');

    const items = [
      ...towingServices.map((service) => ({
        serviceType: service.slug,
        label: service.title,
        available: true,
      })),
      ...roadsideServices.map((service) => ({
        serviceType: service.slug,
        label: service.title,
        available: false,
      })),
    ];

    return {
      bookableCount: towingServices.length,
      items,
    };
  }
}

export const roadsideBookingService = new RoadsideBookingService();
