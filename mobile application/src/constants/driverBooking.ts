import { images } from '../assets';
import type { DriverDurationId, DriverTypeId } from '../types/driverBooking';

export const DRIVER_BOOKING_STEPS = 5;

export const DRIVER_SERVICE_LIST: Array<{
  id: DriverTypeId;
  label: string;
  priceLabel: string;
  image: number;
}> = [
  {
    id: 'part_time',
    label: 'Part-Time Driver',
    priceLabel: 'From ₹199 /hr',
    image: images.booking.driverParttime,
  },
  {
    id: 'full_time',
    label: 'Full-Time Driver',
    priceLabel: 'From ₹999 /day',
    image: images.booking.driverFulltime,
  },
  {
    id: 'outstation',
    label: 'Outstation Driver',
    priceLabel: 'From ₹1,499 /trip',
    image: images.booking.driverOutstation,
  },
  {
    id: 'night',
    label: 'Night Driver',
    priceLabel: 'From ₹299 /night',
    image: images.booking.driverNight,
  },
];

export const DRIVER_WHY_CHOOSE_US = [
  'Police verified & background checked',
  'Experienced & professional',
  'Available 24/7',
  'Fixed transparent pricing',
] as const;

export const DRIVER_TYPES: Array<{
  id: DriverTypeId;
  label: string;
  price: string;
  image: number;
}> = [
  {
    id: 'part_time',
    label: 'Part-Time',
    price: '₹199/hr',
    image: images.booking.driverParttime,
  },
  {
    id: 'full_time',
    label: 'Full-Time',
    price: '₹999/day',
    image: images.booking.driverFulltime,
  },
  {
    id: 'outstation',
    label: 'Outstation',
    price: '₹1,499/trip',
    image: images.booking.driverOutstation,
  },
  {
    id: 'night',
    label: 'Night Driver',
    price: '₹299/night',
    image: images.booking.driverNight,
  },
];

export const DRIVER_DURATION_OPTIONS: Array<{
  id: DriverDurationId;
  label: string;
}> = [
  { id: '2', label: '2 hrs' },
  { id: '4', label: '4 hrs' },
  { id: '8', label: '8 hrs' },
  { id: 'custom', label: 'Custom' },
];

export const DRIVER_CALENDAR_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DRIVER_SAVED_LOCATIONS = [
  { id: 'home', label: 'Home', address: 'Patia Square, Bhubaneswar' },
  { id: 'office', label: 'Office', address: 'Chandrasekharpur, Bhubaneswar' },
];

export const DRIVER_BOOKING_TOTAL = 599;

export const DRIVER_ASSIGNED = {
  name: 'Ramesh S.',
  rating: 4.9,
  etaMinutes: 15,
};

export function getDriverTypeLabel(id: DriverTypeId): string {
  return DRIVER_TYPES.find(t => t.id === id)?.label ?? id;
}

export function getDriverTypeBadgeLabel(id: DriverTypeId): string {
  const label = getDriverTypeLabel(id);
  return label === 'Night Driver' ? label : `${label} Driver`;
}

export function getDriverTypePrice(id: DriverTypeId): string {
  return DRIVER_TYPES.find(t => t.id === id)?.price ?? '';
}

export function getDurationLabel(id: DriverDurationId): string {
  return DRIVER_DURATION_OPTIONS.find(d => d.id === id)?.label ?? id;
}

export function getDurationReviewLabel(id: DriverDurationId): string {
  const labels: Record<DriverDurationId, string> = {
    '2': '2 hours',
    '4': '4 hours',
    '8': '8 hours',
    custom: 'Custom',
  };
  return labels[id] ?? id;
}

export { getDateReviewLabel } from '../utils/driverCalendar';

export function getShortLocation(address: string): string {
  return address.split(',')[0]?.trim() || address;
}
