"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarX } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
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
import { cn } from "cn"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; bookings: Booking[] }

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const load = useCallback((signal?: AbortSignal) => {
    fetchBookings("all", signal)
      .then((bookings) => {
        if (signal?.aborted) return
        setState(
          bookings.length > 0
            ? { status: "ready", bookings }
            : { status: "empty" }
        )
      })
      .catch((error: unknown) => {
        if (signal?.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't load bookings right now.",
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

  const all = state.status === "ready" ? state.bookings : []
  const rows = all.filter((booking) => {
    if (filter !== "all" && booking.status !== filter) return false
    if (search) {
      const needle = search.toLowerCase()
      return (
        booking.serviceName.toLowerCase().includes(needle) ||
        booking.customerName.toLowerCase().includes(needle) ||
        booking.id.toLowerCase().includes(needle)
      )
    }
    return true
  })

  const totalValue = all
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + (booking.finalAmount ?? booking.amount), 0)
  const activeCount = all.filter((booking) =>
    ["requested", "accepted", "in_progress"].includes(booking.status)
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bookings"
        description="Every repair booking across the platform, with live status and payment state."
        actions={
          <SearchInput
            placeholder="Search bookings…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-[#5C6353] uppercase">
            Total bookings
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#30352B]">
            {state.status === "ready" ? all.length : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-[#5C6353] uppercase">
            Active now
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#30352B]">
            {state.status === "ready" ? activeCount : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-[#5C6353] uppercase">
            Booked value
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#596B3F]">
            ${state.status === "ready" ? totalValue : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter bookings">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === option.key
                ? "border-[#596B3F] bg-[#596B3F] text-[#F7F6F0]"
                : "border-[#D8D6C9] bg-white text-[#30352B] hover:border-[#596B3F]/40 hover:text-[#596B3F]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Loading bookings" className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={CalendarX}
          title="Bookings unavailable"
          description={state.message}
          action={
            <Button
              type="button"
              onClick={() => retry()}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Try again
            </Button>
          }
        />
      ) : null}

      {state.status === "empty" || (state.status === "ready" && rows.length === 0) ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings found"
          description="Bookings matching this filter will appear here."
        />
      ) : null}

      {state.status === "ready" && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => (
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
                  <br />
                  {booking.time}
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
      ) : null}
    </div>
  )
}
