"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { ChevronsUpDown, LogOut, PanelLeftClose, PanelLeftOpen, Settings, User, ShieldCheck, HeartPulse, UserCheck, Bed, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { setCurrentRole } from "@/hospital-admin/store/slices/nursingOperationsSlice";
import { AppUserRole } from "@/hospital-admin/lib/types/nursing-module";
import { NURSING_STORAGE_KEY } from "@/hospital-admin/store/provider";
import { signOutToRoot } from "@/lib/client-session";

import { getNavigationForRole, getWorkspaceMetaForRole } from "@/hospital-admin/components/layout/nav-items";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { cn } from "@/hospital-admin/lib/utils";

function Logo({ collapsed, role }: { collapsed: boolean; role?: any }) {
  const meta = getWorkspaceMetaForRole(role);
  const homeHref =
    role === "nurse_lead" || role === "senior_nurse"
      ? "/nurse-station"
      : role === "nurse"
      ? "/nurse"
      : role === "support_staff"
      ? "/support-staff"
      : "/dashboard";

  return (
    <Link href={homeHref} className={cn("flex items-center gap-2.5 px-2 py-1", collapsed && "justify-center px-0")}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-active/20 text-sidebar-active">
        <span className="h-4 w-4 rounded-sm bg-sidebar-active" />
      </span>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-display text-[15px] font-bold tracking-tight text-sidebar-foreground leading-none">
            {meta.appName} <span className="text-sidebar-active">{meta.appSubname}</span>
          </span>
          <span className="text-[10px] text-sidebar-muted font-medium mt-0.5 leading-none">
            {meta.tagline}
          </span>
        </div>
      )}
    </Link>
  );
}

export function SidebarNav({
  onNavigate,
  collapsed,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxRole = useSelector((state: RootState) => state.nursingOperations.currentRole);
  const [persistedRole, setPersistedRole] = useState<AppUserRole | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(NURSING_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            typeof parsed.currentRole === "string" &&
            ["admin", "nurse_lead", "senior_nurse", "nurse", "support_staff", "doctor"].includes(parsed.currentRole)
          ) {
            return parsed.currentRole as AppUserRole;
          }
        }
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(NURSING_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            typeof parsed.currentRole === "string" &&
            ["admin", "nurse_lead", "senior_nurse", "nurse", "support_staff", "doctor"].includes(parsed.currentRole)
          ) {
            setPersistedRole(parsed.currentRole as AppUserRole);
            if (parsed.currentRole !== reduxRole) {
              dispatch(
                setCurrentRole({
                  role: parsed.currentRole,
                  userId: parsed.currentUserId,
                  userName: parsed.currentUserName,
                })
              );
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, reduxRole]);

  const routeInferredRole: AppUserRole | null =
    pathname?.startsWith("/hospital-admin/nurse-station")
      ? (reduxRole === "senior_nurse" ? "senior_nurse" : "nurse_lead")
      : pathname === "/hospital-admin/nurse"
      ? "nurse"
      : pathname === "/hospital-admin/support-staff"
      ? "support_staff"
      : null;

  const effectiveRole: AppUserRole =
    persistedRole ||
    (routeInferredRole && reduxRole === "admin" ? routeInferredRole : reduxRole) ||
    "admin";

  const navGroups = getNavigationForRole(effectiveRole);
  const meta = getWorkspaceMetaForRole(effectiveRole);

  const handleSwitchRole = (role: AppUserRole, userId: string, userName: string, targetRoute: string) => {
    setPersistedRole(role);
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(NURSING_STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : {};
        window.localStorage.setItem(
          NURSING_STORAGE_KEY,
          JSON.stringify({ ...existing, currentRole: role, currentUserId: userId, currentUserName: userName })
        );
      } catch (err) {
        console.error(err);
      }
    }
    dispatch(setCurrentRole({ role, userId, userName }));
    router.push(targetRoute);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-3 transition-all duration-300 ease-out", collapsed && "justify-center px-2")}>
        <Logo collapsed={Boolean(collapsed)} role={effectiveRole} />
        {!collapsed && onToggleCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md text-sidebar-muted transition-all duration-200 ease-out hover:bg-muted hover:text-sidebar-foreground"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.title}
              </h2>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ease-out",
                      isActive
                        ? "bg-sidebar-active/15 text-sidebar-active font-semibold shadow-xs"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-muted/10 hover:text-sidebar-foreground",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Workspace Selector Footer */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-lg p-2 text-left transition-all duration-200 ease-out hover:bg-sidebar-muted/10",
                collapsed && "justify-center p-1"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                    {meta.profileName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate text-xs font-bold text-sidebar-foreground">{meta.profileName}</p>
                    <p className="truncate text-[10px] text-sidebar-muted">{meta.profileRole}</p>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-muted" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={collapsed ? "right" : "top"}
            align={collapsed ? "end" : "center"}
            className="w-64"
          >
            <DropdownMenuLabel>
              <p className="text-sm font-bold">{meta.profileName}</p>
              <p className="text-xs font-normal text-muted-foreground">{meta.profileRole}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{meta.profileEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={effectiveRole === "nurse" ? "/nurse" : effectiveRole === "support_staff" ? "/support-staff" : effectiveRole === "nurse_lead" || effectiveRole === "senior_nurse" ? "/nurse-station" : "/settings"} onClick={onNavigate}>
                <User className="mr-2 h-4 w-4" /> My Workspace
              </Link>
            </DropdownMenuItem>
            {effectiveRole === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/hospital-admin/settings" onClick={onNavigate}>
                  <Settings className="mr-2 h-4 w-4" /> Global Settings
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Quick Switch Role
            </DropdownMenuLabel>
            <DropdownMenuItem
              className={cn("text-xs cursor-pointer gap-2", effectiveRole === "admin" && "font-bold text-primary bg-primary/10")}
              onClick={() => handleSwitchRole("admin", "usr-admin-1", "Dr. Vikram Seth (Hospital Admin)", "/dashboard")}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Hospital Admin
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn("text-xs cursor-pointer gap-2", effectiveRole === "nurse_lead" && "font-bold text-primary bg-primary/10")}
              onClick={() => handleSwitchRole("nurse_lead", "nurse-1", "Sister Anita Joseph (Station Lead)", "/nurse-station")}
            >
              <HeartPulse className="h-3.5 w-3.5 text-rose-600" /> Nurse Station Lead
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn("text-xs cursor-pointer gap-2", effectiveRole === "senior_nurse" && "font-bold text-primary bg-primary/10")}
              onClick={() => handleSwitchRole("senior_nurse", "nurse-2", "Sister Sneha Kulkarni (Senior Nurse)", "/nurse-station")}
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-600" /> Senior Nurse
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn("text-xs cursor-pointer gap-2", effectiveRole === "nurse" && "font-bold text-primary bg-primary/10")}
              onClick={() => handleSwitchRole("nurse", "nurse-3", "Nurse Rahul Shinde", "/nurse")}
            >
              <Bed className="h-3.5 w-3.5 text-emerald-600" /> Staff Nurse (Bedside)
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn("text-xs cursor-pointer gap-2", effectiveRole === "support_staff" && "font-bold text-primary bg-primary/10")}
              onClick={() => handleSwitchRole("support_staff", "sup-1", "Ramesh Pawar (Ward Attendant)", "/support-staff")}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Support Staff
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate?.();
                  signOutToRoot(router.push);
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {collapsed && onToggleCollapse && (
          <div className="mt-2 flex justify-center border-t border-sidebar-border/50 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-sidebar-muted transition-all duration-200 ease-out hover:bg-muted hover:text-sidebar-foreground"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
