import { cn } from "cn"

type LogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function Logo({ className, markClassName, textClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        focusable="false"
        className={cn("size-9 shrink-0", markClassName)}
        fill="none"
      >
        <rect width="40" height="40" rx="10" fill="#F28C45" />
        <g
          transform="translate(8 8)"
          stroke="#142B4A"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </g>
      </svg>
      <span
        className={cn(
          "text-xl font-bold tracking-tight text-white",
          textClassName
        )}
      >
        Fix<span className="text-[#F28C45]">Mate</span>
      </span>
    </span>
  )
}
