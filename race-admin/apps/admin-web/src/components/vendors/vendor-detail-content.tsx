import type { ColumnDef } from '@tanstack/react-table';
import {
  Car,
  ClipboardList,
  IndianRupee,
  Loader2,
  MapPin,
  MoreVertical,
  Phone,
  Star,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type {
  VendorAssignedDriver,
  VendorBookingRow,
  VendorDetail,
  VendorDocument,
  VendorVehicle,
} from '@race/types';
import { Permission } from '@race/types';
import { formatCurrency, formatDate } from '@race/utils';
import {
  Button,
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
import { VendorAvatar } from '@/components/shared/user-avatar';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useVendorActions, useVendorDetail } from '@/hooks/use-vendor-detail';
import { useAuthStore } from '@/stores/auth.store';

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  ClipboardList,
  IndianRupee,
  Star,
  Car,
};

function VendorProfileCard({
  vendor,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  vendor: VendorDetail;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-[#1A1A2E] via-[#2D2D44] to-primary/30" />
      <CardContent className="relative px-6 pb-6 pt-0">
        <div className="-mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-5">
            <VendorAvatar name={vendor.businessName} size="xl" className="ring-4 ring-white" />
            <div className="pt-12 lg:pt-10">
              <h2 className="text-xl font-bold text-heading">{vendor.businessName}</h2>
              <p className="mt-1 text-sm text-body">{vendor.ownerName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={vendor.status} />
                <StatusBadge status={vendor.verificationStatus} />
              </div>
            </div>
          </div>

          {vendor.status === 'PENDING' ? (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                className="border-error/30 text-error hover:bg-[#FEF2F2]"
                onClick={onReject}
                disabled={isRejecting || isApproving}
              >
                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reject
              </Button>
              <Button onClick={onApprove} disabled={isApproving || isRejecting}>
                {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Approve
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 text-sm text-body sm:col-span-2">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted" />
              {vendor.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted" />
              {vendor.phone} · {vendor.email}
            </p>
            <p>Joined {formatDate(vendor.joinedAt)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-heading">{vendor.rating}</span>
            <span className="text-sm text-muted">({vendor.reviewCount} reviews)</span>
          </div>
          <div>
            <span className="font-semibold text-heading">{vendor.totalBookings}</span>
            <span className="text-sm text-muted"> Bookings served</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStats({ stats }: { stats: VendorDetail['quickStats'] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = STAT_ICONS[stat.icon] ?? Truck;
        return (
          <Card key={stat.id}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F5A623]/15">
                <Icon className="h-5 w-5 text-[#F5A623]" />
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">{stat.label}</p>
                <p className="text-lg font-bold text-[#1A1A2E]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const vehicleColumns: ColumnDef<VendorVehicle, unknown>[] = [
  { accessorKey: 'registrationNo', header: 'Vehicle No.' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'model', header: 'Model' },
  { accessorKey: 'year', header: 'Year' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <button type="button" className="rounded-md p-1 hover:bg-[#F4F5F7]" aria-label="Actions">
        <MoreVertical className="h-4 w-4 text-[#9CA3AF]" />
      </button>
    ),
  },
];

const bookingColumns: ColumnDef<VendorBookingRow, unknown>[] = [
  {
    accessorKey: 'bookingNumber',
    header: 'Booking ID',
    cell: ({ row }) => (
      <span className="font-medium text-[#F5A623]">#{row.original.bookingNumber}</span>
    ),
  },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'driverName', header: 'Driver' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: 'date', header: 'Date' },
];

function VendorInfoCard({ vendor }: { vendor: VendorDetail }) {
  const fields = [
    { label: 'Business Type', value: vendor.businessType },
    { label: 'GST Number', value: vendor.gstNumber },
    { label: 'PAN Number', value: vendor.panNumber },
    { label: 'Bank Name', value: vendor.bankName },
    { label: 'Account Number', value: vendor.accountNumber },
    { label: 'IFSC Code', value: vendor.ifscCode },
    { label: 'Service Areas', value: vendor.serviceAreas.join(', ') },
    { label: 'Working Hours', value: vendor.workingHours },
    { label: 'Fleet Size', value: String(vendor.fleetSize) },
    { label: 'Drivers Assigned', value: String(vendor.driverCount) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between gap-4 border-b border-[#F4F5F7] pb-3 last:border-0">
              <dt className="text-sm text-[#9CA3AF]">{f.label}</dt>
              <dd className="text-right text-sm font-medium text-[#1A1A2E]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function DocumentsCard({
  documents,
  onView,
}: {
  documents: VendorDocument[];
  onView: (doc: VendorDocument) => void;
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

function AssignedDriversCard({ drivers }: { drivers: VendorAssignedDriver[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assigned Drivers</CardTitle>
        <button type="button" className="text-sm font-medium text-[#F5A623] hover:underline">
          Manage
        </button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {drivers.map((driver) => (
            <li key={driver.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-semibold text-[#2563EB]">
                  {driver.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">{driver.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{driver.phone}</p>
                </div>
              </div>
              <StatusBadge status={driver.status} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function VendorDetailContent({ vendorId }: { vendorId: string }) {
  const user = useAuthStore((s) => s.user);
  const { data: vendor, isLoading, isError, refetch } = useVendorDetail(vendorId);
  const { approve, reject } = useVendorActions(vendorId);
  const [viewingDoc, setViewingDoc] = useState<VendorDocument | null>(null);

  if (isLoading) return <LoadingState message="Loading vendor..." />;
  if (isError || !vendor) {
    return <ErrorState message="Vendor not found" onRetry={() => void refetch()} />;
  }

  return (
    <PermissionGuard permission={Permission.VENDORS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Vendor Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Vendor Management', href: '/vendors' },
          { label: vendor.businessName },
        ]}
        actions={
          <Link
            to="/vendors"
            className="text-sm font-medium text-[#F5A623] hover:underline"
          >
            ← Back to Vendors
          </Link>
        }
      />

      <div className="space-y-6">
        <VendorProfileCard
          vendor={vendor}
          onApprove={() => approve.mutate()}
          onReject={() => reject.mutate()}
          isApproving={approve.isPending}
          isRejecting={reject.isPending}
        />

        <QuickStats stats={vendor.quickStats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vehicles Owned</CardTitle>
                <Button size="sm">+ Add Vehicle</Button>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <DataTable
                  columns={vehicleColumns}
                  data={vendor.vehicles}
                  emptyMessage="No vehicles"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <button type="button" className="text-sm font-medium text-[#F5A623] hover:underline">
                  View All
                </button>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <DataTable
                  columns={bookingColumns}
                  data={vendor.recentBookings}
                  emptyMessage="No bookings"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <VendorInfoCard vendor={vendor} />
            <DocumentsCard documents={vendor.documents} onView={setViewingDoc} />
            <AssignedDriversCard drivers={vendor.assignedDrivers} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={vendor.activities} />
          </CardContent>
        </Card>
      </div>

      <DocumentViewer
        open={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </PermissionGuard>
  );
}
