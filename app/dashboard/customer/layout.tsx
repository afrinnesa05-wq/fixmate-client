import { DashboardShell } from "@/components/dashboard/shell"

export default function CustomerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell variant="customer">{children}</DashboardShell>
}
