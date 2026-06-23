import { BOOKING_DETAIL } from '../data/demo';
import type { BookingDetail, BookingHistoryItem } from '../types/models';

export function getBookingDetail(bookingId: string): BookingDetail {
  if (bookingId === '#RACE78291') {
    return { ...BOOKING_DETAIL, status: 'On The Way' };
  }
  if (bookingId === '4') {
    return BOOKING_DETAIL;
  }

  return {
    ...BOOKING_DETAIL,
    id: bookingId.startsWith('#') ? bookingId : `#RACE${bookingId.padStart(5, '0')}`,
  };
}

export function getBookingDetailFromHistory(item: BookingHistoryItem): BookingDetail {
  if (item.service === 'Towing Service') {
    return { ...BOOKING_DETAIL, date: item.date, payment: { ...BOOKING_DETAIL.payment, total: item.amount } };
  }

  return {
    id: `#RACE${item.id.padStart(5, '0')}`,
    status: item.status,
    date: item.date,
    service: item.service,
    subService: 'Standard',
    vehicle: 'Toyota Innova',
    towingType: '—',
    pickup: item.location,
    drop: '—',
    time: item.date.split(', ')[1] ?? '—',
    duration: '25 min',
    distance: '—',
    driver: BOOKING_DETAIL.driver,
    payment: {
      baseFare: Math.round(item.amount * 0.75),
      distanceCharge: Math.round(item.amount * 0.15),
      platformFee: Math.round(item.amount * 0.1),
      total: item.amount,
      method: 'Wallet',
    },
  };
}
