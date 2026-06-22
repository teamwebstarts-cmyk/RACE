import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Car, ClipboardList, Search, Users, X } from 'lucide-react';

import { NAV_ITEMS } from '@race/constants';
import { cn } from '@race/utils';

const QUICK_LINKS = [
  { label: 'Customers', href: '/customers', icon: Users, keywords: 'users people' },
  { label: 'Vendors', href: '/vendors', icon: Building2, keywords: 'business partners' },
  { label: 'Drivers', href: '/drivers', icon: Car, keywords: 'fleet' },
  { label: 'Bookings', href: '/bookings', icon: ClipboardList, keywords: 'orders trips' },
  ...NAV_ITEMS.map((item) => ({
    label: item.label,
    href: item.href,
    icon: ClipboardList,
    keywords: item.label.toLowerCase(),
  })),
];

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_LINKS.slice(0, 6);
    return QUICK_LINKS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.includes(q) ||
        item.keywords.includes(q),
    ).slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-white shadow-card-hover">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, customers, bookings..."
            className="h-12 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted hover:bg-[#F4F5F7]"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.length ? (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <li key={`${item.href}-${item.label}`}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(item.href);
                      onOpenChange(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#F4F5F7]',
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted" />
                    <span className="font-medium text-heading">{item.label}</span>
                    <span className="ml-auto text-xs text-muted">{item.href}</span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-8 text-center text-sm text-muted">No results found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
