import Link from "next/link"
import { X } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F6F0]">
      <header className="border-b border-[#D8D6C9] bg-[#F7F6F0]">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="FixMate home">
            <Logo markClassName="size-8" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#E8DFC9]">
          <X className="size-8 text-[#414A35]" strokeWidth={3} />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-[#30352B]">
            Payment Cancelled
          </h1>
          <p className="text-sm leading-relaxed text-[#5C6353] sm:text-base">
            No money has been taken. You can retry the payment at any time from
            your bookings or payments page.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            render={<Link href="/dashboard/customer/payments" />}
            nativeButton={false}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            Back to payments
          </Button>
          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            variant="outline"
            className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            Keep browsing services
          </Button>
        </div>
      </main>

      <footer className="border-t border-[#D8D6C9] py-5 text-center text-xs text-[#5C6353]">
        © FixMate — home repairs, made simple.
      </footer>
    </div>
  )
}
