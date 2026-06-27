import { Types } from 'mongoose';

import { VendorVehicleModel } from '../models/vendor-vehicle.model';
import { VendorModel } from '../../vendors/vendor.model';
import { logActivity } from '../shared/activity-logger';
import { createNotification } from '../shared/notification-service';
import { NotFoundError } from '../../../shared/utils/errors';

function mapVehicle(doc: {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  registrationNo: string;
  type: string;
  vehicleModel: string;
  year?: number;
  status: string;
  insuranceExpiry?: Date;
  maintenanceNote?: string;
}) {
  return {
    id: doc._id.toString(),
    vendorId: doc.vendorId.toString(),
    registrationNo: doc.registrationNo,
    type: doc.type,
    model: doc.vehicleModel,
    year: doc.year,
    status: doc.status,
    insuranceExpiry: doc.insuranceExpiry?.toISOString(),
    maintenanceNote: doc.maintenanceNote,
  };
}

export const adminVehiclesService = {
  async listByVendor(vendorId: string) {
    const vehicles = await VendorVehicleModel.find({ vendorId }).sort({ createdAt: -1 }).lean();
    return vehicles.map(mapVehicle);
  },

  async create(
    vendorId: string,
    input: {
      registrationNo: string;
      type: string;
      model: string;
      year?: number;
      status?: string;
      insuranceExpiry?: string;
    },
    actor: { id: string; name: string },
  ) {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const vehicle = await VendorVehicleModel.create({
      vendorId: vendor._id,
      registrationNo: input.registrationNo,
      type: input.type,
      vehicleModel: input.model,
      year: input.year,
      status: input.status ?? 'ACTIVE',
      insuranceExpiry: input.insuranceExpiry ? new Date(input.insuranceExpiry) : undefined,
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VEHICLE_CREATED',
      entityType: 'vehicle',
      entityId: vehicle._id.toString(),
      title: `Vehicle ${vehicle.registrationNo} added to vendor`,
    });

    await createNotification({
      title: 'Vehicle added',
      message: `${vehicle.registrationNo} added to ${vendor.businessName ?? vendor.ownerName}`,
      category: 'vendor',
      entityType: 'vehicle',
      entityId: vehicle._id.toString(),
    });

    return mapVehicle(vehicle);
  },

  async update(
    id: string,
    input: Partial<{
      type: string;
      model: string;
      year: number;
      status: string;
      insuranceExpiry: string;
      maintenanceNote: string;
    }>,
    actor: { id: string; name: string },
  ) {
    const vehicle = await VendorVehicleModel.findById(id);
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    if (input.type) vehicle.type = input.type;
    if (input.model) vehicle.vehicleModel = input.model;
    if (input.year !== undefined) vehicle.year = input.year;
    if (input.status) vehicle.status = input.status as never;
    if (input.insuranceExpiry) vehicle.insuranceExpiry = new Date(input.insuranceExpiry);
    if (input.maintenanceNote !== undefined) vehicle.maintenanceNote = input.maintenanceNote;
    await vehicle.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VEHICLE_UPDATED',
      entityType: 'vehicle',
      entityId: vehicle._id.toString(),
      title: `Vehicle ${vehicle.registrationNo} updated`,
    });

    return mapVehicle(vehicle);
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const vehicle = await VendorVehicleModel.findByIdAndDelete(id);
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VEHICLE_DELETED',
      entityType: 'vehicle',
      entityId: id,
      title: `Vehicle ${vehicle.registrationNo} deleted`,
    });
  },
};
