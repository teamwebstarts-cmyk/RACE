import { io, type Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

let socket: Socket | null = null;

function getBaseUrl(): string {
  return API_CONFIG.baseUrl;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(getBaseUrl(), {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinDriverRoom(driverId: string): void {
  connectSocket().emit('driver:join', { driverId });
}

export function trackBooking(bookingId: string, bookingType: string): void {
  connectSocket().emit('booking:track', {
    bookingId,
    bookingType,
  });
}

export function onDriverLocation(
  callback: (data: {
    bookingId: string;
    driverId: string;
    latitude: number;
    longitude: number;
    updatedAt: string;
  }) => void,
): void {
  connectSocket().on('driver:location', callback);
}

export function onBookingStatus(
  callback: (data: { bookingId: string; status: string }) => void,
): void {
  connectSocket().on('booking:status', callback);
}

export function offDriverLocation(): void {
  socket?.off('driver:location');
}

export function offBookingStatus(): void {
  socket?.off('booking:status');
}
