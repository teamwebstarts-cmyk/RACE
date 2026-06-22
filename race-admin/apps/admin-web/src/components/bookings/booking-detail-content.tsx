import { Link } from 'react-router-dom';

import type { BookingDetail } from '@race/types';
import { Permission } from '@race/types';
import { formatCurrency, formatDateTime } from '@race/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@race/ui';

import { BookingTimeline } from '@/components/shared/booking-timeline';
import { LocationMap } from '@/components/shared/location-map';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageHeader } from '@/components/layout/page-header';
import { useBookingDetail } from '@/hooks/use-booking-detail';
import { useAuthStore } from '@/stores/auth.store';

function SummaryCard({ booking }: { booking: BookingDetail }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-[#9CA3AF]">Booking ID</p>
            <h2 className="text-2xl font-bold text-[#F5A623]">{booking.bookingNumber}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge status={booking.status} />
              <span className="text-sm text-[#555555]">{booking.service}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#9CA3AF]">Amount</p>
            <p className="text-2xl font-bold text-[#1A1A2E]">{formatCurrency(booking.amount)}</p>
            <p className="mt-1 text-sm text-[#555555]">{formatDateTime(booking.date)}</p>
          </div>
        </div>
        {booking.notes ? (
          <p className="mt-4 rounded-lg bg-[#F4F5F7] p-3 text-sm text-[#555555]">{booking.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EntityCard({
  title,
  name,
  phone,
  email,
  linkTo,
}: {
  title: string;
  name: string;
  phone: string;
  email?: string;
  linkTo?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-[#9CA3AF]">Name</dt>
            <dd className="text-sm font-medium text-[#1A1A2E]">
              {linkTo ? (
                <Link to={linkTo} className="text-[#F5A623] hover:underline">
                  {name}
                </Link>
              ) : (
                name
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#9CA3AF]">Phone</dt>
            <dd className="text-sm font-medium text-[#1A1A2E]">{phone}</dd>
          </div>
          {email ? (
            <div>
              <dt className="text-xs text-[#9CA3AF]">Email</dt>
              <dd className="text-sm font-medium text-[#1A1A2E]">{email}</dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function PaymentCard({ booking }: { booking: BookingDetail }) {
  const p = booking.payment;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Amount', value: formatCurrency(p.amount) },
            { label: 'Method', value: p.method },
            { label: 'Status', value: <StatusBadge status={p.status} /> },
            { label: 'Transaction ID', value: p.transactionId },
            {
              label: 'Paid At',
              value: p.paidAt ? formatDateTime(p.paidAt) : '—',
            },
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

export function BookingDetailContent({ bookingId }: { bookingId: string }) {
  const user = useAuthStore((s) => s.user);
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(bookingId);

  if (isLoading) return <LoadingState message="Loading booking..." />;
  if (isError || !booking) {
    return <ErrorState message="Booking not found" onRetry={() => void refetch()} />;
  }

  return (
    <PermissionGuard permission={Permission.BOOKINGS_VIEW} permissions={user?.permissions}>
      <PageHeader
        title="Booking Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Bookings', href: '/bookings' },
          { label: booking.bookingNumber },
        ]}
        actions={
          <Link to="/bookings" className="text-sm font-medium text-[#F5A623] hover:underline">
            ← Back to Bookings
          </Link>
        }
      />

      <div className="space-y-6">
        <SummaryCard booking={booking} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <EntityCard
            title="Customer Details"
            name={booking.customerName}
            phone={booking.customerPhone}
            email={booking.customerEmail}
            linkTo={`/customers/${booking.customerId}`}
          />
          <EntityCard
            title="Vendor Details"
            name={booking.vendorName}
            phone={booking.vendorPhone}
            linkTo={`/vendors/${booking.vendorId}`}
          />
          <EntityCard
            title="Driver Details"
            name={booking.driverName ?? 'Not assigned'}
            phone={booking.driverPhone ?? '—'}
            linkTo={booking.driverId ? `/drivers/${booking.driverId}` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LocationMap location={booking.location} />
          <PaymentCard booking={booking} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTimeline events={booking.timeline} />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
