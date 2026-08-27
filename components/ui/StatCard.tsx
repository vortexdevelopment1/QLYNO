import { classNames } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "warning" | "danger" | "success";
  icon?: React.ReactNode;
}

const TONE_BORDER: Record<string, string> = {
  default: "border-ink-100",
  warning: "border-amber-200",
  danger: "border-red-200",
  success: "border-emerald-200",
};

export function StatCard({ label, value, sublabel, tone = "default" }: StatCardProps) {
  return (
    <div
      className={classNames(
        "rounded-xl border bg-white p-4 shadow-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        TONE_BORDER[tone]
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs font-medium text-ink-500">{sublabel}</p>}
    </div>
  );
}
