import {
  DriverBookingModel,
  type IDriverBooking,
  type IDriverStatusHistoryEntry,
} from './driver-booking.model';
import type { UnifiedBookingStatus } from '../shared/booking-status.constants';

export class DriverBookingRepository {
  async create(data: Partial<IDriverBooking>): Promise<IDriverBooking> {
    return DriverBookingModel.create(data);
  }

  async findById(id: string): Promise<IDriverBooking | null> {
    return DriverBookingModel.findById(id);
  }

  async findByIdForCustomer(id: string, customerId: string): Promise<IDriverBooking | null> {
    return DriverBookingModel.findOne({ _id: id, customerId });
  }

  async findByCustomer(
    customerId: string,
    options?: { status?: UnifiedBookingStatus },
  ): Promise<IDriverBooking[]> {
    const filter: Record<string, unknown> = { customerId };
    if (options?.status) {
      filter.status = options.status;
    }
    return DriverBookingModel.find(filter).sort({ createdAt: -1 });
  }

  async findByDriver(
    driverId: string,
    options?: { status?: UnifiedBookingStatus },
  ): Promise<IDriverBooking[]> {
    const filter: Record<string, unknown> = { driverId };
    if (options?.status) {
      filter.status = options.status;
    }
    return DriverBookingModel.find(filter).sort({ createdAt: -1 });
  }

  async updateById(
    id: string,
    update: Partial<IDriverBooking>,
  ): Promise<IDriverBooking | null> {
    return DriverBookingModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateStatus(
    id: string,
    status: UnifiedBookingStatus,
    statusHistory: IDriverStatusHistoryEntry[],
    extra?: Partial<IDriverBooking>,
  ): Promise<IDriverBooking | null> {
    return DriverBookingModel.findByIdAndUpdate(
      id,
      { status, statusHistory, ...extra },
      { new: true },
    );
  }

  async countAll(): Promise<number> {
    return DriverBookingModel.countDocuments();
  }
}

export const driverBookingRepository = new DriverBookingRepository();
