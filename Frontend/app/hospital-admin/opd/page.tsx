"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OPDRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hospital-admin/appointments/opd-queue");
  }, [router]);

  return (
    <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
      Redirecting to OPD Queue &amp; Consultations...
    </div>
  );
}
