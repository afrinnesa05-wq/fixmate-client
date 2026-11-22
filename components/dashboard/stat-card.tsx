import { ArrowRight, TrendingUp } from "lucide-react"

import type { StatItem } from "@/lib/data"
import { cn } from "cn"

type StatCardProps = {
  stat: StatItem
  className?: string
}

export function StatCard({ stat, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-[#5C6353] uppercase">
          {stat.label}
        </span>
        {stat.trend === "up" ? (
          <TrendingUp className="size-4 text-[#596B3F]" />
        ) : stat.trend === "down" ? (
          <ArrowRight className="size-4 -rotate-45 text-[#5C6353]" />
        ) : (
          <ArrowRight className="size-4 text-[#A8B39A]" />
        )}
      </div>
      <span className="text-3xl font-semibold text-[#30352B]">
        {stat.value}
      </span>
      <span className="text-xs text-[#5C6353]">{stat.detail}</span>
    </div>
  )
}
