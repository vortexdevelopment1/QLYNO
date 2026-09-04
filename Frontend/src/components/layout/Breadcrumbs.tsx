"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { toTitleCase } from "@/lib/utils/format";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-sm font-medium text-text-main">Command Center</span>;
  }

  let acc = "";
  const crumbs = segments.map((seg) => {
    acc += `/${seg}`;
    return { href: acc, label: toTitleCase(decodeURIComponent(seg)) };
  });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link href="/dashboard" className="text-text-muted hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            HMS Lab
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
            {i === crumbs.length - 1 ? (
              <span className="truncate font-medium text-text-main" aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="truncate text-text-muted hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
