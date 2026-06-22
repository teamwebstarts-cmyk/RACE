import { Link, useLocation } from 'react-router-dom';import {
  BarChart3,
  Building2,
  Car,
  ClipboardList,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { NAV_ITEMS } from '@race/constants';
import { cn, hasPermission } from '@race/utils';

import { RaceLogo } from './race-logo';
import { useAuthStore } from '@/stores/auth.store';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  ClipboardList,
  IndianRupee,
  BarChart3,
  CreditCard,
  Shield,
  Settings,
};

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen w-sidebar flex-col border-r border-border bg-white',
        collapsed && 'w-[72px]',
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <RaceLogo width={collapsed ? 48 : 120} height={collapsed ? 40 : 48} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.filter((item) =>
            user ? hasPermission(user.permissions, item.permission) : true,
          ).map((item) => {
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#F5A623]/15 text-[#D97706]'
                      : 'text-[#555555] hover:bg-[#F4F5F7] hover:text-[#1A1A2E]',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-[#F5A623]')} />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs font-semibold text-[#1A1A2E]">Need Help?</p>
        <p className="mt-1 text-xs text-[#555555]">Contact support@raceservice.com</p>
      </div>
    </aside>
  );
}
