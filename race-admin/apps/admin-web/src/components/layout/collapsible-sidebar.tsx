import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Car,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  Headphones,
  IndianRupee,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { NAV_ITEMS, NAV_SECTIONS } from '@race/constants';
import { cn, hasPermission } from '@race/utils';

import { RaceLogo } from './race-logo';
import { useAuthStore } from '@/stores/auth.store';
import { useLayoutStore } from '@/stores/layout.store';

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

export function CollapsibleSidebar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? hasPermission(user.permissions, item.permission) : true,
  );

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: visibleItems.filter((item) =>
      (section.hrefs as readonly string[]).includes(item.href),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen w-full flex-col border-r border-border bg-surface',
      )}
    >
      <div
        className={cn(
          'relative flex shrink-0 items-center border-b border-border bg-gradient-to-br from-white via-white to-[#FFF8EB]',
          collapsed ? 'h-[72px]' : 'h-[88px]',
        )}
      >
        <Link
          to="/dashboard"
          className={cn(
            'flex min-w-0 flex-1 items-center overflow-hidden',
            collapsed ? 'justify-center px-2' : 'items-center px-4 py-2.5 pr-10',
          )}
          aria-label="RACE Service home"
        >
          <RaceLogo layout={collapsed ? 'sidebar-icon' : 'sidebar'} />
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-muted shadow-sm transition hover:bg-[#F4F5F7] hover:text-heading"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="race-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {section.label}
              </p>
            ) : (
              <div className="mb-2 h-px bg-border" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all',
                        collapsed && 'justify-center px-2',
                        active
                          ? 'race-nav-active'
                          : 'text-body hover:bg-[#F4F5F7] hover:text-heading',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          active ? 'text-primary' : 'text-muted group-hover:text-heading',
                        )}
                      />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 border-t border-border p-3', collapsed && 'px-2')}>
        {!collapsed ? (
          <div className="rounded-lg bg-[#F4F5F7]/80 p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Headphones className="h-4 w-4 text-primary-dark" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-heading">Need help?</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-body">
                  Contact{' '}
                  <a href="mailto:support@raceservice.com" className="text-primary-dark hover:underline">
                    support@raceservice.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

/** @deprecated Use CollapsibleSidebar */
export const Sidebar = CollapsibleSidebar;
