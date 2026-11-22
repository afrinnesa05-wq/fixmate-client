import { cn } from "cn"

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#D8D6C9] bg-white px-3 py-2 text-sm text-[#30352B] transition outline-none placeholder:text-[#8A8F82] focus-visible:border-[#596B3F] focus-visible:ring-2 focus-visible:ring-[#596B3F]/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
