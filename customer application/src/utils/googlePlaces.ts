import type { AddressFormValues } from '../components/profile/ProfileAddressFields';
import type { LocationResult } from '../types/location';
import { getGoogleMapsApiKey, reverseGeocode } from './googleMaps';
import { buildReadableAddressLabel } from './readableAddress';

export const LOCATION_ACCENT = '#F59E0B';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetailsLike {
  place_id?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  address_components?: AddressComponent[];
}

function getComponent(components: AddressComponent[], type: string): string {
  return components.find(component => component.types.includes(type))?.long_name ?? '';
}

export function parseLocationResult(
  placeId: string,
  formattedAddress: string,
  latitude: number,
  longitude: number,
  addressComponents: AddressComponent[] = [],
): LocationResult {
  const city =
    getComponent(addressComponents, 'locality') ||
    getComponent(addressComponents, 'administrative_area_level_2') ||
    getComponent(addressComponents, 'sublocality_level_1') ||
    getComponent(addressComponents, 'sublocality') ||
    '';

  return {
    address: formattedAddress,
    displayLabel: buildReadableAddressLabel(formattedAddress, addressComponents),
    city,
    state: getComponent(addressComponents, 'administrative_area_level_1'),
    pincode: getComponent(addressComponents, 'postal_code'),
    latitude,
    longitude,
    placeId,
  };
}

export function parseLocationFromPlaceDetails(
  data: { place_id?: string; description?: string },
  details: PlaceDetailsLike | null,
): LocationResult | null {
  if (!details?.geometry?.location) return null;

  const formattedAddress = details.formatted_address ?? data.description ?? '';
  const { lat, lng } = details.geometry.location;

  return parseLocationResult(
    details.place_id ?? data.place_id ?? '',
    formattedAddress,
    lat,
    lng,
    details.address_components ?? [],
  );
}

export function toAddressFormValues(location: LocationResult): AddressFormValues {
  const parts = location.address
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const line1 = parts[0] ?? location.address;
  const line2 =
    parts.find(part => part.toLowerCase().includes(location.city.toLowerCase()) === false &&
      part !== line1 &&
      !part.match(/^\d{6}$/) &&
      part !== location.state) ??
    parts[1] ??
    '';

  return {
    line1,
    line2: line2 === line1 ? '' : line2,
    city: location.city,
    state: location.state,
    pincode: location.pincode,
  };
}

export async function reverseGeocodeToLocation(
  latitude: number,
  longitude: number,
): Promise<LocationResult> {
  const key = getGoogleMapsApiKey();
  if (!key) {
    const address = await reverseGeocode(latitude, longitude);
    return {
      address,
      city: '',
      state: '',
      pincode: '',
      latitude,
      longitude,
      placeId: '',
    };
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
    const data = (await response.json()) as {
      results?: Array<{
        formatted_address: string;
        place_id: string;
        geometry: { location: { lat: number; lng: number } };
        address_components: AddressComponent[];
      }>;
    };

    const result = data.results?.[0];
    if (!result) {
      throw new Error('No address found');
    }

    return parseLocationResult(
      result.place_id,
      result.formatted_address,
      result.geometry.location.lat,
      result.geometry.location.lng,
      result.address_components,
    );
  } catch {
    const address = await reverseGeocode(latitude, longitude);
    return {
      address,
      city: '',
      state: '',
      pincode: '',
      latitude,
      longitude,
      placeId: '',
    };
  }
}
