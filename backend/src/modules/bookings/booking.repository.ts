import { BookingModel, type BookingStatus, type IBooking } from './booking.model';

export class BookingRepository {
  async create(data: Partial<IBooking>): Promise<IBooking> {
    return BookingModel.create(data);
  }

  async findByIdForCustomer(id: string, customerId: string): Promise<IBooking | null> {
    return BookingModel.findOne({ _id: id, customerId });
  }

  async findById(id: string): Promise<IBooking | null> {
    return BookingModel.findById(id);
  }

  async findByCustomer(
    customerId: string,
    options?: { status?: BookingStatus; limit?: number },
  ): Promise<IBooking[]> {
    const filter: Record<string, unknown> = { customerId };
    if (options?.status) {
      filter.status = options.status;
    }
    const query = BookingModel.find(filter).sort({ createdAt: -1 });
    if (options?.limit) {
      query.limit(options.limit);
    }
    return query;
  }

  async updateByIdForCustomer(
    id: string,
    customerId: string,
    update: Partial<IBooking>,
  ): Promise<IBooking | null> {
    return BookingModel.findOneAndUpdate({ _id: id, customerId }, update, { new: true });
  }

  async countByCustomer(customerId: string): Promise<number> {
    return BookingModel.countDocuments({ customerId });
  }

  async generateBookingNumber(): Promise<string> {
    const count = await BookingModel.countDocuments();
    const seq = String(78290 + count + 1).padStart(5, '0');
    return `RACE${seq}`;
  }
}

export const bookingRepository = new BookingRepository();
