import {
  Calendar,
  CreditCard,
  Inbox,
  LayoutDashboard,
  ListFilter,
  Plus,
  ReceiptText,
  ShieldCheck,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export type DashboardPersona = {
  name: string
  role: string
  email: string
  image: string
}

export const customerPersona: DashboardPersona = {
  name: "Sarah Mitchell",
  role: "Customer",
  email: "sarah.mitchell@example.com",
  image: "/images/persona-customer.jpg",
}

export const technicianPersona: DashboardPersona = {
  name: "Daniel Reyes",
  role: "Technician",
  email: "daniel.reyes@example.com",
  image: "/images/technician-1.jpg",
}

export const adminPersona: DashboardPersona = {
  name: "Olivia Chen",
  role: "Administrator",
  email: "olivia.chen@example.com",
  image: "/images/persona-admin.jpg",
}

export const customerNav: DashboardNavItem[] = [
  { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/customer/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export const technicianNav: DashboardNavItem[] = [
  { href: "/dashboard/technician", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/technician/requests", label: "Requests", icon: Inbox },
  { href: "/dashboard/technician/my-services", label: "My Services", icon: ListFilter },
  { href: "/dashboard/technician/add-service", label: "Add Service", icon: Plus },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export const adminNav: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/admin/services", label: "Services", icon: Wrench },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export const accountNav: DashboardNavItem[] = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/customer", label: "Customer Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/technician", label: "Technician Dashboard", icon: Wrench },
  { href: "/dashboard/admin", label: "Admin Dashboard", icon: ShieldCheck },
]

export function getActiveHref(
  pathname: string,
  nav: DashboardNavItem[]
): string {
  let best = ""
  for (const item of nav) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (item.href.length > best.length) best = item.href
    }
  }
  return best
}
