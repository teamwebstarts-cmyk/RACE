import type { IUser } from './user.model';
import type { IDriverProfile, IVendorProfile } from './user-profile.schema';

/** Flat vendor view for services that previously used the Vendor collection. */
export interface VendorRecord {
  _id: IUser['_id'];
  id: string;
  userId: IUser['_id'];
  mobileNumber: string;
  email?: string;
  fullName?: string;
  vendorType: IVendorProfile['vendorType'];
  status: IVendorProfile['status'];
  verificationStage: IVendorProfile['verificationStage'];
  businessName?: string;
  ownerName?: string;
  address?: string;
  towVehicle?: IVendorProfile['towVehicle'];
  bankDetails?: IVendorProfile['bankDetails'];
  driverProfile?: IVendorProfile['partnerDriverDetails'];
  reviewNotes?: string;
  documentReviews?: IVendorProfile['documentReviews'];
  statusHistory: IVendorProfile['statusHistory'];
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Flat driver view for services that previously used the Driver collection. */
export interface DriverRecord {
  _id: IUser['_id'];
  id: string;
  driverCode: string;
  name: string;
  phone: string;
  email?: string;
  licenseNo: string;
  driverType: string;
  vendorId?: IDriverProfile['vendorUserId'];
  city: string;
  state?: string;
  vehicleRegistration?: string;
  rating: number;
  reviewCount: number;
  status: IDriverProfile['status'];
  totalTrips: number;
  documents: IDriverProfile['documents'];
  statusHistory: IDriverProfile['statusHistory'];
  createdAt: Date;
  updatedAt: Date;
}

export function toVendorRecord(user: IUser): VendorRecord {
  const profile = user.vendorProfile!;
  return {
    _id: user._id,
    id: user._id.toString(),
    userId: user._id,
    mobileNumber: user.mobileNumber,
    email: user.email,
    fullName: user.fullName,
    vendorType: profile.vendorType,
    status: profile.status,
    verificationStage: profile.verificationStage,
    businessName: profile.businessName,
    ownerName: profile.ownerName ?? user.fullName,
    address: profile.address,
    towVehicle: profile.towVehicle,
    bankDetails: profile.bankDetails,
    driverProfile: profile.partnerDriverDetails,
    reviewNotes: profile.reviewNotes,
    documentReviews: profile.documentReviews,
    statusHistory: profile.statusHistory ?? [],
    submittedAt: profile.submittedAt,
    approvedAt: profile.approvedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toDriverRecord(user: IUser): DriverRecord {
  const profile = user.driverProfile!;
  return {
    _id: user._id,
    id: user._id.toString(),
    driverCode: profile.driverCode,
    name: user.fullName ?? 'Driver',
    phone: user.mobileNumber,
    email: user.email,
    licenseNo: profile.licenseNo,
    driverType: profile.driverType,
    vendorId: profile.vendorUserId,
    city: profile.city,
    state: profile.state,
    vehicleRegistration: profile.vehicleRegistration,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    status: profile.status,
    totalTrips: profile.totalTrips,
    documents: profile.documents ?? [],
    statusHistory: profile.statusHistory ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapVendorFilterToUserQuery(filter: Record<string, unknown>): Record<string, unknown> {
  const userQuery: Record<string, unknown> = { role: 'vendor', vendorProfile: { $exists: true } };

  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      userQuery.$or = value.map((clause) => mapVendorClause(clause as Record<string, unknown>));
      continue;
    }

    const mapped = mapVendorField(key, value);
    Object.assign(userQuery, mapped);
  }

  return userQuery;
}

export function mapDriverFilterToUserQuery(filter: Record<string, unknown>): Record<string, unknown> {
  const userQuery: Record<string, unknown> = { role: 'driver', driverProfile: { $exists: true } };

  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      userQuery.$or = value.map((clause) => mapDriverClause(clause as Record<string, unknown>));
      continue;
    }

    const mapped = mapDriverField(key, value);
    Object.assign(userQuery, mapped);
  }

  return userQuery;
}

function mapVendorClause(clause: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(clause)) {
    Object.assign(mapped, mapVendorField(key, value));
  }
  return mapped;
}

function mapDriverClause(clause: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(clause)) {
    Object.assign(mapped, mapDriverField(key, value));
  }
  return mapped;
}

function mapVendorField(key: string, value: unknown): Record<string, unknown> {
  switch (key) {
    case 'mobileNumber':
    case 'email':
      return { [key]: value };
    case 'businessName':
    case 'ownerName':
    case 'status':
    case 'verificationStage':
    case 'address':
      return { [`vendorProfile.${key}`]: value };
    default:
      return { [key]: value };
  }
}

function mapDriverField(key: string, value: unknown): Record<string, unknown> {
  switch (key) {
    case 'phone':
      return { mobileNumber: value };
    case 'name':
      return { fullName: value };
    case 'email':
      return { email: value };
    case 'vendorId':
      return { 'driverProfile.vendorUserId': value };
    case 'driverCode':
    case 'licenseNo':
    case 'driverType':
    case 'city':
    case 'state':
    case 'vehicleRegistration':
    case 'status':
      return { [`driverProfile.${key}`]: value };
    default:
      return { [key]: value };
  }
}
