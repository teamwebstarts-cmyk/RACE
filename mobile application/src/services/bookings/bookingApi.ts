import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { Booking, CreateBookingRequest, SubmitRatingRequest } from '../../types/booking';
import { apiClient } from '../api/apiClient';

function generateBookingNumber(): string {
  return `RACE${Math.floor(10000 + Math.random() * 90000)}`;
}

function buildTimeline(status: Booking['status']): Booking['timeline'] {
  const steps: Array<{ status: Booking['status']; label: string }> = [
    { status: 'CREATED', label: 'Booking created' },
    { status: 'ASSIGNED', label: 'Driver assigned' },
    { status: 'ACCEPTED', label: 'Driver accepted' },
    { status: 'EN_ROUTE', label: 'Driver en route' },
    { status: 'ARRIVED', label: 'Driver arrived' },
    { status: 'SERVICE_STARTED', label: 'Service started' },
    { status: 'SERVICE_COMPLETED', label: 'Service completed' },
    { status: 'PAYMENT_PENDING', label: 'Payment pending' },
    { status: 'PAID', label: 'Payment received' },
  ];
  const statusIndex = steps.findIndex((s) => s.status === status);
  const now = Date.now();
  return steps.map((step, index) => ({
    status: step.status,
    label: step.label,
    timestamp: new Date(now - (steps.length - index) * 600_000).toISOString(),
    completed: index <= statusIndex,
  }));
}

export function createLocalBooking(
  payload: CreateBookingRequest,
  vehicleNumber: string,
  vehicleLabel?: string,
): Booking {
  const id = `booking_${Date.now()}`;
  const estimatedTotal = payload.estimatedTotal ?? 899;
  return {
    id,
    bookingNumber: generateBookingNumber(),
    categoryId: payload.categoryId,
    serviceId: payload.serviceId,
    serviceLabel: payload.serviceLabel,
    serviceDescription: payload.serviceDescription,
    status: 'ASSIGNED',
    vehicleId: payload.vehicleId,
    vehicleNumber,
    vehicleLabel,
    pickup: payload.pickup,
    dropoff: payload.dropoff,
    scheduledAt: payload.scheduledAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    driver: {
      id: 'driver_1',
      name: 'Ramesh S.',
      rating: 4.9,
      phone: '+919876543210',
      experience: '3 years exp',
      verified: true,
    },
    etaMinutes: 25,
    distanceKm: 8,
    durationMinutes: 30,
    invoice: {
      baseFare: estimatedTotal - 200,
      distanceCharge: 150,
      platformFee: 50,
      total: estimatedTotal,
      currency: 'INR',
      paymentMethod: 'UPI',
    },
    timeline: buildTimeline('ASSIGNED'),
  };
}

export async function listBookings(): Promise<Booking[]> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<Booking[]>>(API_ENDPOINTS.bookings);
    return data.data;
  } catch {
    return [];
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<Booking>>(
      `${API_ENDPOINTS.bookings}/${id}`,
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function createBookingApi(payload: CreateBookingRequest): Promise<Booking | null> {
  try {
    const { data } = await apiClient.post<ApiSuccessResponse<Booking>>(
      API_ENDPOINTS.bookings,
      payload,
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function submitBookingRating(
  bookingId: string,
  payload: SubmitRatingRequest,
): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.bookingRating(bookingId), payload);
  } catch {
    // Local-only fallback — rating stored in Redux
  }
}
