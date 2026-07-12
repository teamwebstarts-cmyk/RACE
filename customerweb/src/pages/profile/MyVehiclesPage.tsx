import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useVehicleStore } from '../../store/vehicleStore';

export function MyVehiclesPage() {
  const navigate = useNavigate();
  const vehicles = useVehicleStore((s) => s.vehicles);
  const isLoading = useVehicleStore((s) => s.isLoading);
  const fetchVehicles = useVehicleStore((s) => s.fetchVehicles);

  useEffect(() => {
    void fetchVehicles().catch(() => undefined);
  }, [fetchVehicles]);

  return (
    <PageShell>
      <ScreenHeader
        title="My vehicles"
        right={
          <Button onClick={() => navigate('/app/profile/vehicles/add')}>Add</Button>
        }
      />
      {isLoading ? <div className="spinner" /> : null}
      {!isLoading && vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description="Add your car or bike to speed up bookings and SOS."
          action={
            <Button onClick={() => navigate('/app/profile/vehicles/add')}>Add vehicle</Button>
          }
        />
      ) : null}
      <div className="bookings-grid">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            type="button"
            className="list-row"
            onClick={() => navigate(`/app/profile/vehicles/${vehicle.id}`)}
          >
            <div className="meta">
              <strong>
                {vehicle.brand} {vehicle.model}
              </strong>
              <span>
                {vehicle.vehicleNumber} · {vehicle.vehicleType} · {vehicle.fuelType}
              </span>
            </div>
            <span className="chip">QR</span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
