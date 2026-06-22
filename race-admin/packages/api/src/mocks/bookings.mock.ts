import type { BookingDetail, BookingListItem } from '@race/types';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri'] as const;

const SERVICES = [
  { name: 'Towing Service', type: 'towing' },
  { name: 'Roadside Assist', type: 'roadside' },
  { name: 'Battery Jump Start', type: 'battery' },
  { name: 'Flat Tyre Assistance', type: 'tyre' },
  { name: 'Fuel Delivery', type: 'fuel' },
];

const CUSTOMERS = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Das', 'Vikram Singh'];
const VENDORS = ['RACE Towing', 'QuickFix Roadside', 'Odisha Auto Rescue'];
const DRIVERS = ['Ravi Kumar', 'Rajesh Kumar', 'Manoj Singh', 'Suresh Das'];

const STATUS_CYCLE: BookingListItem['status'][] = [
  'EN_ROUTE',
  'ASSIGNED',
  'COMPLETED',
  'CANCELLED',
  'CREATED',
  'COMPLETED',
  'EN_ROUTE',
  'ASSIGNED',
];

function makeBooking(index: number): BookingListItem {
  const service = SERVICES[index % SERVICES.length];
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
  const hasDriver = status !== 'CREATED';

  return {
    id: `booking_${String(index + 1).padStart(4, '0')}`,
    bookingNumber: `BK${String(1000 + index).slice(-4)}${String.fromCharCode(65 + (index % 26))}`,
    customerId: `cust_${String((index % 48) + 1).padStart(4, '0')}`,
    customerName: CUSTOMERS[index % CUSTOMERS.length],
    vendorId: `vendor_${String((index % 4) + 1).padStart(3, '0')}`,
    vendorName: VENDORS[index % VENDORS.length],
    driverId: hasDriver ? `driver_${String((index % 20) + 1).padStart(3, '0')}` : undefined,
    driverName: hasDriver ? DRIVERS[index % DRIVERS.length] : undefined,
    service: service.name,
    serviceType: service.type,
    amount: 499 + (index % 10) * 200,
    status,
    date: new Date(2025, 5, (index % 28) + 1, 8 + (index % 12), (index % 4) * 15).toISOString(),
    city: CITIES[index % CITIES.length],
  };
}

export const MOCK_BOOKINGS: BookingListItem[] = Array.from({ length: 568 }, (_, i) =>
  makeBooking(i),
);

export const BOOKING_SERVICE_TYPES = [
  { label: 'All Services', value: 'ALL' },
  { label: 'Towing', value: 'towing' },
  { label: 'Roadside Assist', value: 'roadside' },
  { label: 'Battery', value: 'battery' },
  { label: 'Flat Tyre', value: 'tyre' },
  { label: 'Fuel Delivery', value: 'fuel' },
];

export function buildBookingDetail(base: BookingListItem): BookingDetail {
  const pickupLat = 20.2961 + (base.id.length % 10) * 0.01;
  const pickupLng = 85.8245 + (base.id.length % 10) * 0.01;

  return {
    ...base,
    customerPhone: `+91 9876${String(543210 + base.id.length).slice(-6)}`,
    customerEmail: `customer${base.customerId.replace('cust_', '')}@gmail.com`,
    vendorPhone: `+91 9876${String(432100 + base.id.length).slice(-6)}`,
    driverPhone: base.driverName ? `+91 9876${String(511000 + base.id.length).slice(-6)}` : undefined,
    location: {
      pickup: {
        address: `NH-16, Near Khandagiri, ${base.city}, Odisha`,
        lat: pickupLat,
        lng: pickupLng,
      },
      dropoff:
        base.serviceType === 'towing'
          ? {
              address: `Patia Square, ${base.city}, Odisha`,
              lat: pickupLat + 0.02,
              lng: pickupLng + 0.015,
            }
          : undefined,
    },
    payment: {
      amount: base.amount,
      method: base.status === 'COMPLETED' ? 'UPI' : base.status === 'CANCELLED' ? '—' : 'Pending',
      status: base.status === 'COMPLETED' ? 'PAID' : base.status === 'CANCELLED' ? 'REFUNDED' : 'PENDING',
      transactionId: base.status === 'COMPLETED' ? `TXN-${base.bookingNumber}` : '—',
      paidAt: base.status === 'COMPLETED' ? base.date : undefined,
    },
    timeline: [
      {
        id: 't1',
        title: 'Booking created',
        description: `Service requested: ${base.service}`,
        timestamp: base.date,
        status: 'CREATED',
      },
      ...(base.driverName
        ? [
            {
              id: 't2',
              title: 'Driver assigned',
              description: `${base.driverName} assigned`,
              timestamp: new Date(new Date(base.date).getTime() + 5 * 60000).toISOString(),
              status: 'ASSIGNED',
            },
          ]
        : []),
      ...(base.status === 'EN_ROUTE' || base.status === 'COMPLETED'
        ? [
            {
              id: 't3',
              title: 'Driver en route',
              description: 'Driver heading to pickup location',
              timestamp: new Date(new Date(base.date).getTime() + 15 * 60000).toISOString(),
              status: 'EN_ROUTE',
            },
          ]
        : []),
      ...(base.status === 'COMPLETED'
        ? [
            {
              id: 't4',
              title: 'Service completed',
              description: 'Booking marked as completed',
              timestamp: new Date(new Date(base.date).getTime() + 60 * 60000).toISOString(),
              status: 'COMPLETED',
            },
          ]
        : []),
      ...(base.status === 'CANCELLED'
        ? [
            {
              id: 't5',
              title: 'Booking cancelled',
              description: 'Cancelled by customer',
              timestamp: new Date(new Date(base.date).getTime() + 10 * 60000).toISOString(),
              status: 'CANCELLED',
            },
          ]
        : []),
    ],
    notes: 'Customer requested priority assistance.',
  };
}

export function getBookingStatusCounts(bookings: BookingListItem[]) {
  return {
    all: bookings.length,
    created: bookings.filter((b) => b.status === 'CREATED').length,
    assigned: bookings.filter((b) => b.status === 'ASSIGNED').length,
    enRoute: bookings.filter((b) => b.status === 'EN_ROUTE').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };
}

export function filterBookingsByDate(
  items: BookingListItem[],
  dateFrom?: string,
  dateTo?: string,
): BookingListItem[] {
  if (!dateFrom && !dateTo) return items;

  return items.filter((b) => {
    const d = new Date(b.date).toISOString().slice(0, 10);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
}

export type BookingUpsertInput = {
  customerName: string;
  vendorName: string;
  service: string;
  serviceType: string;
  amount: number;
  city: string;
  status?: BookingListItem['status'];
};

export function createBookingRecord(input: BookingUpsertInput): BookingListItem {
  const index = MOCK_BOOKINGS.length;
  const item: BookingListItem = {
    id: `booking_${String(index + 1).padStart(4, '0')}`,
    bookingNumber: `BK${String(9000 + index)}`,
    customerId: `cust_${String((index % 48) + 1).padStart(4, '0')}`,
    customerName: input.customerName,
    vendorId: `vendor_001`,
    vendorName: input.vendorName,
    service: input.service,
    serviceType: input.serviceType,
    amount: input.amount,
    status: input.status ?? 'CREATED',
    date: new Date().toISOString(),
    city: input.city,
  };
  MOCK_BOOKINGS.unshift(item);
  return item;
}

export function updateBookingRecord(id: string, input: Partial<BookingUpsertInput>): BookingListItem {
  const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Booking not found');
  MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], ...input };
  return MOCK_BOOKINGS[idx];
}

export function deleteBookingRecord(id: string): void {
  const idx = MOCK_BOOKINGS.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Booking not found');
  MOCK_BOOKINGS.splice(idx, 1);
}
