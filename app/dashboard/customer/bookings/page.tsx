"use client"

import Link from "next/link"
import { Fragment, useCallback, useEffect, useState } from "react"
import {
  CalendarX,
  ChevronDown,
  ChevronUp,
  CreditCard,
  RefreshCw,
} from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { JobTimeline } from "@/components/dashboard/job-timeline"
import { PageHeader } from "@/components/dashboard/page-header"
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
import {
  fetchBookings,
  updateBooking,
  type Booking,
} from "@/lib/api/bookings"
import { startCheckout } from "@/lib/api/payments"
import { ApiError } from "@/lib/api/client"
import { cn } from "cn"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

const ACTIVE_STATUSES = new Set(["requested", "accepted", "in_progress"])

function matchesFilter(booking: Booking, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true
    case "active":
      return ACTIVE_STATUSES.has(booking.status)
    case "completed":
      return booking.status === "completed"
    case "cancelled":
      return booking.status === "cancelled"
  }
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; bookings: Booking[] }

export default function CustomerBookingsPage() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback((signal?: AbortSignal) => {
    fetchBookings("customer", signal)
      .then((bookings) => {
        if (signal?.aborted) return
        setState(
          bookings.length > 0 ? { status: "ready", bookings } : { status: "empty" }
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
              : "We couldn't load your bookings right now.",
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

  async function handleCancel(booking: Booking) {
    if (busyId) return
    setActionError(null)
    setBusyId(booking.id)
    try {
      await updateBooking(booking.id, "cancel")
      load()
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Could not cancel the booking."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handlePay(booking: Booking) {
    if (busyId) return
    setActionError(null)
    setBusyId(booking.id)
    try {
      const { url } = await startCheckout(booking.id)
      window.location.assign(url)
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Could not start the payment."
      )
      setBusyId(null)
    }
  }

  const rows =
    state.status === "ready"
      ? state.bookings.filter((booking) => matchesFilter(booking, filter))
      : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Bookings"
        description="Track every repair request — cancel pending bookings or pay for completed ones."
        actions={
          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            New booking
          </Button>
        }
      />

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#B4553F]/30 bg-[#B4553F]/10 px-4 py-3 text-sm text-[#8C3F2C]"
        >
          {actionError}
        </p>
      ) : null}

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
              <RefreshCw className="size-4" />
              Try again
            </Button>
          }
        />
      ) : null}

      {state.status === "empty" || (state.status === "ready" && rows.length === 0) ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings here"
          description="Bookings matching this filter will appear here."
          action={
            <Button
              render={<Link href="/services" />}
              nativeButton={false}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Browse services
            </Button>
          }
        />
      ) : null}

      {state.status === "ready" && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => {
              const expanded = expandedId === booking.id
              return (
                <Fragment key={booking.id}>
                  <TableRow>
                    <TableCell>
                      <p className="font-medium">{booking.serviceName}</p>
                      <p className="text-xs text-[#5C6353]">{booking.id}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#5C6353]">
                      {booking.date}
                      <br />
                      {booking.time}
                    </TableCell>
                    <TableCell className="max-w-40 text-xs text-[#5C6353]">
                      {booking.address}
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
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-expanded={expanded}
                          aria-label={
                            expanded
                              ? "Hide job progress"
                              : "Show job progress"
                          }
                          onClick={() =>
                            setExpandedId(expanded ? null : booking.id)
                          }
                          className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                        >
                          {expanded ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                          Progress
                        </Button>
                        {booking.status === "requested" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => handleCancel(booking)}
                            className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                          >
                            {busyId === booking.id ? "Cancelling…" : "Cancel"}
                          </Button>
                        ) : booking.status === "completed" &&
                          booking.paymentStatus === "unpaid" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => handlePay(booking)}
                            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                          >
                            <CreditCard className="size-3.5" />
                            {busyId === booking.id ? "Redirecting…" : "Pay Now"}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="bg-[#FBFAF7] px-4 py-4">
                        <JobTimeline booking={booking} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}
