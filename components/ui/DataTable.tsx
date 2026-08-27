import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
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
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-card transition-shadow">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/70 text-left">
            {columns.map((col) => (
              <th key={col.header} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
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
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3.5 align-middle text-ink-800 ${col.className ?? ""}`}>
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
