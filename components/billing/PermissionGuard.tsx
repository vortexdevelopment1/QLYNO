import { PermissionSet } from "@/types";
import { useApp } from "@/context/AppContext";
import { can, explainDenial } from "@/lib/permissions";

/**
 * Wraps content that requires a permission. When denied, shows an explanation
 * rather than silently disappearing, per the PRD's permission-system requirement.
 */
export function PermissionGuard({
  permission, children, fallbackLabel,
}: {
  permission: keyof PermissionSet; children: React.ReactNode; fallbackLabel?: string;
}) {
  const { currentUser } = useApp();
  if (can(currentUser, permission)) return <>{children}</>;
  return (
    <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-medium">{fallbackLabel ?? "Restricted"}</p>
      <p className="mt-0.5">{explainDenial(permission)}</p>
    </div>
  );
}
