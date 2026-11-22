"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDays, Plus, Wallet } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/table"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { fetchBookings, type Booking } from "@/lib/api/bookings"
import { authClient } from "@/lib/auth-client"
import type { StatItem } from "@/lib/data"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bookings: Booking[] }

export default function CustomerDashboardPage() {
  const { data: session } = authClient.useSession()
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const load = useCallback((signal?: AbortSignal) => {
    fetchBookings("customer", signal)
      .then((bookings) => {
        if (signal?.aborted) return
        setState({ status: "ready", bookings })
      })
      .catch((error: unknown) => {
        if (signal?.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't load your dashboard right now.",
        })
      })
  }, [])

  const retry = useCallback(() => {
    setState({ status: "loading" })
    load()
  }, [load])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const firstName =
    session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there"

  const bookings = useMemo(
    () => (state.status === "ready" ? state.bookings : []),
    [state]
  )
  const recent = bookings.slice(0, 5)

  const stats: StatItem[] = useMemo(() => {
    const active = bookings.filter((b) =>
      ["requested", "accepted", "in_progress"].includes(b.status)
    ).length
    const completed = bookings.filter((b) => b.status === "completed").length
    const outstanding = bookings
      .filter((b) => b.status === "completed" && b.paymentStatus === "unpaid")
      .reduce((sum, b) => sum + (b.finalAmount ?? b.amount), 0)
    const paid = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.finalAmount ?? b.amount), 0)
    return [
      { label: "Active bookings", value: String(active), detail: "In progress now", trend: "up" },
      { label: "Completed", value: String(completed), detail: "All time", trend: "flat" },
      { label: "Outstanding", value: `$${outstanding}`, detail: "Awaiting payment", trend: "down" },
      { label: "Total paid", value: `$${paid}`, detail: "Settled bookings", trend: "up" },
    ]
  }, [bookings])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is a quick look at your repairs, bookings and payments."
        actions={
          <>
            <Button
              render={<Link href="/services" />}
              nativeButton={false}
              variant="outline"
              className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
            >
              <CalendarDays className="size-4" />
              Book a service
            </Button>
            <Button
              render={<Link href="/dashboard/customer/payments" />}
              nativeButton={false}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <Wallet className="size-4" />
              View payments
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#30352B]">
            Recent bookings
          </h2>
          <Link
            href="/dashboard/customer/bookings"
            className="text-sm font-medium text-[#596B3F] hover:underline"
          >
            View all
          </Link>
        </div>

        {state.status === "loading" ? (
          <div aria-busy="true" className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-[#EFEEE7]" />
            ))}
          </div>
        ) : state.status === "error" ? (
          <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 text-sm text-[#5C6353] shadow-sm">
            {state.message}{" "}
            <button
              type="button"
              onClick={() => retry()}
              className="font-medium text-[#596B3F] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 text-sm text-[#5C6353] shadow-sm">
            No bookings yet — browse services to request your first repair.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium">{booking.serviceName}</p>
                    <p className="text-xs text-[#5C6353]">{booking.id}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[#5C6353]">
                    {booking.date}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${booking.finalAmount ?? booking.amount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.paymentStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#E9EDE4]">
            <Plus className="size-5 text-[#596B3F]" />
          </span>
          <h3 className="text-base font-semibold text-[#30352B]">
            Need another repair?
          </h3>
          <p className="text-sm text-[#5C6353]">
            Browse approved services and send a request to a verified
            technician.
          </p>
          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            className="mt-2 w-fit bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            Browse services
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#E8DFC9]">
            <Wallet className="size-5 text-[#414A35]" />
          </span>
          <h3 className="text-base font-semibold text-[#30352B]">
            Outstanding balance
          </h3>
          <p className="text-sm text-[#5C6353]">
            You have unpaid bookings — settle them from the payments page.
          </p>
          <Button
            render={<Link href="/dashboard/customer/payments" />}
            nativeButton={false}
            variant="outline"
            className="mt-2 w-fit border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            Go to payments
          </Button>
        </div>
      </section>
    </div>
  )
}
