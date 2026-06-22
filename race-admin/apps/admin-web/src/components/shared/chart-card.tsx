import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@race/ui';
import { cn } from '@race/utils';

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
  height = 300,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  height?: number;
}) {
  return (
    <Card className={cn('h-full overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-[15px]">{title}</CardTitle>
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn('pt-4', contentClassName)} style={{ height }}>
        {children}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}
