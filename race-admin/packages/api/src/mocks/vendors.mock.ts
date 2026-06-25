import type {
  VendorAssignedDriver,
  VendorBookingRow,
  VendorDetail,
  VendorDocument,
  VendorListItem,
  VendorQuickStat,
  VendorVehicle,
} from '@race/types';
import type { ActivityItem } from '@race/types';

const CITIES = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Berhampur'] as const;

function makeVendor(index: number): VendorListItem {
  const city = CITIES[index % CITIES.length];
  const statusCycle: VendorListItem['status'][] = [
    'APPROVED',
    'APPROVED',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'APPROVED',
    'PENDING',
    'SUSPENDED',
  ];
  const status = statusCycle[index % statusCycle.length];
  const verificationStatus =
    status === 'APPROVED' ? 'VERIFIED' : status === 'PENDING' ? 'PENDING' : 'REJECTED';
  const documentsStatus =
    status === 'REJECTED' ? 'REJECTED' : status === 'PENDING' ? 'PENDING' : 'VERIFIED';

  const businesses = [
    'RACE Towing Pvt Ltd',
    'QuickFix Roadside',
    'Odisha Auto Rescue',
    'Highway Heroes Towing',
    'Capital City Motors',
    'Eastern Express Tow',
    'SafeDrive Assistance',
    'Metro Tow Services',
  ];

  const owners = [
    'Amit Verma',
    'Suresh Patnaik',
    'Ravi Shankar',
    'Manoj Das',
    'Pradeep Mohanty',
    'Sanjay Reddy',
    'Naveen Kumar',
    'Arun Singh',
  ];

  return {
    id: `vendor_${String(index + 1).padStart(3, '0')}`,
    businessName: businesses[index % businesses.length],
    ownerName: owners[index % owners.length],
    phone: `+91 9876${String(432100 + index).slice(-6)}`,
    email: `vendor${index + 1}@business.com`,
    location: `${city}, Odisha`,
    city,
    vehicleCount: 3 + (index % 8),
    driverCount: 2 + (index % 6),
    rating: Number((4.2 + (index % 8) * 0.1).toFixed(1)),
    reviewCount: 45 + index * 12,
    status,
    verificationStatus,
    documentsStatus,
  };
}

export const MOCK_VENDORS: VendorListItem[] = Array.from({ length: 230 }, (_, i) =>
  makeVendor(i),
);

export const VENDOR_CITIES = [...CITIES];

export function buildVendorDetail(base: VendorListItem): VendorDetail {
  const vehicles: VendorVehicle[] = [
    {
      id: 'v1',
      registrationNo: 'OD-01-AB-1234',
      type: 'Flatbed Tow',
      model: 'Tata 407',
      year: 2022,
      status: 'ACTIVE',
    },
    {
      id: 'v2',
      registrationNo: 'OD-02-CD-5678',
      type: 'Wheel Lift',
      model: 'Mahindra Bolero',
      year: 2021,
      status: 'ACTIVE',
    },
    {
      id: 'v3',
      registrationNo: 'OD-03-EF-9012',
      type: 'Flatbed Tow',
      model: 'Ashok Leyland Dost',
      year: 2020,
      status: 'UNDER_MAINTENANCE',
    },
  ];

  const recentBookings: VendorBookingRow[] = [
    {
      id: 'vb1',
      bookingNumber: 'RC-24001',
      customerName: 'Rahul Sharma',
      service: 'Towing Service',
      driverName: 'Rajesh Kumar',
      amount: 2500,
      status: 'COMPLETED',
      date: '2025-06-10',
    },
    {
      id: 'vb2',
      bookingNumber: 'RC-23988',
      customerName: 'Priya Patel',
      service: 'Flat Tyre',
      driverName: 'Manoj Singh',
      amount: 800,
      status: 'EN_ROUTE',
      date: '2025-06-16',
    },
    {
      id: 'vb3',
      bookingNumber: 'RC-23950',
      customerName: 'Amit Kumar',
      service: 'Battery Jump',
      driverName: 'Suresh Das',
      amount: 600,
      status: 'CANCELLED',
      date: '2025-06-08',
    },
  ];

  const documents: VendorDocument[] = [
    {
      id: 'd1',
      name: 'Business Registration',
      status: base.documentsStatus === 'REJECTED' ? 'REJECTED' : 'VERIFIED',
      url: '/documents/business-reg.pdf',
      uploadedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'd2',
      name: 'GST Certificate',
      status: base.documentsStatus === 'PENDING' ? 'PENDING' : 'VERIFIED',
      url: '/documents/gst.pdf',
      uploadedAt: '2025-01-15T10:05:00Z',
    },
    {
      id: 'd3',
      name: 'PAN Card',
      status: 'VERIFIED',
      url: '/documents/pan.pdf',
      uploadedAt: '2025-01-15T10:10:00Z',
    },
    {
      id: 'd4',
      name: 'Bank Passbook',
      status: base.status === 'PENDING' ? 'PENDING' : 'VERIFIED',
      url: '/documents/bank.pdf',
      uploadedAt: '2025-01-16T09:00:00Z',
    },
    {
      id: 'd5',
      name: 'RC Books',
      status: 'VERIFIED',
      url: '/documents/rc.pdf',
      uploadedAt: '2025-01-17T11:00:00Z',
    },
    {
      id: 'd6',
      name: 'Insurance',
      status: base.status === 'PENDING' ? 'PENDING' : 'VERIFIED',
      url: '/documents/insurance.pdf',
      uploadedAt: '2025-01-18T14:00:00Z',
    },
  ];

  const assignedDrivers: VendorAssignedDriver[] = [
    {
      id: 'dr1',
      name: 'Rajesh Kumar',
      phone: '+91 98765 11111',
      status: 'ACTIVE',
      initials: 'RK',
    },
    {
      id: 'dr2',
      name: 'Manoj Singh',
      phone: '+91 98765 22222',
      status: 'ACTIVE',
      initials: 'MS',
    },
    {
      id: 'dr3',
      name: 'Suresh Das',
      phone: '+91 98765 33333',
      status: 'ON_LEAVE',
      initials: 'SD',
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: 'va1',
      title: 'Vendor approved',
      description: 'Vendor application approved by Admin User',
      timestamp: '2025-01-20T16:00:00Z',
      type: 'vendor',
    },
    {
      id: 'va2',
      title: 'Document uploaded',
      description: 'GST Certificate uploaded',
      timestamp: '2025-01-15T10:05:00Z',
      type: 'vendor',
    },
    {
      id: 'va3',
      title: 'Booking assigned',
      description: 'Booking #RC-24001 assigned to Rajesh Kumar',
      timestamp: '2025-06-10T10:00:00Z',
      type: 'booking',
    },
    {
      id: 'va4',
      title: 'Vehicle added',
      description: 'OD-03-EF-9012 added to fleet',
      timestamp: '2025-02-01T09:30:00Z',
      type: 'system',
    },
  ];

  const quickStats: VendorQuickStat[] = [
    { id: 'qs2', label: 'Total Bookings', value: String(312 + base.id.length), icon: 'ClipboardList' },
    {
      id: 'qs3',
      label: 'Total Revenue Generated',
      value: `₹${(468000 + base.id.length * 1000).toLocaleString('en-IN')}`,
      icon: 'IndianRupee',
    },
    { id: 'qs4', label: 'Average Rating', value: `${base.rating} / 5.0`, icon: 'Star' },
  ];

  return {
    ...base,
    address: `Plot ${base.id.length % 50}, Industrial Area, ${base.city}, Odisha - 751001`,
    joinedAt: '2025-01-10T08:00:00Z',
    businessType: 'Towing & Roadside Assistance',
    gstNumber: '21AABCR1234F1Z5',
    panNumber: 'AABCR1234F',
    bankName: 'State Bank of India',
    accountNumber: '****4567',
    ifscCode: 'SBIN0001234',
    serviceAreas: [base.city, 'Cuttack', 'Puri'],
    workingHours: '24/7',
    totalBookings: 312 + base.id.length,
    totalRevenue: 468000 + base.id.length * 1000,
    vehicles,
    recentBookings,
    documents,
    assignedDrivers,
    activities,
    quickStats,
  };
}

export function getVendorStatusCounts(vendors: VendorListItem[]) {
  return {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'PENDING').length,
    approved: vendors.filter((v) => v.status === 'APPROVED').length,
    rejected: vendors.filter((v) => v.status === 'REJECTED').length,
  };
}

export type VendorUpsertInput = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  status?: VendorListItem['status'];
};

export function createVendorRecord(input: VendorUpsertInput): VendorListItem {
  const index = MOCK_VENDORS.length;
  const status = input.status ?? 'PENDING';
  const item: VendorListItem = {
    id: `vendor_${String(index + 1).padStart(3, '0')}`,
    businessName: input.businessName,
    ownerName: input.ownerName,
    phone: input.phone,
    email: input.email,
    location: `${input.city}, Odisha`,
    city: input.city,
    vehicleCount: 0,
    driverCount: 0,
    rating: 0,
    reviewCount: 0,
    status,
    verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'PENDING',
    documentsStatus: 'PENDING',
  };
  MOCK_VENDORS.unshift(item);
  return item;
}

export function updateVendorRecord(id: string, input: Partial<VendorUpsertInput>): VendorListItem {
  const idx = MOCK_VENDORS.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error('Vendor not found');
  const next = { ...MOCK_VENDORS[idx], ...input };
  if (input.city) next.location = `${input.city}, Odisha`;
  MOCK_VENDORS[idx] = next;
  return MOCK_VENDORS[idx];
}

export function deleteVendorRecord(id: string): void {
  const idx = MOCK_VENDORS.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error('Vendor not found');
  MOCK_VENDORS.splice(idx, 1);
}
