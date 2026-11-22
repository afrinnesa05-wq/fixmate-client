import Image from "next/image"
import Link from "next/link"
import { User, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isRenderableImage, type ServiceCardData } from "@/lib/api/services"
import { cn } from "cn"

type ServiceCardProps = {
  service: ServiceCardData
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-[#D8D6C9] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#E9EDE4]">
        {isRenderableImage(service.image) ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Wrench className="size-10 text-[#A8B39A]" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {service.category ? (
            <Badge className="bg-[#F7F6F0]/95 text-[#414A35]">
              {service.category}
            </Badge>
          ) : null}
          {service.serviceMode ? (
            <Badge className="bg-[#596B3F]/95 text-[#F7F6F0]">
              {service.serviceMode}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-[#30352B] group-hover:text-[#596B3F]">
          {service.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-[#5C6353]">
          <User className="size-3.5 shrink-0 text-[#596B3F]" />
          <span className="truncate">
            {service.technicianName || "Verified Technician"}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-[#D8D6C9] pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-[#5C6353]">Starting at</span>
            <span className="text-lg font-semibold text-[#596B3F]">
              ${service.startingPrice}
            </span>
          </div>
          <Button
            render={<Link href={`/services/${service.id}`} />}
            nativeButton={false}
            className="w-full bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  )
}
