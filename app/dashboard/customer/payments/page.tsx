"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Banknote, CircleDollarSign, Receipt, RefreshCw } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
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
import { fetchPayments, startCheckout, type Payment } from "@/lib/api/payments"
import { fetchBookings, type Booking } from "@/lib/api/bookings"
import type { StatItem } from "@/lib/data"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; payments: Payment[]; outstanding: Booking[] }

export default function CustomerPaymentsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback((signal?: AbortSignal) => {
    Promise.all([
      fetchPayments("customer", signal),
      fetchBookings("customer", signal),
    ])
      .then(([payments, bookings]) => {
        if (signal?.aborted) return
        const outstanding = bookings.filter(
          (b) => b.status === "completed" && b.paymentStatus === "unpaid"
        )
        setState({ status: "ready", payments, outstanding })
      })
      .catch((error: unknown) => {
        if (signal?.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't load your payments right now.",
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

  const summary: StatItem[] = useMemo(() => {
    const payments = state.status === "ready" ? state.payments : []
    const outstandingBookings =
      state.status === "ready" ? state.outstanding : []
    const paidTotal = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0)
    const outstandingTotal = outstandingBookings.reduce(
      (sum, b) => sum + (b.finalAmount ?? b.amount),
      0
    )
    const refundedTotal = payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0)
    return [
      {
        label: "Total Paid",
        value: `$${paidTotal}`,
        detail: "Across all completed bookings",
        trend: "up",
      },
      {
        label: "Outstanding",
        value: `$${outstandingTotal}`,
        detail: `${outstandingBookings.length} unpaid bookings`,
        trend: "down",
      },
      {
        label: "Refunded",
        value: `$${refundedTotal}`,
        detail: "Returned to original method",
        trend: "flat",
      },
    ]
  }, [state])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Review invoices, settle outstanding balances and track refunds."
        actions={
          <Button
            render={<Link href="/dashboard/customer/bookings" />}
            nativeButton={false}
            variant="outline"
            className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            View bookings
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard stat={summary[0]} />
        <StatCard stat={summary[1]} />
        <StatCard stat={summary[2]} />
      </div>

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Loading payments" className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={Receipt}
          title="Payments unavailable"
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

      {state.status === "ready" ? (
        <>
          {state.outstanding.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-xl border border-[#596B3F]/25 bg-[#596B3F]/10 p-4">
              <p className="text-sm font-medium text-[#414A35]">
                Completed bookings waiting for payment
              </p>
              {state.outstanding.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D8D6C9] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#30352B]">
                      {booking.serviceName}
                    </p>
                    <p className="text-xs text-[#5C6353]">
                      {booking.date} · ${booking.finalAmount ?? booking.amount}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === booking.id}
                    onClick={() => handlePay(booking)}
                    className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                  >
                    <Banknote className="size-3.5" />
                    {busyId === booking.id ? "Redirecting…" : "Pay Now"}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {state.payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Payment records will appear here once bookings are completed."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs text-[#5C6353]">
                      {payment.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.serviceName}
                    </TableCell>
                    <TableCell className="font-medium">${payment.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-[#5C6353]">
                      {payment.method ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#5C6353]">
                      {payment.date}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {payment.status === "pending" ? (
                          <span className="flex items-center gap-1 text-xs text-[#8A8F82]">
                            Processing
                          </span>
                        ) : payment.status === "paid" ? (
                          <span className="flex items-center gap-1 text-xs text-[#8A8F82]">
                            <CircleDollarSign className="size-3.5" />
                            Settled
                          </span>
                        ) : (
                          <span className="px-1 text-xs text-[#8A8F82]">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      ) : null}
    </div>
  )
}
