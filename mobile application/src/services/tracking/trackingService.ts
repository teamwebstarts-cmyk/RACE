/**
 * Polls backend tracking endpoint; falls back to simulated updates if API unavailable.
 */
import { getBookingTracking } from '../bookings/bookingApi';
import type { BookingStatus } from '../../types/booking';

export interface TrackingUpdate {
  bookingId: string;
  latitude: number;
  longitude: number;
  etaMinutes: number;
  status: string;
}

type TrackingListener = (update: TrackingUpdate) => void;

class TrackingService {
  private listeners = new Map<string, Set<TrackingListener>>();
  private intervals = new Map<string, ReturnType<typeof setInterval>>();

  subscribe(bookingId: string, listener: TrackingListener): () => void {
    if (!this.listeners.has(bookingId)) {
      this.listeners.set(bookingId, new Set());
    }
    this.listeners.get(bookingId)!.add(listener);

    if (!this.intervals.has(bookingId)) {
      const poll = async () => {
        const tracking = await getBookingTracking(bookingId);
        if (tracking) {
          const update: TrackingUpdate = {
            bookingId,
            latitude: tracking.driverLocation?.latitude ?? 20.2961,
            longitude: tracking.driverLocation?.longitude ?? 85.8245,
            etaMinutes: tracking.etaMinutes,
            status: tracking.status,
          };
          this.listeners.get(bookingId)?.forEach((cb) => cb(update));
          return;
        }

        // Fallback simulation when API unreachable
        const fallback: TrackingUpdate = {
          bookingId,
          latitude: 20.2961 + Math.random() * 0.01,
          longitude: 85.8245 + Math.random() * 0.01,
          etaMinutes: 15,
          status: 'EN_ROUTE' as BookingStatus,
        };
        this.listeners.get(bookingId)?.forEach((cb) => cb(fallback));
      };

      void poll();
      const interval = setInterval(() => {
        void poll();
      }, 5000);
      this.intervals.set(bookingId, interval);
    }

    return () => {
      this.listeners.get(bookingId)?.delete(listener);
      if (this.listeners.get(bookingId)?.size === 0) {
        const interval = this.intervals.get(bookingId);
        if (interval) clearInterval(interval);
        this.intervals.delete(bookingId);
        this.listeners.delete(bookingId);
      }
    };
  }

  connect(_url?: string): void {
    // Reserved for future WebSocket
  }

  disconnect(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
  }
}

export const trackingService = new TrackingService();
