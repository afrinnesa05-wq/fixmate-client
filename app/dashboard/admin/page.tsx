"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowRight, Users, Wrench } from "lucide-react"

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
import { fetchUsers, type AdminUser } from "@/lib/api/users"
import { fetchServices } from "@/lib/api/services"
import type { StatItem } from "@/lib/data"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bookings: Booking[]; users: AdminUser[]; serviceCount: number; pendingServiceCount: number }

export default function AdminDashboardPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const load = useCallback((signal?: AbortSignal) => {
    Promise.all([
      fetchBookings("all", signal),
      fetchUsers(signal),
      fetchServices({ limit: 100, signal }),
    ])
      .then(([bookings, users, services]) => {
        if (signal?.aborted) return
        setState({
          status: "ready",
          bookings,
          users,
          serviceCount: services.length,
          pendingServiceCount: services.filter((s) => s.approvalStatus === "pending")
            .length,
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
              : "We couldn't load the platform overview.",
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

  const bookings = useMemo(
    () => (state.status === "ready" ? state.bookings : []),
    [state]
  )
  const users = useMemo(
    () => (state.status === "ready" ? state.users : []),
    [state]
  )
  const recentBookings = bookings.slice(0, 5)
  const recentUsers = users.slice(0, 5)
  const pendingUsers = users.filter((u) => u.status === "pending")

  const stats: StatItem[] = useMemo(() => {
    if (state.status !== "ready") {
      return [
        { label: "Total users", value: "—", detail: "Loading", trend: "flat" },
        { label: "Total bookings", value: "—", detail: "Loading", trend: "flat" },
        { label: "Live services", value: "—", detail: "Loading", trend: "flat" },
        { label: "Pending reviews", value: "—", detail: "Loading", trend: "flat" },
      ]
    }
    return [
      {
        label: "Total users",
        value: String(users.length),
        detail: `${users.filter((u) => u.role === "technician").length} technicians`,
        trend: "up",
      },
      {
        label: "Total bookings",
        value: String(bookings.length),
        detail: `${bookings.filter((b) => b.status === "completed").length} completed`,
        trend: "flat",
      },
      {
        label: "Live services",
        value: String(state.serviceCount),
        detail: "In the catalogue",
        trend: "up",
      },
      {
        label: "Pending reviews",
        value: String(state.pendingServiceCount),
        detail: `${pendingUsers.length} pending users`,
        trend: "flat",
      },
    ]
  }, [state, users, bookings, pendingUsers.length])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Platform Overview"
        description="Users, services and booking activity across FixMate."
        actions={
          <>
            <Button
              render={<Link href="/dashboard/admin/users" />}
              nativeButton={false}
              variant="outline"
              className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
            >
              <Users className="size-4" />
              Manage users
            </Button>
            <Button
              render={<Link href="/dashboard/admin/services" />}
              nativeButton={false}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <Wrench className="size-4" />
              Review services
            </Button>
          </>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#30352B]">
              Recent bookings
            </h2>
            <Link
              href="/dashboard/admin/bookings"
              className="flex items-center gap-1 text-sm font-medium text-[#596B3F] hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {state.status === "loading" ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-[#EFEEE7]" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 text-sm text-[#5C6353] shadow-sm">
              No bookings yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <p className="font-medium">{booking.serviceName}</p>
                      <p className="text-xs text-[#5C6353]">{booking.id}</p>
                    </TableCell>
                    <TableCell className="text-[#5C6353]">
                      {booking.customerName}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#30352B]">
              Recent signups
            </h2>
            <Link
              href="/dashboard/admin/users"
              className="text-sm font-medium text-[#596B3F] hover:underline"
            >
              All users
            </Link>
          </div>
          {state.status === "loading" ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-[#EFEEE7]" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[#D8D6C9]">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#30352B]">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-[#5C6353]">
                      {user.email}
                    </p>
                  </div>
                  <StatusBadge status={user.status} />
                </li>
              ))}
            </ul>
          )}
          {pendingUsers.length > 0 ? (
            <p className="rounded-lg bg-[#E8DFC9]/60 px-3 py-2 text-xs text-[#414A35]">
              {pendingUsers.length} account{pendingUsers.length > 1 ? "s" : ""}{" "}
              awaiting review.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
