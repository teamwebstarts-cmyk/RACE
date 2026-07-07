import {
  Battery,
  Circle,
  Fuel,
  Truck,
  User,
  type LucideIcon,
} from 'lucide-react-native';

export type BookingTabId = 'all' | 'ongoing' | 'completed';

export const BOOKING_TABS: Array<{ id: BookingTabId; label: string }> = [
  { id: 'all', label: 'All Bookings' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

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
