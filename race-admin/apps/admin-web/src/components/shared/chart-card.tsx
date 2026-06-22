import { Card, CardContent, CardHeader, CardTitle } from '@race/ui';

export function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="h-[280px]">{children}</CardContent>
    </Card>
  );
}
