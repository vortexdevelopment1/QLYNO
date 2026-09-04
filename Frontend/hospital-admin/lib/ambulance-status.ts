import { AmbulanceStatus } from "@/hospital-admin/store/slices/ambulanceSlice";

export const STATUS_CONFIG: Record<
  AmbulanceStatus,
  { label: string; bg: string; text: string; border: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }
> = {
  Available: { label: "Available", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/30", badgeVariant: "default" },
  Dispatched: { label: "Dispatched", bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/30", badgeVariant: "secondary" },
  "En Route": { label: "En Route", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/30", badgeVariant: "outline" },
  "At Scene": { label: "At Scene", bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500/30", badgeVariant: "destructive" },
  Transporting: { label: "Transporting", bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-500/30", badgeVariant: "outline" },
  "At Hospital": { label: "At Hospital", bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-700 dark:text-teal-300", border: "border-teal-500/30", badgeVariant: "secondary" },
  "Maintenance/Offline": { label: "Maintenance / Offline", bg: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-700 dark:text-slate-300", border: "border-slate-500/30", badgeVariant: "secondary" },
};
