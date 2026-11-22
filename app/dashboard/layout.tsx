import { RequireRole } from "@/lib/auth/helpers"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireRole>{children}</RequireRole>
}
