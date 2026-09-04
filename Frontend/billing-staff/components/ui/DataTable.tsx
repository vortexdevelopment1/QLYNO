import { useState } from "react";
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
  pagination?: boolean;
  pageSize?: number;
  selectedRowKey?: string;
}

export function DataTable<T>({ 
  columns, 
  rows, 
  rowKey, 
  emptyTitle = "No records found", 
  emptyDescription, 
  onRowClick,
  pagination = false,
  pageSize = 10,
  selectedRowKey
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const totalPages = Math.ceil(rows.length / pageSize);
  const currentRows = pagination ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : rows;

  return (
    <div className="rounded-xl border border-ink-100 bg-white shadow-card transition-shadow flex flex-col">
      <div className="overflow-x-auto max-w-full touch-pan-x">
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
            {currentRows.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedRowKey === key;
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick
                      ? `cursor-pointer transition-colors ${isSelected ? 'bg-brand-50/70 ring-1 ring-inset ring-brand-500' : 'hover:bg-brand-50/50 focus-within:bg-brand-50/50'}`
                      : "transition-colors hover:bg-ink-50/40"
                  }
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-3 py-2.5 sm:px-4 sm:py-3.5 align-middle text-ink-800 ${col.className ?? ""}`}>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-ink-100 px-4 py-3 bg-ink-50/30 rounded-b-xl">
          <p className="text-xs text-ink-500">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, rows.length)}</span> of <span className="font-medium">{rows.length}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
