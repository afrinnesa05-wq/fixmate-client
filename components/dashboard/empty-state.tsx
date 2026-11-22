import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "cn"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-[#D8D6C9] bg-white px-6 py-14 text-center shadow-sm",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-[#E9EDE4]">
        <Icon className="size-5 text-[#596B3F]" />
      </span>
      <p className="text-base font-medium text-[#30352B]">{title}</p>
      <p className="max-w-md text-sm text-[#5C6353]">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
