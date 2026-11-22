import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-[#E8DFC9] text-[#414A35]",
  pending: "bg-[#E8DFC9] text-[#414A35]",
  unpaid: "bg-[#E8DFC9] text-[#414A35]",
  accepted: "bg-[#A8B39A]/40 text-[#414A35]",
  active: "bg-[#A8B39A]/40 text-[#414A35]",
  earning: "bg-[#A8B39A]/40 text-[#414A35]",
  in_progress: "bg-[#596B3F] text-[#F7F6F0]",
  completed: "bg-[#596B3F] text-[#F7F6F0]",
  paid: "bg-[#596B3F] text-[#F7F6F0]",
  approved: "bg-[#596B3F] text-[#F7F6F0]",
  cancelled: "bg-[#EFEEE7] text-[#5C6353]",
  declined: "bg-[#EFEEE7] text-[#5C6353]",
  refunded: "bg-[#EFEEE7] text-[#5C6353]",
  payout: "bg-[#EFEEE7] text-[#5C6353]",
  fee: "bg-[#EFEEE7] text-[#5C6353]",
  suspended: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
}

type StatusBadgeProps = {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label =
    STATUS_LABELS[status] ??
    status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")

  return (
    <Badge
      className={cn(
        "border-transparent",
        STATUS_STYLES[status] ?? "bg-[#EFEEE7] text-[#5C6353]",
        className
      )}
    >
      {label}
    </Badge>
  )
}
