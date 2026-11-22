import { DashboardShell } from "@/components/dashboard/shell"

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell variant="admin">{children}</DashboardShell>
}
