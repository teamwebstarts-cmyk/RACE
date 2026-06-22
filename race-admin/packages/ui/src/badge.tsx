import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@race/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#F5A623]/15 text-[#D97706]',
        success: 'border-transparent bg-[#16A34A]/15 text-[#16A34A]',
        warning: 'border-transparent bg-[#D97706]/15 text-[#D97706]',
        error: 'border-transparent bg-[#DC2626]/15 text-[#DC2626]',
        info: 'border-transparent bg-[#2563EB]/15 text-[#2563EB]',
        outline: 'border-[#EEEEEE] text-[#555555]',
        neutral: 'border-transparent bg-[#F4F5F7] text-[#555555]',
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

  if (['COMPLETED', 'APPROVED', 'PAID', 'ACTIVE'].includes(normalized)) variant = 'success';
  else if (['PENDING', 'ASSIGNED', 'EN_ROUTE', 'PAYMENT_PENDING'].includes(normalized)) variant = 'warning';
  else if (['CANCELLED', 'REJECTED', 'FAILED'].includes(normalized)) variant = 'error';
  else if (['IN_PROGRESS', 'SERVICE_STARTED'].includes(normalized)) variant = 'info';

  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
}
