import QRCode from 'qrcode';

import { env } from '../config/env';

export async function generateVehicleQrCode(vehicleId: string): Promise<string> {
  const payload = `${env.APP_BASE_URL}/api/v1/vehicles/${vehicleId}/verify`;
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  });
}
