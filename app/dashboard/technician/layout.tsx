import { DashboardShell } from "@/components/dashboard/shell"

export default function TechnicianDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell variant="technician">{children}</DashboardShell>
}
