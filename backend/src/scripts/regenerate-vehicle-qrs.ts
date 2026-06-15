import { connectDatabase, disconnectDatabase } from '../configs/database';
import { env } from '../configs/env';
import { vehicleService } from '../modules/vehicles/vehicle.service';

async function main(): Promise<void> {
  await connectDatabase();
  const count = await vehicleService.regenerateAllQrCodes();
  console.log(`Regenerated QR codes for ${count} vehicle(s) using ${env.APP_BASE_URL}`);
  await disconnectDatabase();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
