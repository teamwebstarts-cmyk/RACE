export interface LocationResult {
  address: string;
  /** Short human-friendly label for booking UI */
  displayLabel?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}
