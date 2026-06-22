import type { DriverDetail, DriverListItem } from '@race/types';
import type { ActivityItem } from '@race/types';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'] as const;

const VENDORS = [
  { id: 'vendor_001', name: 'RACE Towing Pvt Ltd' },
  { id: 'vendor_002', name: 'QuickFix Roadside' },
  { id: 'vendor_003', name: 'Odisha Auto Rescue' },
  { id: 'vendor_004', name: 'Highway Heroes Towing' },
];

const NAMES = [
  'Rajesh Kumar',
  'Manoj Singh',
  'Suresh Das',
  'Ravi Shankar',
  'Pradeep Mohanty',
  'Sanjay Reddy',
  'Naveen Kumar',
  'Arun Singh',
  'Vikram Patnaik',
  'Deepak Rout',
];

function makeDriver(index: number): DriverListItem {
  const vendor = VENDORS[index % VENDORS.length];
  const city = CITIES[index % CITIES.length];
  const statusCycle: DriverListItem['status'][] = [
    'APPROVED',
    'APPROVED',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'APPROVED',
    'PENDING',
    'SUSPENDED',
  ];
  const types = ['Tow Driver', 'Full-Time', 'Part-Time', 'Roadside Assist'];

  return {
    id: `driver_${String(index + 1).padStart(3, '0')}`,
    name: NAMES[index % NAMES.length],
    phone: `+91 9876${String(511000 + index).slice(-6)}`,
    licenseNo: `OD${String(20240000 + index)}`,
    driverType: types[index % types.length],
    vendorId: vendor.id,
    vendorName: vendor.name,
    city,
    vehicleRegistration: `OD-0${(index % 9) + 1}-AB-${String(1000 + index)}`,
    rating: Number((4.0 + (index % 10) * 0.1).toFixed(1)),
    reviewCount: 20 + index * 3,
    status: statusCycle[index % statusCycle.length],
  };
}

export const MOCK_DRIVERS: DriverListItem[] = Array.from({ length: 366 }, (_, i) =>
  makeDriver(i),
);

export const DRIVER_CITIES = [...CITIES];
export const DRIVER_VENDORS = VENDORS;

export function buildDriverDetail(base: DriverListItem): DriverDetail {
  const activities: ActivityItem[] = [
    {
      id: 'da1',
      title: 'Driver approved',
      description: 'Application approved by verification team',
      timestamp: '2025-02-10T14:00:00Z',
      type: 'driver',
    },
    {
      id: 'da2',
      title: 'Booking completed',
      description: 'Completed towing service #RC-24001',
      timestamp: '2025-06-10T11:05:00Z',
      type: 'booking',
    },
    {
      id: 'da3',
      title: 'Document verified',
      description: 'Driving license verified',
      timestamp: '2025-02-08T10:00:00Z',
      type: 'system',
    },
    {
      id: 'da4',
      title: 'Vehicle assigned',
      description: base.vehicleRegistration,
      timestamp: '2025-02-09T09:00:00Z',
      type: 'system',
    },
  ];

  return {
    ...base,
    email: `driver${base.id.replace('driver_', '')}@raceservice.com`,
    address: `House ${base.id.length % 100}, ${base.city}, Odisha - 751001`,
    joinedAt: '2025-02-01T08:00:00Z',
    licenseExpiry: '2028-06-30',
    licenseClass: 'LMV + HMV',
    aadhaarMasked: 'XXXX-XXXX-4521',
    assignedVehicle: {
      registrationNo: base.vehicleRegistration,
      type: 'Flatbed Tow',
      model: 'Tata 407',
      year: 2022,
      status: 'ACTIVE',
    },
    bookings: [
      {
        id: 'db1',
        bookingNumber: 'RC-24001',
        service: 'Towing Service',
        status: 'COMPLETED',
        amount: 2500,
        date: '2025-06-10T10:30:00Z',
        vendorName: base.vendorName,
      },
      {
        id: 'db2',
        bookingNumber: 'RC-23988',
        service: 'Flat Tyre Assistance',
        status: 'EN_ROUTE',
        amount: 800,
        date: '2025-06-16T14:00:00Z',
        vendorName: base.vendorName,
      },
      {
        id: 'db3',
        bookingNumber: 'RC-23912',
        service: 'Battery Jump Start',
        status: 'COMPLETED',
        amount: 600,
        date: '2025-05-01T09:00:00Z',
        vendorName: base.vendorName,
      },
    ],
    reviews: [
      {
        id: 'r1',
        customerName: 'Rahul Sharma',
        rating: 5,
        comment: 'Very professional and arrived on time.',
        date: '2025-06-10',
      },
      {
        id: 'r2',
        customerName: 'Priya Patel',
        rating: 4,
        comment: 'Good service, slightly delayed pickup.',
        date: '2025-05-22',
      },
      {
        id: 'r3',
        customerName: 'Amit Kumar',
        rating: 5,
        comment: 'Excellent handling of the vehicle.',
        date: '2025-05-01',
      },
    ],
    documents: [
      {
        id: 'dd1',
        name: 'Driving License',
        status: base.status === 'PENDING' ? 'PENDING' : 'VERIFIED',
        url: '/documents/dl.pdf',
        uploadedAt: '2025-02-01T10:00:00Z',
      },
      {
        id: 'dd2',
        name: 'Aadhaar Card',
        status: 'VERIFIED',
        url: '/documents/aadhaar.pdf',
        uploadedAt: '2025-02-01T10:05:00Z',
      },
      {
        id: 'dd3',
        name: 'Police Verification',
        status: base.status === 'REJECTED' ? 'REJECTED' : 'VERIFIED',
        url: '/documents/police.pdf',
        uploadedAt: '2025-02-02T11:00:00Z',
      },
      {
        id: 'dd4',
        name: 'Medical Certificate',
        status: 'VERIFIED',
        url: '/documents/medical.pdf',
        uploadedAt: '2025-02-02T12:00:00Z',
      },
    ],
    activities,
  };
}

export function getDriverStatusCounts(drivers: DriverListItem[]) {
  return {
    all: drivers.length,
    pending: drivers.filter((d) => d.status === 'PENDING').length,
    approved: drivers.filter((d) => d.status === 'APPROVED').length,
    rejected: drivers.filter((d) => d.status === 'REJECTED').length,
  };
}

export type DriverUpsertInput = {
  name: string;
  phone: string;
  licenseNo: string;
  driverType: string;
  vendorId: string;
  city: string;
  status?: DriverListItem['status'];
};

export function createDriverRecord(input: DriverUpsertInput): DriverListItem {
  const index = MOCK_DRIVERS.length;
  const vendor = VENDORS.find((v) => v.id === input.vendorId) ?? VENDORS[0];
  const item: DriverListItem = {
    id: `driver_${String(index + 1).padStart(3, '0')}`,
    name: input.name,
    phone: input.phone,
    licenseNo: input.licenseNo,
    driverType: input.driverType,
    vendorId: vendor.id,
    vendorName: vendor.name,
    city: input.city,
    vehicleRegistration: `OD-NEW-${String(1000 + index)}`,
    rating: 0,
    reviewCount: 0,
    status: input.status ?? 'PENDING',
  };
  MOCK_DRIVERS.unshift(item);
  return item;
}

export function updateDriverRecord(id: string, input: Partial<DriverUpsertInput>): DriverListItem {
  const idx = MOCK_DRIVERS.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Driver not found');
  const next = { ...MOCK_DRIVERS[idx], ...input };
  if (input.vendorId) {
    const vendor = VENDORS.find((v) => v.id === input.vendorId);
    if (vendor) {
      next.vendorId = vendor.id;
      next.vendorName = vendor.name;
    }
  }
  MOCK_DRIVERS[idx] = next;
  return MOCK_DRIVERS[idx];
}

export function deleteDriverRecord(id: string): void {
  const idx = MOCK_DRIVERS.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Driver not found');
  MOCK_DRIVERS.splice(idx, 1);
}
