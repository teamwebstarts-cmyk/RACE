import type { Server as HttpServer } from 'http';

import { Server as SocketIOServer, type Socket } from 'socket.io';

import { env } from '../../config/env';
import { logger } from '../../utils/src/logger';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer): void {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('driver:join', (data: { driverId: string }) => {
      socket.join(`driver:${data.driverId}`);
      logger.info(`Driver ${data.driverId} connected`, { socketId: socket.id });
    });

    socket.on('booking:track', (data: { bookingId: string; bookingType: string }) => {
      socket.join(`booking:${data.bookingId}`);
      logger.info(`Customer tracking booking ${data.bookingId}`, {
        socketId: socket.id,
        bookingType: data.bookingType,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitToBooking(bookingId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`booking:${bookingId}`).emit(event, data);
}

export function emitDriverLocation(
  bookingId: string,
  driverId: string,
  latitude: number,
  longitude: number,
): void {
  emitToBooking(bookingId, 'driver:location', {
    bookingId,
    driverId,
    latitude,
    longitude,
    updatedAt: new Date().toISOString(),
  });
}

export function emitBookingStatusUpdate(
  bookingId: string,
  status: string,
  data?: Record<string, unknown>,
): void {
  emitToBooking(bookingId, 'booking:status', {
    bookingId,
    status,
    updatedAt: new Date().toISOString(),
    ...(data ?? {}),
  });
}
