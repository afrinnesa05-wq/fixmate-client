"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Home, Info, LogOut, Menu, User, Wrench } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { roleHomePath } from "@/lib/auth/helpers"
import { clearToken } from "@/lib/auth/token"
import { cn } from "cn"

type NavItem = {
  href: string
  label: string
  icon: typeof Home
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/about", label: "How It Works", icon: Info },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, isPending } = authClient.useSession()

  const closeMobileMenu = () => setMobileOpen(false)

  async function handleSignOut() {
    await authClient.signOut()
    clearToken()
    closeMobileMenu()
    router.push("/")
    router.refresh()
  }

  const user = session?.user
  const dashboardHref = roleHomePath(user?.role)

  return (
    <header className="sticky top-0 z-50 border-b border-[#A5A58D]/30 bg-[#F7F6F0]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="FixMate home"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#596B3F]/50"
        >
          <Logo markClassName="size-8" />
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 items-center px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:bg-[#596B3F] after:transition-transform after:content-['']",
                  active
                    ? "text-[#596B3F] after:scale-x-100"
                    : "text-[#30352B]/75 after:scale-x-0 hover:text-[#414A35]"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {isPending ? null : user ? (
              <>
                <Button
                  render={<Link href={dashboardHref} />}
                  nativeButton={false}
                  variant="ghost"
                  className="h-9 gap-2 px-3 text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                >
                  <User className="size-4" />
                  <span className="max-w-36 truncate">{user.name}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-4 text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  render={<Link href="/sign-in" />}
                  nativeButton={false}
                  variant="ghost"
                  className="h-9 px-4 text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                >
                  Sign In
                </Button>
                <Button
                  render={<Link href="/sign-up" />}
                  nativeButton={false}
                  className="h-9 bg-[#596B3F] px-4 font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35] md:hidden"
                />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open navigation menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="gap-0 border-[#A5A58D]/30 bg-[#F7F6F0] p-0 text-[#30352B]"
            >
              <SheetHeader className="border-b border-[#A5A58D]/30">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <Logo markClassName="size-8" />
              </SheetHeader>

              <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "border-[#596B3F] bg-[#596B3F]/10 text-[#596B3F]"
                          : "border-transparent text-[#30352B]/75 hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-[#A5A58D]/30 p-4">
                {isPending ? null : user ? (
                  <>
                    <Button
                      render={<Link href={dashboardHref} />}
                      nativeButton={false}
                      variant="outline"
                      className="justify-start gap-2 border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                      onClick={closeMobileMenu}
                    >
                      <User className="size-4" />
                      <span className="truncate">{user.name}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="justify-start gap-2 text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      render={<Link href="/sign-in" />}
                      nativeButton={false}
                      variant="outline"
                      className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Button>
                    <Button
                      render={<Link href="/sign-up" />}
                      nativeButton={false}
                      className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
