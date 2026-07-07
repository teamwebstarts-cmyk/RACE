import { env } from '../config/env';
import { logger } from './utils/logger';

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface DistanceMatrixElement {
  status: string;
  distance?: { value: number };
  duration?: { value: number };
}

interface DistanceMatrixResponse {
  status: string;
  rows?: Array<{
    elements?: DistanceMatrixElement[];
  }>;
  error_message?: string;
}

export async function getDistanceAndDuration(
  origin: LatLng,
  destination: LatLng,
): Promise<{ distanceKm: number; durationMinutes: number } | null> {
  if (!env.GOOGLE_MAPS_API_KEY?.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    origins: `${origin.latitude},${origin.longitude}`,
    destinations: `${destination.latitude},${destination.longitude}`,
    mode: 'driving',
    units: 'metric',
    region: 'in',
    key: env.GOOGLE_MAPS_API_KEY,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      logger.warn('Google Distance Matrix request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as DistanceMatrixResponse;

    if (data.status !== 'OK') {
      logger.warn('Google Distance Matrix API error', {
        status: data.status,
        errorMessage: data.error_message,
      });
      return null;
    }

    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK' || !element.distance || !element.duration) {
      logger.warn('Google Distance Matrix element not OK', {
        elementStatus: element?.status ?? 'missing',
      });
      return null;
    }

    return {
      distanceKm: element.distance.value / 1000,
      durationMinutes: element.duration.value / 60,
    };
  } catch (error) {
    logger.warn('Google Distance Matrix request threw', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
