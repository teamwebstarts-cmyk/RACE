import {
  Battery,
  Circle,
  Fuel,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react-native';

import type { ActiveBooking, BookingHistoryItem } from '../types/models';
import { ACTIVE_BOOKING, BOOKING_HISTORY } from './demo';

export type BookingTabId = 'all' | 'ongoing' | 'completed';

export const BOOKING_TABS: Array<{ id: BookingTabId; label: string }> = [
  { id: 'all', label: 'All Bookings' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

export const ONGOING_BOOKINGS: ActiveBooking[] = [
  ACTIVE_BOOKING,
  {
    id: '#RACE45821',
    service: 'Driver Service',
    status: 'Driver Assigned',
    pickup: 'Patia Square, Bhubaneswar',
    drop: 'Puri Beach Road, Odisha',
    eta: '18 min',
    driver: {
      name: 'Ramesh S.',
      rating: 4.9,
      photo: null,
      experience: '3 years',
    },
  },
];

export const COMPLETED_BOOKINGS: BookingHistoryItem[] = BOOKING_HISTORY.map(item => ({
  ...item,
  status: 'Completed',
}));

export function getBookingServiceIcon(service: string): LucideIcon {
  const name = service.toLowerCase();
  if (name.includes('battery')) return Battery;
  if (name.includes('fuel')) return Fuel;
  if (name.includes('tyre') || name.includes('tire')) return Circle;
  if (name.includes('driver')) return User;
  return Truck;
}

export function formatBookingDate(date: string): string {
  return date.replace(',', ' |');
}
