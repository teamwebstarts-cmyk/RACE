import type { BookingStatus } from '../../models/src/booking';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  CREATED: 'Booking created',
  ASSIGNED: 'Driver assigned',
  ACCEPTED: 'Driver accepted',
  EN_ROUTE: 'Driver en route',
  ARRIVED: 'Driver arrived',
  SERVICE_STARTED: 'Service started',
  SERVICE_COMPLETED: 'Service completed',
  PAYMENT_PENDING: 'Payment pending',
  PAID: 'Payment received',
  CANCELLED: 'Booking cancelled',
  REFUNDED: 'Booking refunded',
};

export const SERVICE_BASE_PRICES: Record<string, number> = {
  towing_instant: 499,
  towing_scheduled: 399,
  towing_emergency: 699,
  driver_part_time: 199,
  driver_full_time: 999,
  driver_outstation: 1499,
  driver_night: 299,
  roadside_flat_tyre: 199,
  roadside_battery_jump: 299,
  roadside_fuel_delivery: 149,
  roadside_minor_repair: 399,
};

export const MOCK_DRIVERS = [
  {
    id: 'driver_1',
    name: 'Ramesh S.',
    rating: 4.9,
    phone: '+919876543210',
    experience: '3 years exp',
    verified: true,
  },
  {
    id: 'driver_2',
    name: 'Suresh K.',
    rating: 4.7,
    phone: '+919123456789',
    experience: '5 years exp',
    verified: true,
  },
];
