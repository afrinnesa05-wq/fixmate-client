import { Ban, Check } from "lucide-react"

import type { Booking, StatusHistoryEntry } from "@/lib/api/bookings"
import { cn } from "cn"

const FLOW = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "paid", label: "Paid" },
] as const

function historyEntries(booking: Booking): StatusHistoryEntry[] {
  const raw = booking.statusHistory
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (entry): entry is StatusHistoryEntry =>
      !!entry &&
      typeof entry === "object" &&
      typeof entry.status === "string"
  )
}

function lastChangedAt(
  entries: StatusHistoryEntry[],
  status: string
): string | null {
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i]
    if (entry.status === status && entry.changedAt) return entry.changedAt
  }
  return null
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Furthest step reached from live status/payment (no fabricated history). */
function currentIndex(booking: Booking): number {
  if (booking.paymentStatus === "paid") return 4
  switch (booking.status) {
    case "requested":
      return 0
    case "accepted":
      return 1
    case "in_progress":
      return 2
    case "completed":
      return 3
    default:
      return -1
  }
}

type JobTimelineProps = {
  booking: Booking
  className?: string
}

/**
 * Requested → Accepted → In Progress → Completed → Paid.
 * Timestamps only from real statusHistory entries; legacy bookings never crash.
 */
export function JobTimeline({ booking, className }: JobTimelineProps) {
  const entries = historyEntries(booking)
  const cancelled = booking.status === "cancelled"
  const index = cancelled ? -1 : currentIndex(booking)

  if (cancelled) {
    const cancelledAt = lastChangedAt(entries, "cancelled")
    const requestedAt = lastChangedAt(entries, "requested")
    return (
      <div
        className={cn(
          "rounded-lg border border-[#D8D6C9] bg-[#F7F6F0] p-4",
          className
        )}
        aria-label="Job progress"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#EFEEE7] text-[#5C6353]">
            <Ban className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#30352B]">
              Booking cancelled
            </p>
            <p className="text-xs text-[#5C6353]">
              {booking.cancelledBy === "technician"
                ? "Declined by the assigned technician."
                : booking.cancelledBy === "customer"
                  ? "Cancelled by you."
                  : "This booking will not proceed."}
            </p>
          </div>
        </div>
        <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#5C6353]">
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-[#596B3F]" aria-hidden />
            Requested
            {requestedAt ? (
              <span className="text-[#8A8F82]">· {formatTimestamp(requestedAt)}</span>
            ) : null}
          </li>
          <li className="flex items-center gap-1.5">
            <Ban className="size-3.5 text-[#5C6353]" aria-hidden />
            Cancelled
            {cancelledAt ? (
              <span className="text-[#8A8F82]">· {formatTimestamp(cancelledAt)}</span>
            ) : null}
          </li>
        </ol>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-[#D8D6C9] bg-[#F7F6F0] p-4",
        className
      )}
      aria-label="Job progress"
    >
      <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {FLOW.map((step, i) => {
          const isCurrent = i === index
          const stepDone =
            i < index ||
            (isCurrent &&
              (step.key === "paid"
                ? booking.paymentStatus === "paid"
                : step.key === booking.status))
          const timestamp = lastChangedAt(entries, step.key)

          return (
            <li
              key={step.key}
              className={cn(
                "relative flex flex-1 items-start gap-3 pb-4 last:pb-0 sm:pb-0",
                i < FLOW.length - 1 && "sm:pr-4"
              )}
            >
              {i < FLOW.length - 1 ? (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-4 top-8 hidden h-px w-[calc(100%-1rem)] sm:block",
                      i < index ? "bg-[#596B3F]" : "bg-[#D8D6C9]"
                    )}
                  />
                  <span
                    aria-hidden
                    className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px bg-[#D8D6C9] sm:hidden"
                  />
                </>
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  stepDone
                    ? "border-[#596B3F] bg-[#596B3F] text-[#F7F6F0]"
                    : isCurrent
                      ? "border-[#596B3F] bg-white text-[#596B3F]"
                      : "border-[#D8D6C9] bg-white text-[#8A8F82]"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {stepDone ? (
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  i + 1
                )}
              </span>

              <span className="min-w-0 pt-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    stepDone || isCurrent ? "text-[#30352B]" : "text-[#8A8F82]"
                  )}
                >
                  {step.label}
                </span>
                <span className="block text-[11px] leading-snug text-[#5C6353]">
                  {timestamp
                    ? formatTimestamp(timestamp)
                    : stepDone || isCurrent
                      ? "—"
                      : "Pending"}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      {!entries.length ? (
        <p className="mt-3 text-[11px] text-[#8A8F82]">
          Detailed timestamps appear as the job progresses.
        </p>
      ) : null}
    </div>
  )
}
