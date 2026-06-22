import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

import { buttonVariants } from '@race/ui';
import { cn } from '@race/utils';

export function WelcomeBanner({ name }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="relative mb-5 overflow-hidden rounded-card border border-border bg-gradient-to-r from-[#1A1A2E] via-[#2D2D44] to-[#1A1A2E] p-5 text-white shadow-card sm:p-6">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-primary/10 blur-xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            Executive Dashboard
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">
            {greeting}, {name?.split(' ')[0] ?? 'Admin'} 👋
          </h2>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Platform overview — revenue, bookings, and operations at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/reports"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'border-white/20 bg-white/10 text-white hover:bg-white/20',
            )}
          >
            View Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/bookings" className={buttonVariants({ size: 'sm' })}>
            Manage Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AlertsPanel() {
  const alerts = [
    { id: '1', message: '18 vendor approvals pending review', href: '/vendors', urgent: true },
    { id: '2', message: '26 driver verifications awaiting action', href: '/drivers', urgent: true },
    { id: '3', message: '87 subscriptions expiring this month', href: '/subscriptions', urgent: false },
  ];

  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-heading">Alerts & Tasks</h3>
        <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">
          {alerts.filter((a) => a.urgent).length} urgent
        </span>
      </div>
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link
              to={alert.href}
              className="flex items-start gap-2.5 rounded-lg p-2.5 transition hover:bg-[#FAFAFA]"
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${alert.urgent ? 'text-warning' : 'text-muted'}`}
              />
              <span className="text-sm text-body">{alert.message}</span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
