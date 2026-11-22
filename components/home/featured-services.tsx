"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Inbox, RefreshCw, Wrench } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import {
  fetchFeaturedServices,
  ServicesApiError,
  type ServiceCardData,
} from "@/lib/api/services"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; services: ServiceCardData[] }

function SkeletonCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#D8D6C9] bg-white shadow-sm">
      <div className="aspect-[16/10] shrink-0 animate-pulse bg-[#E9EDE4]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#EFEEE7]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#EFEEE7]" />
        <div className="mt-auto flex flex-col gap-3 border-t border-[#D8D6C9] pt-3">
          <div className="h-5 w-full animate-pulse rounded bg-[#EFEEE7]" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-[#EFEEE7]" />
        </div>
      </div>
    </div>
  )
}

export function FeaturedServices() {
  const [state, setState] = useState<LoadState>({ status: "loading" })

  const applyResult = useCallback(
    (promise: Promise<ServiceCardData[]>, signal?: AbortSignal) => {
      promise
        .then((services) => {
          if (signal?.aborted) return
          setState(
            services.length > 0
              ? { status: "ready", services }
              : { status: "empty" }
          )
        })
        .catch((error: unknown) => {
          if (signal?.aborted) return
          if (error instanceof DOMException && error.name === "AbortError") return
          const message =
            error instanceof ServicesApiError && error.kind === "unconfigured"
              ? "Featured services will appear here once the backend API is connected."
              : "We couldn't load featured services right now."
          setState({ status: "error", message })
        })
    },
    []
  )

  const load = useCallback(
    (signal?: AbortSignal) => {
      setState({ status: "loading" })
      applyResult(fetchFeaturedServices(signal), signal)
    },
    [applyResult]
  )

  useEffect(() => {
    const controller = new AbortController()
    applyResult(fetchFeaturedServices(controller.signal), controller.signal)
    return () => controller.abort()
  }, [applyResult])

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Featured Services"
          title="Latest approved repairs, ready to book"
          description="Six most recent services from verified technicians — updated straight from our catalogue."
        />
        <Button
          render={<Link href="/services" />}
          nativeButton={false}
          variant="outline"
          className="w-fit border-[#596B3F]/40 bg-transparent text-[#596B3F] hover:bg-[#596B3F]/10 hover:text-[#414A35]"
        >
          View all services
        </Button>
      </div>

      <div className="mt-8">
        {state.status === "loading" ? (
          <div
            aria-busy="true"
            aria-label="Loading featured services"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[#D8D6C9] bg-white px-6 py-14 text-center shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#E8DFC9]">
              <Inbox className="size-5 text-[#414A35]" />
            </span>
            <p className="text-base font-medium text-[#30352B]">
              {state.message}
            </p>
            <p className="max-w-md text-sm text-[#5C6353]">
              The catalogue loads from your backend API — set
              NEXT_PUBLIC_API_BASE_URL to connect it.
            </p>
            <Button
              type="button"
              onClick={() => load()}
              className="mt-1 bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : null}

        {state.status === "empty" ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[#D8D6C9] bg-white px-6 py-14 text-center shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#E9EDE4]">
              <Wrench className="size-5 text-[#596B3F]" />
            </span>
            <p className="text-base font-medium text-[#30352B]">
              No featured services yet
            </p>
            <p className="max-w-md text-sm text-[#5C6353]">
              Once approved services are published, the latest six will show up
              right here.
            </p>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
