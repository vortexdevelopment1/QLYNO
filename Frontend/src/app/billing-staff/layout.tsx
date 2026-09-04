import { AppProvider } from "@/billing-staff/context/AppContext";
import { AppShell } from "@/billing-staff/components/layout/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
