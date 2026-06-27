import { cn } from '@race/utils';

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn('animate-pulse rounded-card bg-[#EAEAEA]/60', className)} style={style} />;
}
