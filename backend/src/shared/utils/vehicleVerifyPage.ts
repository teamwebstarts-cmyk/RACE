export interface VehicleVerifyPageData {
  vehicleNumber: string;
  brand: string;
  model: string;
  vehicleType: string;
  fuelType: string;
  color?: string;
}

export function renderVehicleVerifyPage(data: VehicleVerifyPageData): string {
  const details = [
    ['Registration', data.vehicleNumber],
    ['Vehicle', `${data.brand} ${data.model}`],
    ['Type', data.vehicleType],
    ['Fuel', data.fuelType],
    ...(data.color ? [['Color', data.color] as const] : []),
  ];

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><th>${label}</th><td>${escapeHtml(String(value))}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RACE — Vehicle Verified</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 420px;
      background: #1e293b;
      border: 1px solid rgba(255, 195, 38, 0.35);
      border-radius: 16px;
      padding: 28px 24px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: #16a34a;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 8px 14px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      color: #ffc326;
    }
    p {
      margin: 0 0 20px;
      color: #94a3b8;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      margin-top: 8px;
    }
    th, td {
      padding: 10px 0;
      border-bottom: 1px solid #334155;
      font-size: 15px;
    }
    th {
      color: #94a3b8;
      font-weight: 500;
      width: 42%;
      text-transform: capitalize;
    }
    td {
      color: #f8fafc;
      font-weight: 600;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="badge">Verified</div>
    <h1>RACE Vehicle</h1>
    <p>This vehicle is registered on the RACE roadside assistance platform.</p>
    <table>${rows}</table>
    <p class="footer">For vendor / technician verification only.</p>
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
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      background: #1e293b;
      border-radius: 16px;
      padding: 28px 24px;
      text-align: center;
    }
    h1 { color: #f87171; margin-top: 0; }
    p { color: #94a3b8; line-height: 1.5; }
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
