import { useQuery } from '@tanstack/react-query';

import { getAvailableDrivers } from '@race/api';
import { Card, CardContent, ErrorState, LoadingState } from '@race/ui';

import { PageHeader } from '@/components/layout/page-header';

export function AvailableDriversPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['available-drivers-page'],
    queryFn: () => getAvailableDrivers(),
  });

  if (isLoading) return <LoadingState message="Loading available drivers..." />;
  if (isError) return <ErrorState message="Failed to load available drivers" onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader
        title="Available Drivers"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Available Drivers' }]}
      />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Location</th>
                <th className="px-4 py-3">Active Booking</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((driver) => (
                <tr key={driver._id} className="border-t border-border">
                  <td className="px-4 py-3">{driver.fullName}</td>
                  <td className="px-4 py-3">{driver.mobileNumber}</td>
                  <td className="px-4 py-3">{driver.isAvailable ? 'Available' : 'Busy'}</td>
                  <td className="px-4 py-3">
                    {driver.currentLocation?.latitude !== undefined &&
                    driver.currentLocation?.longitude !== undefined
                      ? `${driver.currentLocation.latitude}, ${driver.currentLocation.longitude}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{driver.activeBookingId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
