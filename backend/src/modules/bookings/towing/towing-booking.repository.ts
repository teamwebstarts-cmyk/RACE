import {
  TowingBookingModel,
  type ITowingBooking,
  type ITowingStatusHistoryEntry,
} from './towing-booking.model';
import type { UnifiedBookingStatus } from '../shared/booking-status.constants';

export class TowingBookingRepository {
  async create(data: Partial<ITowingBooking>): Promise<ITowingBooking> {
    return TowingBookingModel.create(data);
  }

  async findById(id: string): Promise<ITowingBooking | null> {
    return TowingBookingModel.findById(id);
  }

  async findByIdForCustomer(id: string, customerId: string): Promise<ITowingBooking | null> {
    return TowingBookingModel.findOne({ _id: id, customerId });
  }

  async findByCustomer(
    customerId: string,
    options?: { status?: UnifiedBookingStatus },
  ): Promise<ITowingBooking[]> {
    const filter: Record<string, unknown> = { customerId };
    if (options?.status) {
      filter.status = options.status;
    }
    return TowingBookingModel.find(filter).sort({ createdAt: -1 });
  }

  async findByDriver(
    driverId: string,
    options?: { status?: UnifiedBookingStatus },
  ): Promise<ITowingBooking[]> {
    const filter: Record<string, unknown> = { driverId };
    if (options?.status) {
      filter.status = options.status;
    }
    return TowingBookingModel.find(filter).sort({ createdAt: -1 });
  }

  async updateById(
    id: string,
    update: Partial<ITowingBooking>,
  ): Promise<ITowingBooking | null> {
    return TowingBookingModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateStatus(
    id: string,
    status: UnifiedBookingStatus,
    statusHistory: ITowingStatusHistoryEntry[],
    extra?: Partial<ITowingBooking>,
  ): Promise<ITowingBooking | null> {
    return TowingBookingModel.findByIdAndUpdate(
      id,
      { status, statusHistory, ...extra },
      { new: true },
    );
  }

  async countAll(): Promise<number> {
    return TowingBookingModel.countDocuments();
  }
}

export const towingBookingRepository = new TowingBookingRepository();
