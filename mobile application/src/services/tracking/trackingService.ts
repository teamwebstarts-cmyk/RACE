/**
 * Socket-ready tracking service stub.
 * Replace connect/disconnect with a real WebSocket client when backend is ready.
 */
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
      let eta = 25;
      const interval = setInterval(() => {
        eta = Math.max(1, eta - 1);
        const update: TrackingUpdate = {
          bookingId,
          latitude: 20.2961 + Math.random() * 0.01,
          longitude: 85.8245 + Math.random() * 0.01,
          etaMinutes: eta,
          status: eta > 5 ? 'EN_ROUTE' : 'ARRIVED',
        };
        this.listeners.get(bookingId)?.forEach((cb) => cb(update));
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
    // Future: WebSocket connection
  }

  disconnect(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
  }
}

export const trackingService = new TrackingService();
