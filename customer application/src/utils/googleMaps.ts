import Constants from 'expo-constants';

export const BHUBANESWAR_DEFAULT = {
  latitude: 20.2961,
  longitude: 85.8245,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function getGoogleMapsApiKey(): string {
  const fromPublicEnv = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim();
  const fromExtra = (Constants.expoConfig?.extra?.googleMapsApiKey as string | undefined)?.trim();
  return fromPublicEnv || fromExtra || '';
}

interface GeocodeResponse {
  status: string;
  results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
  error_message?: string;
}

export async function forwardGeocode(
  query: string,
): Promise<{ address: string; latitude: number; longitude: number } | null> {
  const key = getGoogleMapsApiKey();
  if (!key || !query.trim()) return null;

  const params = new URLSearchParams({
    address: query.trim(),
    region: 'in',
    key,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    const data = (await response.json()) as GeocodeResponse;
    const result = data.results?.[0];
    if (!result) return null;

    return {
      address: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const key = getGoogleMapsApiKey();
  if (!key) {
    return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
  }

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key,
    region: 'in',
    language: 'en',
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    const data = (await response.json()) as GeocodeResponse;
    return data.results?.[0]?.formatted_address ?? `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
  } catch {
    return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
  }
}
