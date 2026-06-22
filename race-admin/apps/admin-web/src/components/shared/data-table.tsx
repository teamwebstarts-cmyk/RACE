import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

import { EmptyState } from '@race/ui';

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = 'No records found',
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-[#EEEEEE] text-[#555555]">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0 hover:bg-[#FAFAFA]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-[#1A1A2E]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
