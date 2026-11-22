"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Bell, LogOut, Menu } from "lucide-react"

import { Logo } from "@/components/logo"
import {
  accountNav,
  adminNav,
  customerNav,
  adminPersona,
  technicianNav,
  getActiveHref,
  type DashboardNavItem,
} from "@/components/dashboard/nav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { useDashboardGuard } from "@/lib/auth/helpers"
import { clearToken } from "@/lib/auth/token"
import { cn } from "cn"

type DashboardVariant = "customer" | "technician" | "admin" | "account"

type DashboardShellProps = {
  variant: DashboardVariant
  children: React.ReactNode
}

const SHELL_NAV: Record<DashboardVariant, DashboardNavItem[]> = {
  customer: customerNav,
  technician: technicianNav,
  admin: adminNav,
  account: accountNav,
}

const SHELL_SECTIONS: Record<DashboardVariant, string> = {
  customer: "Customer Dashboard",
  technician: "Technician Dashboard",
  admin: "Admin Dashboard",
  account: "Account Settings",
}

function SidebarNav({
  nav,
  activeHref,
  onNavigate,
}: {
  nav: DashboardNavItem[]
  activeHref: string
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = item.href === activeHref
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#596B3F] text-[#F7F6F0]"
                : "text-[#F7F6F0]/70 hover:bg-[#F7F6F0]/10 hover:text-[#F7F6F0]"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter({
  name,
  role,
  image,
  onSignOut,
}: {
  name: string
  role: string
  image: string
  onNavigate?: () => void
  onSignOut?: () => void
}) {
  return (
    <div className="mt-auto border-t border-[#F7F6F0]/10 p-4">
      <div className="flex items-center gap-3">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#A8B39A]/40">
          <Image
            src={image}
            alt={name}
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#F7F6F0]">{name}</p>
          <p className="truncate text-xs text-[#A8B39A]">{role}</p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="rounded-lg p-2 text-[#A8B39A] transition-colors hover:bg-[#F7F6F0]/10 hover:text-[#F7F6F0]"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function DashboardShell({
  variant,
  children,
}: DashboardShellProps) {
  const nav = SHELL_NAV[variant]
  const section = SHELL_SECTIONS[variant]
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeHref = getActiveHref(pathname, nav)

  const user = session?.user
  const role = String(user?.role ?? "")
  const displayName = user?.name || user?.email?.split("@")[0] || "Account"
  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "technician"
        ? "Technician"
        : "Customer"
  const avatar = user?.image || (variant === "admin" ? adminPersona.image : "/images/persona-customer.jpg")

  // Protected route: require a session and matching role; survives reload.
  useDashboardGuard(variant)

  async function handleSignOut() {
    try {
      await authClient.signOut()
    } finally {
      clearToken()
      router.replace("/sign-in")
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F0]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#30352B]/40 bg-[#414A35] lg:flex">
        <div className="flex h-16 items-center border-b border-[#F7F6F0]/10 px-5">
          <Link href="/" aria-label="FixMate home">
            <Logo
              markClassName="size-8"
              textClassName="text-[#F7F6F0]"
              mateClassName="text-[#A8B39A]"
            />
          </Link>
        </div>
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#A8B39A] uppercase">
            {section}
          </p>
        </div>
        <SidebarNav nav={nav} activeHref={activeHref} />
        <SidebarFooter
          name={displayName}
          role={roleLabel}
          image={avatar}
          onSignOut={handleSignOut}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 gap-0 border-none bg-[#414A35] p-0 text-[#F7F6F0]"
        >
          <SheetHeader className="h-16 justify-center border-b border-[#F7F6F0]/10 px-5">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <Link
              href="/"
              aria-label="FixMate home"
              onClick={() => setMobileOpen(false)}
            >
              <Logo
                markClassName="size-8"
                textClassName="text-[#F7F6F0]"
                mateClassName="text-[#A8B39A]"
              />
            </Link>
          </SheetHeader>
          <div className="px-5 pt-5 pb-2">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#A8B39A] uppercase">
              {section}
            </p>
          </div>
          <SidebarNav
            nav={nav}
            activeHref={activeHref}
            onNavigate={() => setMobileOpen(false)}
          />
          <SidebarFooter
            name={displayName}
            role={roleLabel}
            image={avatar}
            onNavigate={() => setMobileOpen(false)}
            onSignOut={handleSignOut}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#D8D6C9] bg-[#F7F6F0]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35] lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <p className="truncate text-sm font-semibold text-[#30352B] sm:text-base">
              {section}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
            >
              <Bell className="size-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#596B3F]/10 focus-visible:ring-2 focus-visible:ring-[#596B3F]/40"
                aria-label="Account menu"
              >
                <span className="relative size-8 overflow-hidden rounded-full">
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block font-medium text-[#30352B]">
                    {displayName}
                  </span>
                  <span className="block text-xs text-[#5C6353]">{roleLabel}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuLabel className="text-[#30352B]">
                  {user?.email || "Signed out"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/dashboard/profile" />}
                  className="text-[#30352B] focus:bg-[#E9EDE4] focus:text-[#30352B]"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/" />}
                  className="text-[#30352B] focus:bg-[#E9EDE4] focus:text-[#30352B]"
                >
                  Back to website
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-[#30352B] focus:bg-[#E9EDE4] focus:text-[#30352B]"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
