import { DashboardShell } from "@/components/dashboard/shell"

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell variant="account">{children}</DashboardShell>
}
