import * as Location from 'expo-location';

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
  name?: string;
  geometry?: { location?: { lat: number; lng: number } };
  address_components?: AddressComponent[];
}

function getComponent(components: AddressComponent[], type: string): string {
  return components.find(component => component.types.includes(type))?.long_name ?? '';
}

function looksLikeCoordinates(value: string): boolean {
  return /^lat\s*:/i.test(value.trim()) || /^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(value.trim());
}

export function parseLocationResult(
  placeId: string,
  formattedAddress: string,
  latitude: number,
  longitude: number,
  addressComponents: AddressComponent[] = [],
  name = '',
): LocationResult {
  const streetNumber = getComponent(addressComponents, 'street_number');
  const route = getComponent(addressComponents, 'route');
  const sublocality =
    getComponent(addressComponents, 'sublocality_level_1') ||
    getComponent(addressComponents, 'sublocality_level_2') ||
    getComponent(addressComponents, 'sublocality') ||
    getComponent(addressComponents, 'neighborhood');
  const city =
    getComponent(addressComponents, 'locality') ||
    getComponent(addressComponents, 'administrative_area_level_2') ||
    sublocality ||
    '';
  const state = getComponent(addressComponents, 'administrative_area_level_1');
  const pincode = getComponent(addressComponents, 'postal_code');
  const premise =
    name ||
    getComponent(addressComponents, 'premise') ||
    getComponent(addressComponents, 'establishment') ||
    getComponent(addressComponents, 'point_of_interest');

  const safeAddress = looksLikeCoordinates(formattedAddress)
    ? [premise, streetNumber, route, sublocality, city, state, pincode].filter(Boolean).join(', ') ||
      'Selected location'
    : formattedAddress;

  return {
    address: safeAddress,
    displayLabel: buildReadableAddressLabel(safeAddress, addressComponents),
    streetNumber,
    route,
    sublocality,
    name: premise,
    city,
    state,
    pincode,
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
    details.name ?? '',
  );
}

/** Map a picked location into vendor / profile address form fields. */
export function toAddressFormValues(location: LocationResult): AddressFormValues {
  const streetLine = [location.streetNumber, location.route].filter(Boolean).join(' ').trim();
  const parts = location.address
    .split(',')
    .map(part => part.trim())
    .filter(part => part && !looksLikeCoordinates(part));

  const skip = new Set(
    [location.city, location.state, location.pincode, 'India', 'india']
      .filter(Boolean)
      .map(value => value.toLowerCase()),
  );

  const usableParts = parts.filter(part => !skip.has(part.toLowerCase()) && !/^\d{6}$/.test(part));

  const line1 =
    streetLine ||
    location.name ||
    usableParts[0] ||
    (looksLikeCoordinates(location.address) ? '' : location.address);

  let line2 = location.sublocality || '';
  if (!line2) {
    line2 =
      usableParts.find(
        part =>
          part !== line1 &&
          !part.toLowerCase().includes((location.city || '').toLowerCase() || '__none__'),
      ) ??
      usableParts[1] ??
      '';
  }
  if (line2 === line1) {
    line2 = '';
  }

  // Fallback: parse city/state/pin from formatted address when structured fields are empty
  let city = location.city;
  let state = location.state;
  let pincode = location.pincode;

  if (!pincode) {
    const pinMatch = location.address.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }
  if (!city && usableParts.length >= 2) {
    city = usableParts[usableParts.length - 1] ?? '';
  }
  if (!state) {
    const stateCandidate = parts.find(
      part =>
        part !== city &&
        part !== line1 &&
        part !== line2 &&
        !/^\d{6}$/.test(part) &&
        part.toLowerCase() !== 'india',
    );
    if (stateCandidate && parts.indexOf(stateCandidate) > usableParts.length - 3) {
      state = stateCandidate;
    }
  }

  return {
    line1: line1.trim(),
    line2: line2.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
  };
}

async function reverseGeocodeWithExpo(
  latitude: number,
  longitude: number,
): Promise<LocationResult> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = results[0];
    if (place) {
      const streetNumber = place.streetNumber?.trim() ?? '';
      const route = place.street?.trim() ?? '';
      const sublocality = (place.district || place.subregion || '').trim();
      const city = (place.city || place.subregion || '').trim();
      const state = (place.region || '').trim();
      const pincode = (place.postalCode || '').trim();
      const name = (place.name || '').trim();
      const addressParts = [
        [streetNumber, route].filter(Boolean).join(' ') || name,
        sublocality,
        city,
        state,
        pincode,
      ]
        .map(part => part?.trim())
        .filter(Boolean);

      return {
        address: addressParts.join(', ') || 'Selected location',
        displayLabel: [sublocality || route || name, city].filter(Boolean).join(', '),
        streetNumber,
        route,
        sublocality,
        name,
        city,
        state,
        pincode,
        latitude,
        longitude,
        placeId: '',
      };
    }
  } catch {
    // ignore
  }

  const address = await reverseGeocode(latitude, longitude);
  return {
    address: looksLikeCoordinates(address) ? 'Selected location' : address,
    city: '',
    state: '',
    pincode: '',
    latitude,
    longitude,
    placeId: '',
  };
}

export async function reverseGeocodeToLocation(
  latitude: number,
  longitude: number,
): Promise<LocationResult> {
  const key = getGoogleMapsApiKey();
  if (!key) {
    return reverseGeocodeWithExpo(latitude, longitude);
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
      status?: string;
      results?: Array<{
        formatted_address: string;
        place_id: string;
        geometry: { location: { lat: number; lng: number } };
        address_components: AddressComponent[];
      }>;
    };

    const result = data.results?.[0];
    if (!result || data.status !== 'OK') {
      return reverseGeocodeWithExpo(latitude, longitude);
    }

    return parseLocationResult(
      result.place_id,
      result.formatted_address,
      result.geometry.location.lat,
      result.geometry.location.lng,
      result.address_components,
    );
  } catch {
    return reverseGeocodeWithExpo(latitude, longitude);
  }
}
