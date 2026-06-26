import QRCode from 'qrcode';

import { env } from '../../config/env';

export function getVehicleQrPayload(vehicleId: string): string {
  return `${env.APP_BASE_URL}/api/v1/qr/${vehicleId}`;
}

export async function generateVehicleQrCode(vehicleId: string): Promise<string> {
  const payload = getVehicleQrPayload(vehicleId);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  });
}
