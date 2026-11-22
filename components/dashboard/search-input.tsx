import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "cn"

type SearchInputProps = {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function SearchInput({
  placeholder = "Search…",
  className,
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
