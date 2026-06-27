import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { buttonVariants } from '@race/ui';
import { cn } from '@race/utils';

export function QuickActions() {
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <Link to="/bookings" className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-1.5')}>
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">New Booking</span>
      </Link>
    </div>
  );
}
