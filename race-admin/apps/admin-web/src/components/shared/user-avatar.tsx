import { Avatar } from '@race/ui';
import { cn } from '@race/utils';

export function UserAvatar({
  name,
  className,
  size = 'md',
}: {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    'bg-[#FEE2E2] text-[#DC2626]',
    'bg-[#DBEAFE] text-[#2563EB]',
    'bg-[#D1FAE5] text-[#16A34A]',
    'bg-[#FEF3C7] text-[#D97706]',
    'bg-[#EDE9FE] text-[#7C3AED]',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        colors[colorIndex],
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function VendorAvatar({
  name,
  className,
  size = 'lg',
}: {
  name: string;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClass =
    size === 'xl' ? 'h-20 w-20 text-2xl' : size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[#F5A623] font-bold text-white',
        sizeClass,
        className,
      )}
    >
      {initials}
    </div>
  );
}

export function ProfileAvatar({ name, src }: { name: string; src?: string }) {
  return <Avatar fallback={name.charAt(0)} alt={name} src={src} className="h-10 w-10" />;
}
