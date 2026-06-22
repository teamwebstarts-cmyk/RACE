import { Bell, CalendarDays, Menu } from 'lucide-react';

import { Avatar, Button } from '@race/ui';

import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStore } from '@/stores/dashboard.store';

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const selectedDate = useDashboardStore((s) => s.selectedDate);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-[#555555]"
        >
          <CalendarDays className="h-4 w-4" />
          <span>{selectedDate}</span>
        </button>

        <button type="button" className="relative rounded-md p-2 hover:bg-[#F4F5F7]" aria-label="Notifications">
          <Bell className="h-5 w-5 text-[#555555]" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <Avatar fallback={user?.name?.charAt(0) ?? 'A'} alt={user?.name ?? 'Admin'} src={user?.avatarUrl} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#1A1A2E]">{user?.name ?? 'Admin User'}</p>
            <p className="text-xs text-[#555555]">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
