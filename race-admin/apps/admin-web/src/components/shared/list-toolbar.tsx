import { Download, Plus, Search } from 'lucide-react';

import { Button, Select } from '@race/ui';

export interface FilterOption {
  label: string;
  value: string;
}

export interface ListFilter {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onExport,
  exportLabel = 'Export',
  onAdd,
  addLabel = 'Add',
  showAdd = true,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ListFilter[];
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onExport?: () => void;
  exportLabel?: string;
  onAdd?: () => void;
  addLabel?: string;
  showAdd?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex h-9 w-full rounded-lg border border-border bg-[#FAFAFA] pl-10 pr-4 text-sm text-heading placeholder:text-muted focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <label htmlFor={filter.id} className="sr-only">
                {filter.label}
              </label>
              <Select
                id={filter.id}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="h-10 min-w-[130px] rounded-lg"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
          {onDateFromChange ? (
            <label className="flex items-center gap-2 text-sm text-body">
              <span className="whitespace-nowrap">From</span>
              <input
                type="date"
                value={dateFrom ?? ''}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
              />
            </label>
          ) : null}
          {onDateToChange ? (
            <label className="flex items-center gap-2 text-sm text-body">
              <span className="whitespace-nowrap">To</span>
              <input
                type="date"
                value={dateTo ?? ''}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
              />
            </label>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onExport ? (
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            {exportLabel}
          </Button>
        ) : null}
        {showAdd && onAdd ? (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
