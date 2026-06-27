import { Types } from 'mongoose';

import { VendorModel } from '../../vendors/vendor.model';
import { BookingModel } from '../../bookings/booking.model';
import { DriverModel, type IDriver } from '../models/driver.model';
import { VendorVehicleModel } from '../models/vendor-vehicle.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { getEntityActivities } from '../shared/entity-activities';
import { buildDriverDocuments, deriveDocumentsStatus, mapVerificationStage } from '../shared/response-mappers';
import { NotFoundError, BadRequestError } from '../../../shared/utils/errors';

async function mapDriver(driver: {
  _id: Types.ObjectId;
  driverCode: string;
  name: string;
  phone: string;
  licenseNo: string;
  driverType: string;
  vendorId?: Types.ObjectId;
  city: string;
  vehicleRegistration?: string;
  rating: number;
  reviewCount: number;
  status: string;
}, vendorName?: string) {
  const documents = buildDriverDocuments(driver);
  return {
    id: driver._id.toString(),
    name: driver.name,
    phone: driver.phone,
    licenseNo: driver.licenseNo,
    driverType: driver.driverType,
    vendorId: driver.vendorId?.toString() ?? '',
    vendorName: vendorName ?? '—',
    city: driver.city,
    vehicleRegistration: driver.vehicleRegistration ?? '—',
    rating: driver.rating,
    reviewCount: driver.reviewCount,
    status: driver.status,
    verificationStatus: mapVerificationStage(
      driver.status === 'APPROVED' ? 'approved' : driver.status === 'REJECTED' ? 'rejected' : 'document_review',
      driver.status.toLowerCase(),
    ),
    documentsStatus: deriveDocumentsStatus(documents),
  };
}

export const adminDriversService = {
  async list(filters: {
    search?: string;
    status?: string;
    verification?: string;
    city?: string;
    vendorId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'ALL') query.status = filters.status;
    if (filters.city && filters.city !== 'ALL') query.city = filters.city;
    if (filters.vendorId && filters.vendorId !== 'ALL') query.vendorId = filters.vendorId;
    if (filters.verification && filters.verification !== 'ALL') {
      if (filters.verification === 'VERIFIED') query.status = 'APPROVED';
      else if (filters.verification === 'REJECTED') query.status = 'REJECTED';
      else query.status = 'PENDING';
    }
    if (filters.search?.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
      query.$or = [{ name: regex }, { phone: regex }, { licenseNo: regex }, { driverCode: regex }];
    }

    const result = await paginate<IDriver, IDriver>(DriverModel, query, filters, (doc) => doc);
    const vendorIds = [...new Set(result.items.map((d) => d.vendorId?.toString()).filter(Boolean))];
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } }).lean();
    const vendorMap = new Map(vendors.map((v) => [v._id.toString(), v.businessName ?? v.ownerName ?? 'Vendor']));

    return {
      ...result,
      items: await Promise.all(
        result.items.map((d) =>
          mapDriver(d, d.vendorId ? vendorMap.get(d.vendorId.toString()) : undefined),
        ),
      ),
    };
  },

  async getById(id: string) {
    const driver = await DriverModel.findById(id);
    if (!driver) throw new NotFoundError('Driver not found');
    let vendorName: string | undefined;
    if (driver.vendorId) {
      const vendor = await VendorModel.findById(driver.vendorId).lean();
      vendorName = vendor?.businessName ?? vendor?.ownerName;
    }
    const base = await mapDriver(driver, vendorName);

    const [bookings, activities, fleetVehicle] = await Promise.all([
      BookingModel.find({ 'driver.id': id }).sort({ createdAt: -1 }).limit(20).lean(),
      getEntityActivities('driver', id),
      driver.vehicleRegistration
        ? VendorVehicleModel.findOne({ registrationNo: driver.vehicleRegistration }).lean()
        : Promise.resolve(null),
    ]);

    return {
      ...base,
      email: driver.email ?? '',
      address: `${driver.city}${driver.state ? `, ${driver.state}` : ''}`,
      joinedAt: driver.createdAt.toISOString(),
      licenseExpiry: '',
      licenseClass: 'LMV',
      aadhaarMasked: 'XXXX-XXXX-XXXX',
      assignedVehicle: {
        registrationNo: driver.vehicleRegistration ?? fleetVehicle?.registrationNo ?? '—',
        type: fleetVehicle?.type ?? driver.driverType,
        model: fleetVehicle?.vehicleModel ?? '—',
        year: fleetVehicle?.year ?? new Date().getFullYear(),
        status: (fleetVehicle?.status ?? 'ACTIVE') as 'ACTIVE' | 'UNDER_MAINTENANCE',
      },
      bookings: bookings.map((b) => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        service: b.serviceLabel,
        status: b.status,
        amount: b.invoice?.total ?? 0,
        date: b.createdAt.toISOString(),
        driverName: b.driver?.name,
      })),
      reviews: [],
      documents: buildDriverDocuments(driver),
      activities,
    };
  },

  async create(input: Record<string, string>, actor: { id: string; name: string }) {
    const count = await DriverModel.countDocuments();
    const driver = await DriverModel.create({
      driverCode: `DRV${String(count + 1).padStart(4, '0')}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      licenseNo: input.licenseNo,
      driverType: input.driverType ?? 'Tow Driver',
      vendorId: input.vendorId || undefined,
      city: input.city ?? 'Bhubaneswar',
      state: input.state ?? 'Odisha',
      vehicleRegistration: input.vehicleRegistration,
      status: input.status ?? 'PENDING',
      statusHistory: [{ status: (input.status ?? 'PENDING') as never, changedAt: new Date() }],
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_CREATED',
      entityType: 'driver',
      entityId: driver._id.toString(),
      title: `Driver ${driver.name} created`,
    });

    return mapDriver(driver);
  },

  async update(id: string, input: Record<string, string>, actor: { id: string; name: string }) {
    const driver = await DriverModel.findById(id);
    if (!driver) throw new NotFoundError('Driver not found');

    Object.assign(driver, {
      name: input.name ?? driver.name,
      phone: input.phone ?? driver.phone,
      email: input.email ?? driver.email,
      licenseNo: input.licenseNo ?? driver.licenseNo,
      driverType: input.driverType ?? driver.driverType,
      city: input.city ?? driver.city,
      vehicleRegistration: input.vehicleRegistration ?? driver.vehicleRegistration,
      vendorId: input.vendorId || driver.vendorId,
      status: input.status ?? driver.status,
    });
    await driver.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_UPDATED',
      entityType: 'driver',
      entityId: driver._id.toString(),
      title: `Driver ${driver.name} updated`,
    });

    return mapDriver(driver);
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const driver = await DriverModel.findByIdAndDelete(id);
    if (!driver) throw new NotFoundError('Driver not found');
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_DELETED',
      entityType: 'driver',
      entityId: id,
      title: `Driver ${driver.name} deleted`,
    });
  },

  async reviewDocument(
    id: string,
    documentId: string,
    status: 'VERIFIED' | 'REJECTED',
    actor: { id: string; name: string },
  ) {
    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      throw new BadRequestError('Invalid document status');
    }
    const driver = await DriverModel.findById(id);
    if (!driver) throw new NotFoundError('Driver not found');

    const driverId = driver._id.toString();
    const DOC_BY_KEY: Record<string, string> = {
      dl: 'Driving License',
      aadhaar: 'Aadhaar Card',
      police: 'Police Verification',
      medical: 'Medical Fitness Certificate',
    };

    let docIndex = -1;
    const indexMatch = documentId.match(/-doc-(\d+)$/);
    if (indexMatch) {
      docIndex = Number(indexMatch[1]);
    } else if (documentId.startsWith(`${driverId}-`)) {
      const docKey = documentId.slice(driverId.length + 1);
      const docType = DOC_BY_KEY[docKey];
      if (!docType) throw new NotFoundError('Document not found');

      if (!driver.documents?.length) {
        driver.documents = [];
      }
      docIndex = driver.documents.findIndex((doc) => doc.type === docType);
      if (docIndex < 0) {
        driver.documents.push({
          type: docType,
          url: `/admin/documents/driver/${driverId}/${docKey}`,
          status,
          uploadedAt: new Date(),
        });
        docIndex = driver.documents.length - 1;
      }
    } else {
      throw new NotFoundError('Document not found');
    }

    if (!driver.documents[docIndex]) throw new NotFoundError('Document not found');

    driver.documents[docIndex].status = status;
    await driver.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: status === 'VERIFIED' ? 'DRIVER_DOCUMENT_VERIFIED' : 'DRIVER_DOCUMENT_REJECTED',
      entityType: 'driver',
      entityId: id,
      title: `${driver.documents[docIndex].type} ${status === 'VERIFIED' ? 'verified' : 'rejected'} for ${driver.name}`,
    });

    return this.getById(id);
  },

  async getCounts() {
    const [all, pending, approved, rejected, suspended] = await Promise.all([
      DriverModel.countDocuments(),
      DriverModel.countDocuments({ status: 'PENDING' }),
      DriverModel.countDocuments({ status: 'APPROVED' }),
      DriverModel.countDocuments({ status: 'REJECTED' }),
      DriverModel.countDocuments({ status: 'SUSPENDED' }),
    ]);
    return { all, pending, approved, rejected, suspended };
  },
};
