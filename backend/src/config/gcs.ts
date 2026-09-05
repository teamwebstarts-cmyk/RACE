import { env } from './env';

/**
 * Google Cloud Storage configuration (future-ready).
 * Wire @google-cloud/storage when file uploads are implemented.
 */
export const gcsConfig = {
  bucketName: env.GCS_BUCKET_NAME ?? '',
  projectId: env.GCS_PROJECT_ID ?? '',
  keyFile: env.GCS_KEY_FILE ?? '',
  isConfigured: Boolean(env.GCS_BUCKET_NAME && env.GCS_PROJECT_ID),
} as const;
