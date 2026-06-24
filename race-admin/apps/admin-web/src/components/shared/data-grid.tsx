import { memo, useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react';

import { Button, EmptyState } from '@race/ui';
import { cn, exportToCsv } from '@race/utils';

import { Pagination } from './pagination';

export interface DataGridProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  enableSorting?: boolean;
  enableSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  exportFileName?: string;
  stickyHeader?: boolean;
  toolbar?: React.ReactNode;
}

function DataGridInner<TData>({
  columns,
  data,
  emptyMessage = 'No records found',
  onRowClick,
  getRowId,
  enableSorting = true,
  enableSelection = false,
  enablePagination = false,
  pageSize = 10,
  exportFileName = 'export',
  stickyHeader = true,
  toolbar,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns = useMemo(() => {
    if (!enableSelection) return columns;
    const selectCol: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-border"
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-border"
          aria-label="Select row"
        />
      ),
      size: 40,
    };
    return [selectCol, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    initialState: enablePagination ? { pagination: { pageSize } } : undefined,
  });

  const selectedCount = Object.keys(rowSelection).length;

  if (!data.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div>
      {(toolbar || enableSelection) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          {toolbar}
          {enableSelection && selectedCount > 0 ? (
            <span className="text-sm text-body">{selectedCount} selected</span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => {
              const rows = table.getFilteredRowModel().rows.map((r) => r.original);
              if (!rows.length) return;
              const keys = Object.keys(rows[0] as object);
              exportToCsv(
                `${exportFileName}.csv`,
                rows as object[],
                keys.map((k) => ({ key: k as keyof object, header: k })),
              );
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-white')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border text-muted">
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={cn(
                            'inline-flex items-center gap-1',
                            canSort && 'cursor-pointer hover:text-heading',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort ? (
                            sorted === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )
                          ) : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-border/80 transition-colors last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-[#FAFAFA]',
                  row.getIsSelected() && 'bg-primary/5',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-heading"
                    onClick={
                      cell.column.id === 'actions'
                        ? (event) => event.stopPropagation()
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enablePagination && table.getPageCount() > 1 ? (
        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(p) => table.setPageIndex(p - 1)}
            total={table.getFilteredRowModel().rows.length}
            pageSize={pageSize}
          />
        </div>
      ) : null}
    </div>
  );
}

export const DataGrid = memo(DataGridInner) as typeof DataGridInner;

/** Backward-compatible alias */
export { DataGrid as DataTable };
