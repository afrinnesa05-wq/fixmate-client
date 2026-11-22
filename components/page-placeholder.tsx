import type { LucideIcon } from "lucide-react"

type PagePlaceholderProps = {
  title: string
  description: string
  icon: LucideIcon
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <div className="rounded-xl border border-[#A19F9B]/30 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span className="inline-flex rounded-lg bg-[#0F0DC2]/10 p-2.5 text-[#0F0DC2]">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[#0E0C0D]">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#5D5148]">
            {description}
          </p>
        </div>
      </div>
      <p className="mt-6 text-xs font-medium tracking-widest text-[#A19F9B] uppercase">
        Coming soon
      </p>
    </div>
  )
}
