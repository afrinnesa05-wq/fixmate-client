"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Check, Loader2, X } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { verifyPayment } from "@/lib/api/payments"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") ?? ""
  const [state, setState] = useState<
    { status: "verifying" } | { status: "paid" } | { status: "unpaid" } | { status: "error"; message: string }
  >({ status: "verifying" })

  useEffect(() => {
    if (!sessionId) {
      // Defer to avoid sync setState during effect
      const id = window.setTimeout(() => {
        setState({ status: "error", message: "Missing payment session reference." })
      }, 0)
      return () => window.clearTimeout(id)
    }
    const controller = new AbortController()
    verifyPayment(sessionId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setState(result.paid ? { status: "paid" } : { status: "unpaid" })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't verify this payment right now.",
        })
      })
    return () => controller.abort()
  }, [sessionId])

  if (state.status === "verifying") {
    return (
      <>
        <span className="flex size-16 items-center justify-center rounded-full bg-[#E9EDE4]">
          <Loader2 className="size-8 animate-spin text-[#596B3F]" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-[#30352B]">
            Confirming payment…
          </h1>
          <p className="text-sm leading-relaxed text-[#5C6353] sm:text-base">
            We are verifying this transaction with the payment provider.
          </p>
        </div>
      </>
    )
  }

  if (state.status === "paid") {
    return (
      <>
        <span className="flex size-16 items-center justify-center rounded-full bg-[#596B3F]">
          <Check className="size-8 text-[#F7F6F0]" strokeWidth={3} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-[#30352B]">
            Payment Successful
          </h1>
          <p className="text-sm leading-relaxed text-[#5C6353] sm:text-base">
            Your payment has been recorded. The booking is marked as paid and
            the technician has been notified.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            render={<Link href="/dashboard/customer/bookings" />}
            nativeButton={false}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            View my bookings
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
            className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            Back to home
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <span className="flex size-16 items-center justify-center rounded-full bg-[#E8DFC9]">
        <X className="size-8 text-[#414A35]" strokeWidth={3} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-[#30352B]">
          {state.status === "unpaid" ? "Payment not completed" : "Verification failed"}
        </h1>
        <p className="text-sm leading-relaxed text-[#5C6353] sm:text-base">
          {state.status === "unpaid"
            ? "This session has not been paid yet. You can retry from your bookings page."
            : state.message}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          render={<Link href="/dashboard/customer/bookings" />}
          nativeButton={false}
          className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          Back to bookings
        </Button>
      </div>
    </>
  )
}

export default function PaymentSuccessPage() {
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
        <Suspense
          fallback={
            <span className="flex size-16 items-center justify-center rounded-full bg-[#E9EDE4]">
              <Loader2 className="size-8 animate-spin text-[#596B3F]" />
            </span>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="border-t border-[#D8D6C9] py-5 text-center text-xs text-[#5C6353]">
        © FixMate — home repairs, made simple.
      </footer>
    </div>
  )
}
