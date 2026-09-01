import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, rowKey, emptyTitle = "No records found", emptyDescription, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-card transition-shadow max-w-full">
      <table className="w-full min-w-[600px] border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/70 text-left">
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink-500 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={
                onRowClick
                  ? "cursor-pointer transition-colors hover:bg-brand-50/50 focus-within:bg-brand-50/50"
                  : "transition-colors hover:bg-ink-50/40"
              }
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-3 py-3 sm:px-4 sm:py-3.5 align-middle text-ink-800 ${col.className ?? ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
