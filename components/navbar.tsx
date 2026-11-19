"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Home, Info, Menu, Wrench } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#A5A58D]/30 bg-[#F7F6EF]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="FixMate home"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#667044]/50"
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
                  "relative flex h-16 items-center px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:bg-[#667044] after:transition-transform after:content-['']",
                  active
                    ? "text-[#667044] after:scale-x-100"
                    : "text-[#292A24]/75 after:scale-x-0 hover:text-[#292A24]"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              variant="ghost"
              className="h-9 px-4 text-[#292A24] hover:bg-[#A5A58D]/25 hover:text-[#292A24]"
            >
              Sign In
            </Button>
            <Button
              render={<Link href="/sign-up" />}
              nativeButton={false}
              className="h-9 bg-[#667044] px-4 font-semibold text-[#F7F6EF] hover:bg-[#667044]/90 hover:text-[#F7F6EF]"
            >
              Sign Up
            </Button>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#292A24] hover:bg-[#A5A58D]/25 hover:text-[#292A24] md:hidden"
                />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open navigation menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="gap-0 border-[#A5A58D]/30 bg-[#F7F6EF] p-0 text-[#292A24]"
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
                          ? "border-[#667044] bg-[#667044]/10 text-[#667044]"
                          : "border-transparent text-[#292A24]/75 hover:bg-[#A5A58D]/15 hover:text-[#292A24]"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-[#A5A58D]/30 p-4">
                <Button
                  render={<Link href="/sign-in" />}
                  nativeButton={false}
                  variant="outline"
                  className="border-[#A5A58D]/40 bg-transparent text-[#292A24] hover:bg-[#A5A58D]/20 hover:text-[#292A24]"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Button>
                <Button
                  render={<Link href="/sign-up" />}
                  nativeButton={false}
                  className="bg-[#667044] font-semibold text-[#F7F6EF] hover:bg-[#667044]/90 hover:text-[#F7F6EF]"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
