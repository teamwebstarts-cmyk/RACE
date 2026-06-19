import { BadRequestError, ConflictError, NotFoundError } from '../../shared/utils/errors';
import { vehicleRepository } from '../vehicles/vehicle.repository';
import { notificationService } from '../notifications/notification.service';
import { bookingRepository } from './booking.repository';
import {
  BOOKING_STATUS_LABELS,
  MOCK_DRIVERS,
  SERVICE_BASE_PRICES,
} from './booking.constants';
import type { BookingStatus, IBooking } from './booking.model';
import type {
  BookingResponseDto,
  CreateBookingDto,
  SubmitRatingDto,
  TrackingResponseDto,
} from './booking.validator';

const STATUS_ORDER: BookingStatus[] = [
  'CREATED',
  'ASSIGNED',
  'ACCEPTED',
  'EN_ROUTE',
  'ARRIVED',
  'SERVICE_STARTED',
  'SERVICE_COMPLETED',
  'PAYMENT_PENDING',
  'PAID',
];

function buildTimeline(booking: IBooking) {
  const currentIdx = STATUS_ORDER.indexOf(booking.status);
  return STATUS_ORDER.map((status, idx) => {
    const historyEntry = booking.statusHistory.find((h) => h.status === status);
    return {
      status,
      label: BOOKING_STATUS_LABELS[status],
      timestamp: historyEntry?.timestamp.toISOString() ?? booking.createdAt.toISOString(),
      completed: idx <= currentIdx,
    };
  });
}

function mapBooking(booking: IBooking): BookingResponseDto {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    categoryId: booking.categoryId,
    serviceId: booking.serviceId,
    serviceLabel: booking.serviceLabel,
    serviceDescription: booking.serviceDescription,
    status: booking.status,
    vehicleId: booking.vehicleId.toString(),
    vehicleNumber: booking.vehicleNumber,
    vehicleLabel: booking.vehicleLabel,
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    scheduledAt: booking.scheduledAt?.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    driver: booking.driver,
    etaMinutes: booking.etaMinutes,
    distanceKm: booking.distanceKm,
    durationMinutes: booking.durationMinutes,
    invoice: booking.invoice,
    timeline: buildTimeline(booking),
    rating: booking.rating?.score,
    review: booking.rating?.review,
  };
}

function calculateInvoice(serviceId: string, distanceKm = 8) {
  const baseFare = SERVICE_BASE_PRICES[serviceId] ?? 499;
  const distanceCharge = Math.round(distanceKm * 18.75);
  const platformFee = 50;
  const total = baseFare + distanceCharge + platformFee;
  return { baseFare, distanceCharge, platformFee, total, currency: 'INR' as const };
}

function pickMockDriver() {
  return MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
}

export class BookingService {
  async createBooking(customerId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    const vehicle = await vehicleRepository.findByIdForCustomer(dto.vehicleId, customerId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const bookingNumber = await bookingRepository.generateBookingNumber();
    const driver = pickMockDriver();
    const now = new Date();
    const distanceKm = 8;
    const invoice = calculateInvoice(dto.serviceId, distanceKm);

    const booking = await bookingRepository.create({
      customerId: customerId as unknown as IBooking['customerId'],
      bookingNumber,
      categoryId: dto.categoryId,
      serviceId: dto.serviceId,
      serviceLabel: dto.serviceLabel,
      serviceDescription: dto.serviceDescription,
      status: 'ASSIGNED',
      vehicleId: vehicle.id as unknown as IBooking['vehicleId'],
      vehicleNumber: vehicle.vehicleNumber,
      vehicleLabel: `${vehicle.brand} ${vehicle.vehicleModel}`,
      pickup: dto.pickup,
      dropoff: dto.dropoff,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      driver,
      etaMinutes: 25,
      distanceKm,
      durationMinutes: 30,
      invoice: { ...invoice, paymentMethod: 'UPI' },
      statusHistory: [
        { status: 'CREATED', timestamp: now },
        { status: 'ASSIGNED', timestamp: new Date(now.getTime() + 1000) },
      ],
      driverLatitude: (dto.pickup.latitude ?? 20.2961) + 0.01,
      driverLongitude: (dto.pickup.longitude ?? 85.8245) + 0.01,
    });

    await notificationService.createForUser(customerId, {
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed!',
      message: `Your ${dto.serviceLabel.toLowerCase()} request #${bookingNumber} is confirmed. Driver arriving in 25 min.`,
      metadata: { bookingId: booking.id },
    });

    return mapBooking(booking);
  }

  async listBookings(customerId: string, status?: BookingStatus): Promise<BookingResponseDto[]> {
    const bookings = await bookingRepository.findByCustomer(customerId, { status });
    return bookings.map(mapBooking);
  }

  async getBooking(customerId: string, bookingId: string): Promise<BookingResponseDto> {
    const booking = await bookingRepository.findByIdForCustomer(bookingId, customerId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    return mapBooking(booking);
  }

  async getTracking(customerId: string, bookingId: string): Promise<TrackingResponseDto> {
    const booking = await bookingRepository.findByIdForCustomer(bookingId, customerId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return {
      bookingId: booking.id,
      status: booking.status,
      etaMinutes: booking.etaMinutes ?? 25,
      driver: booking.driver,
      driverLocation:
        booking.driverLatitude && booking.driverLongitude
          ? { latitude: booking.driverLatitude, longitude: booking.driverLongitude }
          : undefined,
      pickup: booking.pickup,
      dropoff: booking.dropoff,
    };
  }

  async submitRating(
    customerId: string,
    bookingId: string,
    dto: SubmitRatingDto,
  ): Promise<BookingResponseDto> {
    const booking = await bookingRepository.findByIdForCustomer(bookingId, customerId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.rating) {
      throw new ConflictError('Rating already submitted for this booking');
    }

    if (!['SERVICE_COMPLETED', 'PAYMENT_PENDING', 'PAID'].includes(booking.status)) {
      throw new BadRequestError('Booking must be completed before rating');
    }

    const updated = await bookingRepository.updateByIdForCustomer(bookingId, customerId, {
      rating: {
        score: dto.rating,
        review: dto.review,
        tipAmount: dto.tipAmount,
        tags: dto.tags,
        createdAt: new Date(),
      },
      status: 'PAID',
      statusHistory: [
        ...booking.statusHistory,
        { status: 'PAID' as BookingStatus, timestamp: new Date() },
      ],
      invoice: booking.invoice
        ? { ...booking.invoice, paymentMethod: booking.invoice.paymentMethod ?? 'UPI' }
        : undefined,
    });

    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    return mapBooking(updated);
  }

  async advanceBookingForDemo(customerId: string, bookingId: string): Promise<BookingResponseDto> {
    const booking = await bookingRepository.findByIdForCustomer(bookingId, customerId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const currentIdx = STATUS_ORDER.indexOf(booking.status);
    if (currentIdx >= STATUS_ORDER.length - 1) {
      return mapBooking(booking);
    }

    const nextStatus = STATUS_ORDER[currentIdx + 1];
    const updates: Partial<IBooking> = {
      status: nextStatus,
      statusHistory: [...booking.statusHistory, { status: nextStatus, timestamp: new Date() }],
    };

    if (nextStatus === 'SERVICE_COMPLETED' || nextStatus === 'PAYMENT_PENDING') {
      updates.etaMinutes = 0;
    }

    const updated = await bookingRepository.updateByIdForCustomer(bookingId, customerId, updates);
    if (!updated) {
      throw new NotFoundError('Booking not found');
    }

    if (nextStatus === 'SERVICE_COMPLETED') {
      await notificationService.createForUser(customerId, {
        type: 'BOOKING_COMPLETED',
        title: 'Booking Completed',
        message: `Your ${booking.serviceLabel} #${booking.bookingNumber} has been completed.`,
        metadata: { bookingId: booking.id },
      });
    }

    return mapBooking(updated);
  }
}

export const bookingService = new BookingService();
