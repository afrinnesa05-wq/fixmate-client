"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { HandCoins, Inbox, Plus, Star } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { fetchBookings, type Booking } from "@/lib/api/bookings"
import { fetchServices } from "@/lib/api/services"
import { authClient } from "@/lib/auth-client"
import type { StatItem } from "@/lib/data"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bookings: Booking[]; serviceCount: number }

export default function TechnicianDashboardPage() {
  const { data: session } = authClient.useSession()
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const load = useCallback((signal?: AbortSignal) => {
    Promise.all([
      fetchBookings("technician", signal),
      fetchServices({ technicianId: "me", limit: 50, signal }),
    ])
      .then(([bookings, services]) => {
        if (signal?.aborted) return
        setState({
          status: "ready",
          bookings,
          serviceCount: services.length,
        })
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
  const pending = bookings.filter((b) => b.status === "requested")
  const recentEarnings = bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "paid")
    .slice(0, 4)

  const stats: StatItem[] = useMemo(() => {
    const active = bookings.filter((b) =>
      ["accepted", "in_progress"].includes(b.status)
    ).length
    const completed = bookings.filter((b) => b.status === "completed").length
    const earnings = bookings
      .filter((b) => b.status === "completed" && b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.finalAmount ?? b.amount), 0)
    const items: StatItem[] = [
      { label: "New requests", value: String(pending.length), detail: "Awaiting response", trend: "up" },
      { label: "Active jobs", value: String(active), detail: "Accepted or in progress", trend: "flat" },
      { label: "Completed", value: String(completed), detail: `Paid total $${earnings}`, trend: "up" },
      {
        label: "Listed services",
        value: state.status === "ready" ? String(state.serviceCount) : "—",
        detail: "In your catalogue",
        trend: "flat",
      },
    ]
    return items
  }, [bookings, pending.length, state])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your incoming requests, active jobs and earnings at a glance."
        actions={
          <Button
            render={<Link href="/dashboard/technician/add-service" />}
            nativeButton={false}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            <Plus className="size-4" />
            Add service
          </Button>
        }
      />

      {state.status === "error" ? (
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
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#30352B]">
              <Inbox className="size-5 text-[#596B3F]" />
              New requests
            </h2>
            <Link
              href="/dashboard/technician/requests"
              className="text-sm font-medium text-[#596B3F] hover:underline"
            >
              View all
            </Link>
          </div>

          {state.status === "loading" ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-[#EFEEE7]" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#5C6353]">
              No pending requests right now.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[#D8D6C9]">
              {pending.slice(0, 5).map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#30352B]">
                      {booking.serviceName}
                    </p>
                    <p className="text-xs text-[#5C6353]">
                      {booking.customerName} · {booking.date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-[#596B3F]">
                      ${booking.amount}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#30352B]">
              <HandCoins className="size-5 text-[#596B3F]" />
              Recent earnings
            </h2>
            <Link
              href="/dashboard/technician/requests"
              className="text-sm font-medium text-[#596B3F] hover:underline"
            >
              Details
            </Link>
          </div>
          {recentEarnings.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#5C6353]">
              Earnings appear here once jobs are completed and paid.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[#D8D6C9]">
              {recentEarnings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#30352B]">
                      {booking.serviceName}
                    </p>
                    <p className="text-xs text-[#5C6353]">{booking.date}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-[#596B3F]">
                      +${booking.finalAmount ?? booking.amount}
                    </span>
                    <StatusBadge status={booking.paymentStatus} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#E8DFC9]">
            <Star className="size-5 text-[#414A35]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#30352B]">
              Keep your rating high
            </p>
            <p className="text-xs text-[#5C6353]">
              Complete requests on time to stay visible in the catalogue.
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/dashboard/technician/my-services" />}
          nativeButton={false}
          variant="outline"
          className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
        >
          Manage my services
        </Button>
      </section>
    </div>
  )
}
