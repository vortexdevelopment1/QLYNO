"use client";

import { Search } from "lucide-react";

import { Input } from "@/hospital-admin/components/ui/input";
import { cn } from "@/hospital-admin/lib/utils";

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Toolbar({ searchValue, onSearchChange, placeholder = "Search...", children, className }: ToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <Input
        icon={<Search />}
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
