"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bed,
  Building2,
  Calendar,
  ChevronRight,
  CreditCard,
  FileBarChart,
  FileText,
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

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  executeGlobalSearch,
  STANDARD_QUICK_ACTIONS,
  SearchResultItem,
  SearchEntityCategory,
} from "@/hospital-admin/lib/search/global-search-indexer";
import { cn } from "@/hospital-admin/lib/utils";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";

const CATEGORIES = [
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

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-300 dark:bg-amber-500/30 text-slate-950 dark:text-amber-200 font-semibold px-1 py-0.5 rounded mx-0.5 inline-block leading-none"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

function getCategoryIcon(cat: SearchEntityCategory) {
  switch (cat) {
    case "Patient":
      return <User className="h-4 w-4 text-emerald-600" />;
    case "Doctor":
      return <Stethoscope className="h-4 w-4 text-teal-600" />;
    case "Staff":
      return <Users className="h-4 w-4 text-blue-600" />;
    case "Appointment":
      return <Calendar className="h-4 w-4 text-indigo-600" />;
    case "Bed / Ward":
      return <Bed className="h-4 w-4 text-cyan-600" />;
    case "Surgery & OT":
      return <Activity className="h-4 w-4 text-purple-600" />;
    case "Billing / Invoice":
      return <CreditCard className="h-4 w-4 text-amber-600" />;
    case "Procurement & PO":
      return <ShoppingBag className="h-4 w-4 text-orange-600" />;
    case "Emergency SOS":
      return <ShieldAlert className="h-4 w-4 text-rose-600" />;
    case "Vendor":
      return <Building2 className="h-4 w-4 text-blue-500" />;
    case "Report":
      return <FileBarChart className="h-4 w-4 text-sky-600" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

export function GlobalSearch() {
  const router = useRouter();
  const currentRole = useSelector((state: RootState) => state.nursingOperations.currentRole);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const roleSearchConfig = useMemo(() => {
    switch (currentRole) {
      case "nurse_lead":
      case "senior_nurse":
        return {
          triggerPlaceholder: "Search nurses, patients, tasks, rosters...",
          inputPlaceholder: "Search station nurses, support staff, inpatient beds, care tasks, rosters...",
          categories: ["All", "Staff", "Patients", "Beds & Wards", "Tasks", "Emergency SOS"],
        };
      case "nurse":
        return {
          triggerPlaceholder: "Search assigned patients, MAR, tasks...",
          inputPlaceholder: "Search assigned patients, vitals, MAR, care tasks, rosters...",
          categories: ["All", "Patients", "Beds & Wards", "Tasks", "Emergency SOS"],
        };
      case "support_staff":
        return {
          triggerPlaceholder: "Search operational tasks, duty rosters...",
          inputPlaceholder: "Search assigned operational tasks, room cleaning, duty rosters...",
          categories: ["All", "Tasks", "Beds & Wards"],
        };
      case "admin":
      default:
        return {
          triggerPlaceholder: "Search patients, doctors, beds, invoices, SOS...",
          inputPlaceholder: "Type to search patients, doctors, beds, surgeries, invoices, emergency...",
          categories: CATEGORIES,
        };
    }
  }, [currentRole]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+K, Cmd+K, or / to open, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    return executeGlobalSearch(query, filterCategory);
  }, [query, filterCategory]);

  // Handle keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        setIsOpen(false);
        router.push(`/hospital-admin/search?q=${encodeURIComponent(query)}`);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        setIsOpen(false);
        router.push(searchResults[selectedIndex].href);
      }
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleSelectQuickAction = (qa: (typeof STANDARD_QUICK_ACTIONS)[0]) => {
    setIsOpen(false);
    router.push(qa.href);
  };

  return (
    <>
      {/* PERSISTENT TOPBAR SEARCH TRIGGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-full max-w-sm items-center justify-between rounded-lg border border-input bg-background/80 px-3 text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent/40 hover:text-foreground focus:outline-hidden"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{roleSearchConfig.triggerPlaceholder}</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* SPOTLIGHT COMMAND PALETTE DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Hospital Search &amp; Command Palette</DialogTitle>

          {/* SEARCH INPUT BAR */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/20">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            <Input
              ref={inputRef}
              placeholder={roleSearchConfig.inputPlaceholder}
              className="border-0 shadow-none text-sm focus-visible:ring-0 px-0 h-8 bg-transparent"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              ESC
            </kbd>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-border/50 bg-muted/10 scrollbar-none text-[11px]">
            {roleSearchConfig.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setSelectedIndex(0);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all",
                  filterCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RESULTS / QUICK ACTIONS LIST CONTAINER */}
          <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1 text-xs">
            {/* 1. WHEN QUERY IS EMPTY: SHOW 10 PERMITTED QUICK ACTIONS */}
            {!query.trim() && (
              <div className="p-2 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
                    {STANDARD_QUICK_ACTIONS.map((qa) => (
                      <button
                        key={qa.id}
                        onClick={() => handleSelectQuickAction(qa)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-md bg-muted/40 group-hover:bg-primary/10 text-primary">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-xs block group-hover:text-primary">
                              {qa.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                              {qa.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-mono shrink-0 ml-1">
                          {qa.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground px-2">
                  <span>Start typing to search across 11 hospital entities</span>
                  <span className="font-mono text-[10px]">100% RBAC Gated</span>
                </div>
              </div>
            )}

            {/* 2. WHEN QUERY IS ACTIVE BUT NO MATCHES */}
            {query.trim() && searchResults.length === 0 && (
              <div className="p-8 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Try searching by UHID, Doctor Name, Staff Role, Bed Number, Surgery Case, or Invoice #.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/hospital-admin/search?q=${encodeURIComponent(query)}`);
                  }}
                >
                  Open Full Search Results Page &rarr;
                </Button>
              </div>
            )}

            {/* 3. WHEN QUERY HAS MATCHES */}
            {query.trim() &&
              searchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isCritical = item.urgencyLevel === "critical";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "p-2.5 rounded-lg cursor-pointer transition-all border",
                      isSelected
                        ? "bg-accent/70 border-primary/40 shadow-xs"
                        : "border-transparent hover:bg-muted/30",
                      isCritical && "border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "p-1.5 rounded-md shrink-0 mt-0.5",
                            isCritical ? "bg-rose-500/15 text-rose-600 animate-pulse" : "bg-muted text-foreground"
                          )}
                        >
                          {getCategoryIcon(item.category)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-xs truncate">
                              <HighlightText text={item.title} query={query} />
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-mono",
                                isCritical
                                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold"
                                  : "bg-muted/40"
                              )}
                            >
                              {item.badgeText || item.category}
                            </Badge>
                          </div>

                          {item.subtitle && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              <HighlightText text={item.subtitle} query={query} />
                            </p>
                          )}

                          {item.snippets.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {item.snippets.map((snip, sIdx) => (
                                <div key={sIdx} className="text-[10px] text-muted-foreground bg-background/60 p-1 rounded border border-border/40">
                                  {snip.label && <strong className="text-foreground">{snip.label}: </strong>}
                                  <HighlightText text={snip.text} query={query} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* FOOTER BAR */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/20 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono text-[9px]">↑</kbd>
                <kbd className="rounded border bg-muted px-1 font-mono text-[9px]">↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono text-[9px]">↵</kbd> Select
              </span>
            </div>

            {query.trim() && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] font-semibold text-primary p-0 hover:bg-transparent"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/hospital-admin/search?q=${encodeURIComponent(query)}`);
                }}
              >
                View all results on Search Page &rarr;
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
