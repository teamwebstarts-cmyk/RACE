export interface VehicleEmergencyPageData {
  vehicleNumber: string;
  brand: string;
  model: string;
  vehicleType: string;
  fuelType: string;
  color?: string;
  ownerName?: string;
  ownerMobile?: string;
  emergencyName?: string;
  emergencyMobile?: string;
  emergencyRelationship?: string;
}

export function renderVehicleEmergencyPage(data: VehicleEmergencyPageData): string {
  const rows = [
    ['Registration', data.vehicleNumber],
    ['Vehicle', `${data.brand} ${data.model}`],
    ['Type', data.vehicleType],
    ['Fuel', data.fuelType],
    ...(data.color ? [['Color', data.color] as const] : []),
    ...(data.ownerName ? [['Owner', data.ownerName] as const] : []),
  ]
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(String(value))}</td></tr>`,
    )
    .join('');

  const ownerTel = data.ownerMobile ? `tel:+91${data.ownerMobile.replace(/\D/g, '')}` : '';
  const emergencyTel = data.emergencyMobile
    ? `tel:+91${data.emergencyMobile.replace(/\D/g, '')}`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RACE Emergency — ${escapeHtml(data.vehicleNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #0B0B0B;
      color: #FFFFFF;
      padding: 20px;
    }
    .wrap { max-width: 440px; margin: 0 auto; }
    .badge {
      display: inline-block;
      background: #E53935;
      color: #fff;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 8px 12px;
      border-radius: 999px;
      margin-bottom: 14px;
    }
    .card {
      background: #1A1A1A;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 22px 18px;
      margin-bottom: 16px;
    }
    h1 { margin: 0 0 6px; font-size: 26px; color: #FFC107; }
    p { margin: 0 0 16px; color: #B0B0B0; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 15px;
      text-align: left;
    }
    th { color: #B0B0B0; width: 42%; font-weight: 500; text-transform: capitalize; }
    td { color: #fff; font-weight: 700; text-transform: uppercase; }
    .actions { display: grid; gap: 12px; margin-top: 18px; }
    .btn {
      display: block;
      width: 100%;
      text-align: center;
      text-decoration: none;
      font-weight: 800;
      font-size: 16px;
      padding: 16px 18px;
      border-radius: 20px;
      border: none;
    }
    .btn-primary { background: #E53935; color: #fff; }
    .btn-secondary { background: #FFC107; color: #0B0B0B; }
    .btn-outline {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.18);
    }
    .footer { margin-top: 16px; font-size: 12px; color: #707070; text-align: center; }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="badge">Emergency QR</div>
    <section class="card">
      <h1>RACE Vehicle</h1>
      <p>Roadside assistance & emergency contact for this vehicle.</p>
      <table>${rows}</table>
    </section>
    <section class="actions">
      ${
        ownerTel
          ? `<a class="btn btn-primary" href="${ownerTel}">Contact Owner</a>`
          : ''
      }
      ${
        emergencyTel
          ? `<a class="btn btn-secondary" href="${emergencyTel}">Contact Emergency${data.emergencyName ? ` (${escapeHtml(data.emergencyName)})` : ''}</a>`
          : ''
      }
      <a class="btn btn-outline" href="tel:18001234567">Request Towing</a>
    </section>
    <p class="footer">RACE Roadside Assistance Platform</p>
  </main>
</body>
</html>`;
}

export function renderVehicleNotFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RACE — Vehicle Not Found</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      background: #0B0B0B;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      background: #1A1A1A;
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
    }
    h1 { color: #E53935; margin-top: 0; }
    p { color: #B0B0B0; line-height: 1.5; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Vehicle not found</h1>
    <p>This QR code is invalid or the vehicle was removed from RACE.</p>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
