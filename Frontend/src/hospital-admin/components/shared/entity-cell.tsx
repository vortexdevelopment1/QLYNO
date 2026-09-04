import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { getInitials } from "@/hospital-admin/lib/utils";

export function EntityCell({
  name,
  subtitle,
  avatarUrl,
}: {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
}
