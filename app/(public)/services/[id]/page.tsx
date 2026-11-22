import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Star,
  User,
  Wrench,
} from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { RequestServiceForm } from "@/components/services/request-service-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  fetchServiceById,
  isRenderableImage,
  ServicesApiError,
  type ServiceDetailData,
} from "@/lib/api/services"
import { getCategory } from "@/lib/data"

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>
}

function DetailUnavailable({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#E8DFC9]">
        <Wrench className="size-6 text-[#414A35]" />
      </span>
      <h1 className="text-2xl font-semibold text-[#30352B]">
        Service unavailable
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[#5C6353]">
        {message}
      </p>
      <div className="mt-2 flex gap-3">
        <Button
          render={<Link href="/services" />}
          nativeButton={false}
          className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          <ArrowLeft className="size-4" />
          Back to services
        </Button>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="outline"
          className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
        >
          Go home
        </Button>
      </div>
    </div>
  )
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params

  let service: ServiceDetailData | null = null
  let errorMessage = "This service could not be loaded right now."

  try {
    service = await fetchServiceById(id)
  } catch (error) {
    if (error instanceof ServicesApiError) {
      if (error.kind === "unconfigured") {
        errorMessage =
          "Service details load from the backend API — set NEXT_PUBLIC_API_BASE_URL to connect it."
      } else if (error.kind === "http") {
        errorMessage = "This service does not exist or is no longer listed."
      }
    }
  }

  if (!service) {
    return <DetailUnavailable message={errorMessage} />
  }

  const category = getCategory(service.category.toLowerCase().replace(/[^a-z]+/g, "-"))
  const categoryName = service.category || category?.name || ""

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#596B3F] hover:underline"
      >
        <ArrowLeft className="size-4" />
        All services
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#D8D6C9] bg-[#E9EDE4] shadow-sm">
            {isRenderableImage(service.image) ? (
              <Image
                src={service.image}
                alt={service.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Wrench className="size-12 text-[#A8B39A]" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryName ? (
              <Badge className="bg-[#E8DFC9] text-[#414A35]">
                {categoryName}
              </Badge>
            ) : null}
            {service.serviceMode ? (
              <Badge className="bg-[#596B3F] text-[#F7F6F0]">
                {service.serviceMode}
              </Badge>
            ) : null}
            {service.isAvailable ? (
              <Badge className="bg-[#A8B39A]/40 text-[#414A35]">
                Available now
              </Badge>
            ) : null}
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#30352B] sm:text-4xl">
              {service.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5C6353]">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-[#596B3F] text-[#596B3F]" />
                <span className="font-medium text-[#30352B]">
                  {service.rating.toFixed(1)}
                </span>
                ({service.reviewCount} reviews)
              </span>
              {service.duration ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {service.duration}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-[#596B3F]" />
                Verified technician
              </span>
            </div>
          </div>

          {service.description ? (
            <div>
              <h2 className="text-lg font-semibold text-[#30352B]">
                About this service
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5C6353] sm:text-base">
                {service.description}
              </p>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 self-start rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div>
            <span className="text-sm text-[#5C6353]">Starting at</span>
            <p className="text-4xl font-semibold text-[#596B3F]">
              ${service.startingPrice}
            </p>
          </div>

          <div className="flex items-center gap-3 border-y border-[#D8D6C9] py-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#E9EDE4]">
              <User className="size-5 text-[#596B3F]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#30352B]">
                {service.technicianName || "Verified Technician"}
              </p>
              <p className="text-xs text-[#5C6353]">
                {categoryName || "Repair"} specialist
              </p>
            </div>
          </div>

          <RequestServiceForm serviceId={service.id} />
          <p className="text-center text-xs text-[#5C6353]">
            Pay only after the repair is completed.
          </p>

          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            variant="outline"
            className="w-full border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            Compare other services
          </Button>
        </aside>
      </div>

      <section className="mt-16">
        <SectionHeading
          eyebrow="More repairs"
          title="You might also need"
          description="Explore other approved services in the catalogue."
        />
        <Button
          render={<Link href="/services" />}
          nativeButton={false}
          className="mt-5 bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          Browse all services
          <ArrowLeft className="size-4 rotate-180" />
        </Button>
      </section>
    </div>
  )
}
