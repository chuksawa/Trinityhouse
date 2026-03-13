import DashboardGuard from "@/components/dashboard-guard";
import DashboardShell from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <DashboardShell>{children}</DashboardShell>
    </DashboardGuard>
  );
}
