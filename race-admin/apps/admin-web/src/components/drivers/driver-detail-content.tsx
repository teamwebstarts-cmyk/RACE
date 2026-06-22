import type { ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type {
  CustomerBookingHistoryItem,
  DriverDetail,
  DriverDocument,
  DriverReview,
} from '@race/types';
import { Permission } from '@race/types';
import { formatCurrency, formatDate } from '@race/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@race/ui';

import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { DataTable } from '@/components/shared/data-table';
import { DocumentViewer } from '@/components/shared/document-viewer';
import { UserAvatar } from '@/components/shared/user-avatar';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useDriverDetail } from '@/hooks/use-driver-detail';
import { useAuthStore } from '@/stores/auth.store';

function DriverProfileCard({ driver }: { driver: DriverDetail }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <UserAvatar name={driver.name} size="lg" className="h-16 w-16 text-lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-[#1A1A2E]">{driver.name}</h2>
            <StatusBadge status={driver.status} />
          </div>
          <p className="mt-1 text-sm text-[#555555]">{driver.driverType}</p>
          <div className="mt-3 grid gap-2 text-sm text-[#555555] sm:grid-cols-2 lg:grid-cols-4">
            <p>{driver.phone}</p>
            <p>{driver.email}</p>
            <p>
              <Link to={`/vendors/${driver.vendorId}`} className="text-[#F5A623] hover:underline">
                {driver.vendorName}
              </Link>
            </p>
            <p>{driver.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-center">
          <Star className="h-5 w-5 fill-[#F5A623] text-[#F5A623]" />
          <div>
            <p className="text-2xl font-bold text-[#1A1A2E]">{driver.rating}</p>
            <p className="text-xs text-[#9CA3AF]">{driver.reviewCount} reviews</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LicenseDetailsCard({ driver }: { driver: DriverDetail }) {
  const fields = [
    { label: 'License Number', value: driver.licenseNo },
    { label: 'License Class', value: driver.licenseClass },
    { label: 'Expiry Date', value: formatDate(driver.licenseExpiry) },
    { label: 'Aadhaar', value: driver.aadhaarMasked },
    { label: 'Address', value: driver.address },
    { label: 'Joined', value: formatDate(driver.joinedAt) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>License Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                {f.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1A1A2E]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function AssignedVehicleCard({ driver }: { driver: DriverDetail }) {
  const v = driver.assignedVehicle;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Registration', value: v.registrationNo },
            { label: 'Type', value: v.type },
            { label: 'Model', value: v.model },
            { label: 'Year', value: String(v.year) },
            { label: 'Status', value: <StatusBadge status={v.status} /> },
          ].map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                {f.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1A1A2E]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

const bookingColumns: ColumnDef<CustomerBookingHistoryItem, unknown>[] = [
  {
    accessorKey: 'bookingNumber',
    header: 'Booking ID',
    cell: ({ row }) => (
      <span className="font-medium text-[#F5A623]">#{row.original.bookingNumber}</span>
    ),
  },
  { accessorKey: 'service', header: 'Service' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.date),
  },
];

function ReviewsSection({ reviews }: { reviews: DriverReview[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-[#F4F5F7] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-[#1A1A2E]">{review.customerName}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#F5A623]">
                  <Star className="h-3.5 w-3.5 fill-[#F5A623]" />
                  {review.rating}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#555555]">{review.comment}</p>
              <p className="mt-2 text-xs text-[#9CA3AF]">{formatDate(review.date)}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DocumentsSection({
  documents,
  onView,
}: {
  documents: DriverDocument[];
  onView: (doc: DriverDocument) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#F4F5F7] px-3 py-2.5"
            >
              <span className="text-sm font-medium text-[#1A1A2E]">{doc.name}</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={doc.status} />
                <button
                  type="button"
                  onClick={() => onView(doc)}
                  className="text-sm font-medium text-[#F5A623] hover:underline"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function DriverDetailContent({ driverId }: { driverId: string }) {
  const user = useAuthStore((s) => s.user);
  const { data: driver, isLoading, isError, refetch } = useDriverDetail(driverId);
  const [viewingDoc, setViewingDoc] = useState<DriverDocument | null>(null);

  if (isLoading) return <LoadingState message="Loading driver..." />;
  if (isError || !driver) {
    return <ErrorState message="Driver not found" onRetry={() => void refetch()} />;
  }

  return (
    <PermissionGuard permission={Permission.DRIVERS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Driver Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Drivers', href: '/drivers' },
          { label: driver.name },
        ]}
        actions={
          <Link to="/drivers" className="text-sm font-medium text-[#F5A623] hover:underline">
            ← Back to Drivers
          </Link>
        }
      />

      <div className="space-y-6">
        <DriverProfileCard driver={driver} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LicenseDetailsCard driver={driver} />
          <AssignedVehicleCard driver={driver} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <DataTable columns={bookingColumns} data={driver.bookings} emptyMessage="No bookings" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReviewsSection reviews={driver.reviews} />
          <DocumentsSection documents={driver.documents} onView={setViewingDoc} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={driver.activities} />
          </CardContent>
        </Card>
      </div>

      <DocumentViewer open={Boolean(viewingDoc)} onClose={() => setViewingDoc(null)} document={viewingDoc} />
    </PermissionGuard>
  );
}
