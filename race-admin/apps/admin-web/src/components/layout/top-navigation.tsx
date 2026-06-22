import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';

import { getNotifications, getUnreadNotificationCount } from '@race/api';
import { Avatar } from '@race/ui';
import { cn, formatRelativeTime } from '@race/utils';

import { QuickActions } from './quick-actions';
import { SearchCommand } from './search-command';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStore } from '@/stores/dashboard.store';
import { useThemeStore } from '@/stores/theme.store';

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClose]);
}

export function TopNavigation() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const selectedDate = useDashboardStore((s) => s.selectedDate);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(userRef, () => setUserOpen(false));

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notification-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => getNotifications({ page: 1, pageSize: 5 }),
    enabled: notifOpen,
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b border-border bg-surface/95 px-4 shadow-header backdrop-blur-sm lg:px-6">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm text-muted transition hover:border-[#D1D5DB] hover:bg-white md:flex md:max-w-md lg:max-w-lg"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search customers, bookings, vendors...</span>
          <kbd className="ml-auto hidden rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium lg:inline">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <QuickActions />

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-heading"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-body transition hover:bg-[#F4F5F7] sm:flex"
          >
            <CalendarDays className="h-4 w-4 text-muted" />
            <span className="font-medium text-heading">{selectedDate}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>

          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-lg p-2 text-muted transition hover:bg-[#F4F5F7] hover:text-heading"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>

            {notifOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-card border border-border bg-white shadow-card-hover">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-heading">Notifications</p>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-medium text-primary-dark hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="max-h-72 overflow-y-auto">
                  {notifications?.items.length ? (
                    notifications.items.map((n) => (
                      <li key={n.id} className="border-b border-border px-4 py-3 last:border-0 hover:bg-[#FAFAFA]">
                        <p className="text-sm font-medium text-heading">{n.title}</p>
                        {n.message ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-body">{n.message}</p>
                        ) : null}
                        <p className="mt-1 text-[11px] text-muted">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 text-center text-sm text-muted">No notifications</li>
                  )}
                </ul>
              </div>
            ) : null}
          </div>

          <div ref={userRef} className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1 pr-2 transition hover:bg-[#F4F5F7]"
            >
              <Avatar
                fallback={user?.name?.charAt(0) ?? 'A'}
                alt={user?.name ?? 'Admin'}
                src={user?.avatarUrl}
              />
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-tight text-heading">
                  {user?.name ?? 'Admin User'}
                </p>
                <p className="text-[11px] text-muted">{user ? formatRole(user.role) : 'Super Admin'}</p>
              </div>
              <ChevronDown className={cn('hidden h-4 w-4 text-muted lg:block', userOpen && 'rotate-180')} />
            </button>

            {userOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-border bg-white py-1 shadow-card-hover">
                <Link
                  to="/profile"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:bg-[#F4F5F7]"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-body hover:bg-[#F4F5F7]"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setUserOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-[#FEF2F2]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

/** @deprecated Use TopNavigation */
export const Header = TopNavigation;
