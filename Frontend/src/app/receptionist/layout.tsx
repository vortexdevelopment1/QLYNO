import type { ReactNode } from "react";
import { ReceptionistDataProvider } from "@/components/receptionist/data-context";

export default function ReceptionistLayout({ children }: { children: ReactNode }) {
  return <ReceptionistDataProvider>{children}</ReceptionistDataProvider>;
}
