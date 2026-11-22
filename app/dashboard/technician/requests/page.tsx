"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Inbox, RefreshCw } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
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
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import {
  fetchBookings,
  updateBooking,
  type Booking,
} from "@/lib/api/bookings"
import { cn } from "cn"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "requested", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; bookings: Booking[] }

export default function TechnicianRequestsPage() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [finalAmount, setFinalAmount] = useState("")

  const load = useCallback((signal?: AbortSignal) => {
    fetchBookings("technician", signal)
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
              : "We couldn't load your requests right now.",
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

  async function runAction(booking: Booking, action: "accept" | "decline" | "start") {
    if (busyId) return
    setActionError(null)
    setBusyId(booking.id)
    try {
      await updateBooking(booking.id, action)
      load()
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Could not update the request."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleComplete(booking: Booking) {
    if (busyId || completingId) return
    setActionError(null)
    setCompletingId(booking.id)
    setFinalAmount(String(booking.amount))
  }

  async function submitComplete(booking: Booking) {
    if (busyId) return
    setActionError(null)
    const amount = Number(finalAmount)
    if (!Number.isFinite(amount) || amount < 0) {
      setActionError("Enter a valid final amount.")
      return
    }
    setBusyId(booking.id)
    try {
      await updateBooking(booking.id, "complete", amount)
      setCompletingId(null)
      setFinalAmount("")
      load()
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Could not complete the job."
      )
    } finally {
      setBusyId(null)
    }
  }

  const rows =
    state.status === "ready"
      ? state.bookings.filter(
          (booking) => filter === "all" || booking.status === filter
        )
      : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Service Requests"
        description="Respond to incoming customer requests, then add a final amount when the job is done."
      />

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#B4553F]/30 bg-[#B4553F]/10 px-4 py-3 text-sm text-[#8C3F2C]"
        >
          {actionError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter requests">
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
        <div aria-busy="true" aria-label="Loading requests" className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={Inbox}
          title="Requests unavailable"
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
          icon={Inbox}
          title="No requests found"
          description="Requests matching this filter will appear here."
        />
      ) : null}

      {state.status === "ready" && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Proposed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <p className="font-medium">{booking.serviceName}</p>
                  <p className="text-xs text-[#5C6353]">
                    {booking.id} · {booking.address}
                  </p>
                </TableCell>
                <TableCell className="text-[#5C6353]">
                  {booking.customerName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-[#5C6353]">
                  {booking.date}
                  <br />
                  {booking.time}
                </TableCell>
                <TableCell className="font-medium">${booking.amount}</TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="font-medium text-[#596B3F]">
                  {booking.finalAmount !== null ? `$${booking.finalAmount}` : "—"}
                </TableCell>
                <TableCell>
                  {completingId === booking.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={finalAmount}
                        onChange={(event) => setFinalAmount(event.target.value)}
                        aria-label="Final amount"
                        className="h-8 w-24 border-[#D8D6C9] text-[#30352B]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === booking.id}
                        onClick={() => submitComplete(booking)}
                        className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                      >
                        {busyId === booking.id ? "Saving…" : "Confirm"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCompletingId(null)
                          setFinalAmount("")
                        }}
                        className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {booking.status === "requested" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => runAction(booking, "decline")}
                            className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                          >
                            Decline
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => runAction(booking, "accept")}
                            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                          >
                            {busyId === booking.id ? "Working…" : "Accept"}
                          </Button>
                        </>
                      ) : booking.status === "accepted" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => runAction(booking, "start")}
                            className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
                          >
                            Start
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busyId === booking.id}
                            onClick={() => handleComplete(booking)}
                            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                          >
                            Mark Complete
                          </Button>
                        </>
                      ) : booking.status === "in_progress" ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === booking.id}
                          onClick={() => handleComplete(booking)}
                          className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                        >
                          Mark Complete
                        </Button>
                      ) : (
                        <span className="px-1 py-1 text-xs text-[#8A8F82]">—</span>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}

      <p className="text-xs text-[#5C6353]">
        State changes are validated by the backend.{" "}
        <Link
          href="/dashboard/technician"
          className="font-medium text-[#596B3F] hover:underline"
        >
          Back to overview
        </Link>
      </p>
    </div>
  )
}
