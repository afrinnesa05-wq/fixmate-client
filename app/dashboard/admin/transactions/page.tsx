"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ReceiptText } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { fetchTransactions, type Transaction } from "@/lib/api/payments"
import type { StatItem } from "@/lib/data"
import { cn } from "cn"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; transactions: Transaction[] }

const TYPE_STYLES: Record<string, string> = {
  earning: "bg-[#A8B39A]/40 text-[#414A35]",
  payout: "bg-[#EFEEE7] text-[#5C6353]",
  refund: "bg-[#E8DFC9] text-[#414A35]",
  fee: "bg-[#EFEEE7] text-[#5C6353]",
}

export default function AdminTransactionsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const load = useCallback((signal?: AbortSignal) => {
    fetchTransactions(signal)
      .then((transactions) => {
        if (signal?.aborted) return
        setState(
          transactions.length > 0
            ? { status: "ready", transactions }
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
              : "We couldn't load transactions right now.",
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

  const transactions = useMemo(
    () => (state.status === "ready" ? state.transactions : []),
    [state]
  )

  const summary: StatItem[] = useMemo(() => {
    const earnings = transactions
      .filter((t) => t.type === "earning")
      .reduce((sum, t) => sum + t.amount, 0)
    const refunds = transactions
      .filter((t) => t.type === "refund")
      .reduce((sum, t) => sum + t.amount, 0)
    return [
      {
        label: "Gross Earnings",
        value: `$${earnings}`,
        detail: "Completed payments",
        trend: "up",
      },
      {
        label: "Transactions",
        value: String(transactions.length),
        detail: "Paid + refunded records",
        trend: "flat",
      },
      {
        label: "Refunds Issued",
        value: `$${refunds}`,
        detail: "Returned to customers",
        trend: "down",
      },
    ]
  }, [transactions])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Platform money movement — earnings, fees, payouts and refunds."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {state.status === "loading" ? (
        <div
          aria-busy="true"
          aria-label="Loading transactions"
          className="flex flex-col gap-3"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]"
            />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={ReceiptText}
          title="Transactions unavailable"
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

      {state.status === "empty" ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Paid bookings will appear here as platform transactions."
        />
      ) : null}

      {state.status === "ready" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs text-[#5C6353]">
                  {transaction.id}
                </TableCell>
                <TableCell className="whitespace-nowrap text-[#5C6353]">
                  {transaction.date}
                </TableCell>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {transaction.type === "earning" ? (
                      <ArrowUpRight className="size-4 shrink-0 text-[#596B3F]" />
                    ) : transaction.type === "refund" ? (
                      <ArrowDownLeft className="size-4 shrink-0 text-[#5C6353]" />
                    ) : (
                      <ReceiptText className="size-4 shrink-0 text-[#5C6353]" />
                    )}
                    {transaction.description}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-transparent capitalize",
                      TYPE_STYLES[transaction.type] ??
                        "bg-[#EFEEE7] text-[#5C6353]"
                    )}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    transaction.type === "earning"
                      ? "text-[#596B3F]"
                      : "text-[#30352B]"
                  )}
                >
                  {transaction.type === "earning" ? "+" : "−"}$
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}
