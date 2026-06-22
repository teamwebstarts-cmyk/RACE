import type {
  CustomerBookingHistoryItem,
  CustomerDetail,
  CustomerListItem,
  CustomerPayment,
  CustomerSubscription,
} from '@race/types';
import type { ActivityItem } from '@race/types';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'] as const;

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function makeCustomer(index: number): CustomerListItem {
  const city = CITIES[index % CITIES.length];
  const statuses: CustomerListItem['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
  const status = statuses[index % statuses.length];
  const id = `cust_${String(index + 1).padStart(4, '0')}`;

  return {
    id,
    customerId: `RACE-C${String(10000 + index)}`,
    name: [
      'Rahul Sharma',
      'Priya Patel',
      'Amit Kumar',
      'Sneha Das',
      'Vikram Singh',
      'Ananya Reddy',
      'Karan Mehta',
      'Divya Nair',
      'Rohan Gupta',
      'Meera Joshi',
    ][index % 10],
    phone: `+91 9876${String(543210 + index).slice(-6)}`,
    email: `customer${index + 1}@gmail.com`,
    city,
    state: 'Odisha',
    vehicleCount: (index % 3) + 1,
    totalBookings: 12 + (index % 48),
    status,
    joinedAt: new Date(2024, index % 12, (index % 28) + 1).toISOString(),
  };
}

export const MOCK_CUSTOMERS: CustomerListItem[] = Array.from({ length: 48 }, (_, i) =>
  makeCustomer(i),
);

export const CUSTOMER_CITIES = [...CITIES];

export function buildCustomerDetail(base: CustomerListItem): CustomerDetail {
  const bookings: CustomerBookingHistoryItem[] = [
    {
      id: 'b1',
      bookingNumber: 'RC-24001',
      service: 'Towing Service',
      status: 'COMPLETED',
      amount: 2500,
      date: '2025-06-10T10:30:00Z',
      vendorName: 'RACE Towing Pvt Ltd',
      driverName: 'Rajesh Kumar',
    },
    {
      id: 'b2',
      bookingNumber: 'RC-23980',
      service: 'Flat Tyre Assistance',
      status: 'COMPLETED',
      amount: 800,
      date: '2025-05-22T14:15:00Z',
      vendorName: 'QuickFix Roadside',
    },
    {
      id: 'b3',
      bookingNumber: 'RC-23912',
      service: 'Battery Jump Start',
      status: 'CANCELLED',
      amount: 600,
      date: '2025-05-01T09:00:00Z',
    },
    {
      id: 'b4',
      bookingNumber: 'RC-23845',
      service: 'Towing Service',
      status: 'EN_ROUTE',
      amount: 3200,
      date: '2025-06-16T18:45:00Z',
      vendorName: 'RACE Towing Pvt Ltd',
      driverName: 'Manoj Singh',
    },
  ];

  const payments: CustomerPayment[] = [
    {
      id: 'p1',
      amount: 2500,
      method: 'UPI',
      status: 'PAID',
      date: '2025-06-10T11:00:00Z',
      reference: 'UPI-88291034',
    },
    {
      id: 'p2',
      amount: 800,
      method: 'Wallet',
      status: 'PAID',
      date: '2025-05-22T15:00:00Z',
      reference: 'WLT-4492011',
    },
    {
      id: 'p3',
      amount: 1499,
      method: 'Card',
      status: 'PAID',
      date: '2025-04-01T08:00:00Z',
      reference: 'SUB-ANNUAL-2025',
    },
  ];

  const subscriptions: CustomerSubscription[] = [
    {
      id: 's1',
      planName: 'Gold Annual Plan',
      status: 'ACTIVE',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      amount: 1499,
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: 'a1',
      title: 'Booking completed',
      description: 'Towing service #RC-24001 completed successfully',
      timestamp: '2025-06-10T11:05:00Z',
      type: 'booking',
    },
    {
      id: 'a2',
      title: 'Payment received',
      description: '₹2,500 via UPI',
      timestamp: '2025-06-10T11:00:00Z',
      type: 'payment',
    },
    {
      id: 'a3',
      title: 'Subscription renewed',
      description: 'Gold Annual Plan renewed',
      timestamp: '2025-04-01T08:00:00Z',
      type: 'system',
    },
    {
      id: 'a4',
      title: 'Profile updated',
      description: 'Emergency contact updated',
      timestamp: '2025-03-15T12:30:00Z',
      type: 'customer',
    },
  ];

  return {
    ...base,
    address: `${12 + (base.id.length % 50)}, Sector ${base.id.length % 9}, ${base.city}, ${base.state} - 751001`,
    dateOfBirth: '1990-05-15',
    emergencyContact: '+91 99887 76655',
    bookings,
    payments,
    subscriptions,
    activities,
  };
}

export function getCustomerInitials(name: string) {
  return initials(name);
}

export type CustomerUpsertInput = {
  name: string;
  phone: string;
  email: string;
  city: string;
  state?: string;
  status?: CustomerListItem['status'];
};

export function createCustomerRecord(input: CustomerUpsertInput): CustomerListItem {
  const index = MOCK_CUSTOMERS.length;
  const item: CustomerListItem = {
    id: `cust_${String(index + 1).padStart(4, '0')}`,
    customerId: `RACE-C${String(10000 + index)}`,
    name: input.name,
    phone: input.phone,
    email: input.email,
    city: input.city,
    state: input.state ?? 'Odisha',
    vehicleCount: 0,
    totalBookings: 0,
    status: input.status ?? 'ACTIVE',
    joinedAt: new Date().toISOString(),
  };
  MOCK_CUSTOMERS.unshift(item);
  return item;
}

export function updateCustomerRecord(
  id: string,
  input: Partial<CustomerUpsertInput>,
): CustomerListItem {
  const idx = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  MOCK_CUSTOMERS[idx] = { ...MOCK_CUSTOMERS[idx], ...input };
  return MOCK_CUSTOMERS[idx];
}

export function deleteCustomerRecord(id: string): void {
  const idx = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  MOCK_CUSTOMERS.splice(idx, 1);
}
