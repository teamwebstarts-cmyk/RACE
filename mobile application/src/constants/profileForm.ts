export const EMERGENCY_RELATIONSHIP_OPTIONS = [
  'Father',
  'Mother',
  'Spouse',
  'Sibling',
  'Friend',
  'Other',
] as const;

export type EmergencyRelationshipOption = (typeof EMERGENCY_RELATIONSHIP_OPTIONS)[number];

export const FORM_PLACEHOLDER_COLOR = '#9CA3AF';
