"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bed,
  Building2,
  Calendar,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileBarChart,
  FileText,
  Filter,
  Flame,
  Layers,
  Search,
  ShieldAlert,
  ShoppingBag,
  Siren,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import {
  executeGlobalSearch,
  STANDARD_QUICK_ACTIONS,
  SearchResultItem,
  SearchEntityCategory,
} from "@/hospital-admin/lib/search/global-search-indexer";
import { cn } from "@/hospital-admin/lib/utils";

const SEARCH_CATEGORIES = [
  "All",
  "Patients",
  "Doctors",
  "Staff",
  "Appointments",
  "Beds & Wards",
  "Surgeries",
  "Invoices",
  "Procurement",
  "Emergency SOS",
  "Vendors",
  "Reports",
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const searchResults = useMemo(() => {
    return executeGlobalSearch(query, activeCategory);
  }, [query, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: executeGlobalSearch(query, "All").length };
    SEARCH_CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = executeGlobalSearch(query, cat).length;
    });
    return counts;
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hospital-admin/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(activeCategory)}`);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Global Hospital Search"
        description="Unified enterprise search across patients, doctors, workforce staff, clinical encounters, beds, surgeries, invoices, emergency SOS, and supply chains."
        crumbs={[{ label: "System" }, { label: "Global Search" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Global Search &amp; Discovery Hub" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>PRD Section 18 • Unified search indexing 11 entities with strict RBAC permission gating</span>
        </div>
      </div>

      {/* SEARCH BAR INPUT CARD */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by UHID, patient name, doctor specialty, ward bed #, surgery case, invoice #, PO #..."
                className="pl-9 text-sm h-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-10 px-5 font-semibold">
              Search
            </Button>
          </form>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-3 border-t border-border/50 scrollbar-none text-xs">
            {SEARCH_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    router.push(`/hospital-admin/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(cat)}`);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all text-xs",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>{cat}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MAIN RESULTS & QUICK ACTIONS SIDEBAR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* RESULTS COLUMN (3 COLS) */}
        <div className="lg:col-span-3 space-y-3">
          {query.trim() && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing <strong>{searchResults.length}</strong> results for &ldquo;{query}&rdquo; in <strong>{activeCategory}</strong>
              </span>
              <span className="font-mono text-[11px]">Instant Index Match</span>
            </div>
          )}

          {/* NO QUERY STATE */}
          {!query.trim() && (
            <Card className="border-border shadow-xs p-8 text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Type a search query above</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Search across patients by UHID, doctors by medical council registration, staff rosters, inpatient bed assignments, emergency triage cases, and vendor purchase orders.
                </p>
              </div>
            </Card>
          )}

          {/* EMPTY RESULTS STATE */}
          {query.trim() && searchResults.length === 0 && (
            <Card className="border-border shadow-xs p-8 text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">No matching records found for &ldquo;{query}&rdquo;</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Try broadening your search term or select &ldquo;All Categories&rdquo; to query across the entire hospital database.
                </p>
              </div>
            </Card>
          )}

          {/* RESULT CARDS LIST */}
          {searchResults.map((item) => {
            const isCritical = item.urgencyLevel === "critical";

            return (
              <Card
                key={item.id}
                className={cn(
                  "border-border shadow-xs hover:border-primary/50 transition-all text-xs",
                  isCritical && "border-rose-500/40 bg-rose-500/[0.02]"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={item.href}
                          className="font-bold text-foreground text-sm hover:text-primary hover:underline flex items-center gap-1.5"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono",
                            isCritical
                              ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold animate-pulse"
                              : "bg-muted/40"
                          )}
                        >
                          {item.badgeText || item.category}
                        </Badge>
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                      )}
                    </div>

                    <Button size="sm" variant="outline" className="h-7 text-xs font-semibold shrink-0" asChild>
                      <Link href={item.href}>
                        Open Record &rarr;
                      </Link>
                    </Button>
                  </div>

                  {/* DEEP SNIPPETS */}
                  {item.snippets.length > 0 && (
                    <div className="p-2.5 bg-muted/20 rounded-lg border border-border/50 space-y-1 mt-2 text-[11px]">
                      {item.snippets.map((snip, sIdx) => (
                        <div key={sIdx} className="text-muted-foreground">
                          {snip.label && <strong className="text-foreground">{snip.label}: </strong>}
                          <span>{snip.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* QUICK ACTIONS SIDEBAR (1 COL) */}
        <div className="space-y-3">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Actions
              </CardTitle>
              <CardDescription className="text-[11px]">
                Standardized administrative creation shortcuts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-1.5">
              {STANDARD_QUICK_ACTIONS.map((qa) => (
                <Link
                  key={qa.id}
                  href={qa.href}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-foreground text-[11px] block group-hover:text-primary truncate">
                      {qa.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {qa.description}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading global search index...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
