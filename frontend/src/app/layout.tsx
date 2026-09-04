import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { DemoProvider } from "@/state/demo-context";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "@/components/layout/AppShell";
import { HospitalWorkflowProvider } from "@/state/hospital-workflow-context";

export const metadata: Metadata = {
  title: "Qlyno Laboratory Portal",
  description: "Multi-tenant Laboratory Information System frontend prototype.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <DemoProvider>
          <HospitalWorkflowProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </HospitalWorkflowProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
