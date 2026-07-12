export interface LocationResult {
  address: string;
  /** Short human-friendly label for booking UI */
  displayLabel?: string;
  /** Structured parts for form fill (house / street / area) */
  streetNumber?: string;
  route?: string;
  sublocality?: string;
  name?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}
