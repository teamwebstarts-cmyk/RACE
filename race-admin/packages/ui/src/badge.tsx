import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@race/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary/10 text-primary-dark',
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/20 bg-warning/10 text-warning',
        error: 'border-error/20 bg-error/10 text-error',
        info: 'border-info/20 bg-info/10 text-info',
        purple: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300',
        outline: 'border-border text-body',
        neutral: 'border-transparent bg-surface-hover text-body',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let variant: VariantProps<typeof badgeVariants>['variant'] = 'neutral';

  if (['COMPLETED', 'APPROVED', 'PAID', 'ACTIVE', 'VERIFIED'].includes(normalized)) variant = 'success';
  else if (['PENDING', 'PAYMENT_PENDING', 'ON_LEAVE', 'UNDER_MAINTENANCE', 'CREATED'].includes(normalized))
    variant = 'warning';
  else if (['ASSIGNED'].includes(normalized)) variant = 'purple';
  else if (['EN_ROUTE', 'IN_PROGRESS', 'SERVICE_STARTED'].includes(normalized)) variant = 'info';
  else if (['CANCELLED', 'REJECTED', 'FAILED', 'SUSPENDED'].includes(normalized)) variant = 'error';

  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
}
