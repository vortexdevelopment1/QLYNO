"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  expandedRowKey?: string;
  renderExpandedRow?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = 8,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your filters or search terms.",
  onRowClick,
  rowClassName,
  expandedRowKey,
  renderExpandedRow,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-app-border bg-app-surface">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-app-border bg-app-sidebar">
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {col.sortValue ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.key === col.key ? { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key: col.key, dir: "asc" }
                        )
                      }
                    >
                      {col.header}
                      <ChevronsUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <Fragment key={rowKey(row)}>
              <tr
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "min-h-[52px] border-b border-app-border last:border-0",
                  onRowClick && "cursor-pointer hover:bg-app-bg",
                  rowClassName?.(row)
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle text-text-main", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
              {expandedRowKey === rowKey(row) && renderExpandedRow && <tr className="border-b border-app-border bg-app-bg"><td colSpan={columns.length} className="px-4 py-3">{renderExpandedRow(row)}</td></tr>}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={sorted.length} pageSize={pageSize} />
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  totalItems?: number;
  pageSize?: number;
}) {
  return (
    <div className="mt-3 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
      {totalItems !== undefined && pageSize !== undefined && (
        <p className="text-xs text-text-muted">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-app-border bg-white text-text-main disabled:opacity-40 hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-xs text-text-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-app-border bg-white text-text-main disabled:opacity-40 hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
