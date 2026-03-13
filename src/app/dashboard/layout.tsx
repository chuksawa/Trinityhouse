import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import DashboardGuard from "@/components/dashboard-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col pl-64 transition-all duration-300">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </DashboardGuard>
  );
}
