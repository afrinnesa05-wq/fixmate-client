import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Category } from "@/lib/data"
import { cn } from "cn"

type CategoryCardProps = {
  category: Category
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/services?category=${category.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-[#D8D6C9] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 p-4">
        <span className="text-base font-semibold text-[#30352B]">
          {category.name}
        </span>
        <span className="line-clamp-2 text-xs leading-relaxed text-[#5C6353]">
          {category.description}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#596B3F]">
          Browse
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
