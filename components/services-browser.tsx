"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Inbox, RefreshCw, Search, Wrench } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categories } from "@/lib/data"
import {
  fetchServices,
  ServicesApiError,
  type ServiceCardData,
} from "@/lib/api/services"
import { cn } from "cn"

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

const SERVICE_MODES = [
  { value: "", label: "All modes" },
  { value: "on-site", label: "On-site" },
  { value: "in-shop", label: "In-shop" },
  { value: "remote", label: "Remote" },
] as const

/** Accepts slug (`ac`) or display name (`AC`) from category card links. */
function normalizeCategorySlug(raw: string): string {
  if (!raw) return ""
  const lower = raw.toLowerCase()
  const bySlug = categories.find((c) => c.slug.toLowerCase() === lower)
  if (bySlug) return bySlug.slug
  const byName = categories.find((c) => c.name.toLowerCase() === lower)
  return byName ? byName.slug : raw
}

export function ServicesBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = normalizeCategorySlug(searchParams.get("category") ?? "")
  const query = searchParams.get("q") ?? ""
  const serviceMode = searchParams.get("serviceMode") ?? ""
  const sort = searchParams.get("sort") ?? "newest"

  const [state, setState] = useState<LoadState>({ status: "loading" })

  const sortOptions: Record<string, { sort: "createdAt" | "price" | "title"; order: "asc" | "desc" }> = {
    newest: { sort: "createdAt", order: "desc" },
    "price-asc": { sort: "price", order: "asc" },
    "price-desc": { sort: "price", order: "desc" },
    title: { sort: "title", order: "asc" },
  }
  const activeSort = sortOptions[sort] ?? sortOptions.newest

  const updateParams = useCallback(
    (next: {
      category?: string
      q?: string
      serviceMode?: string
      sort?: string
      reset?: boolean
    }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.reset) {
        params.delete("category")
        params.delete("q")
        params.delete("serviceMode")
        params.delete("sort")
        const qs = params.toString()
        router.replace(qs ? `/services?${qs}` : "/services", { scroll: false })
        return
      }
      const nextCategory =
        next.category !== undefined ? normalizeCategorySlug(next.category) : category
      const nextQ = next.q !== undefined ? next.q : query
      const nextMode = next.serviceMode !== undefined ? next.serviceMode : serviceMode
      const nextSort = next.sort !== undefined ? next.sort : sort
      if (nextCategory) params.set("category", nextCategory)
      else params.delete("category")
      if (nextQ) params.set("q", nextQ)
      else params.delete("q")
      if (nextMode) params.set("serviceMode", nextMode)
      else params.delete("serviceMode")
      if (nextSort && nextSort !== "newest") params.set("sort", nextSort)
      else params.delete("sort")
      const qs = params.toString()
      router.replace(qs ? `/services?${qs}` : "/services", { scroll: false })
    },
    [category, query, serviceMode, sort, router, searchParams]
  )

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
              ? "The services catalogue will appear here once the backend API is connected."
              : "We couldn't load services right now."
          setState({ status: "error", message })
        })
    },
    []
  )

  const load = useCallback(
    (signal?: AbortSignal) => {
      setState({ status: "loading" })
      applyResult(
        fetchServices({
          approvalStatus: "approved",
          isAvailable: true,
          category: category || undefined,
          serviceMode: serviceMode || undefined,
          q: query || undefined,
          sort: activeSort.sort,
          order: activeSort.order,
          limit: 50,
          signal,
        }),
        signal
      )
    },
    [applyResult, category, serviceMode, query, activeSort]
  )

  useEffect(() => {
    const controller = new AbortController()
    applyResult(
      fetchServices({
        approvalStatus: "approved",
        isAvailable: true,
        category: category || undefined,
        serviceMode: serviceMode || undefined,
        q: query || undefined,
        sort: activeSort.sort,
        order: activeSort.order,
        limit: 50,
        signal: controller.signal,
      }),
      controller.signal
    )
    return () => controller.abort()
  }, [applyResult, category, serviceMode, query, activeSort])

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextQuery = String(formData.get("q") ?? "").trim()
    updateParams({ q: nextQuery })
  }

  const chips = [
    { slug: "", label: "All" },
    ...categories.map((item) => ({ slug: item.slug, label: item.name })),
  ]

  const activeCategoryName = categories.find(
    (item) => item.slug === category
  )?.name

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Services"
        title={activeCategoryName ? `${activeCategoryName} repairs` : "All repair services"}
        description="Browse approved and available services from verified technicians. Filter by category or search for a specific repair."
      />

      <form
        onSubmit={handleSearch}
        role="search"
        className="mt-6 flex max-w-xl gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
          <Input
            key={query}
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search services…"
            aria-label="Search services"
            className="pl-9"
          />
        </div>
        <Button
          type="submit"
          className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          Search
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {chips.map((chip) => {
            const active = category === chip.slug
            return (
              <button
                key={chip.slug || "all"}
                type="button"
                onClick={() => updateParams({ category: chip.slug })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-[#596B3F] bg-[#596B3F] text-[#F7F6F0]"
                    : "border-[#D8D6C9] bg-white text-[#30352B] hover:border-[#596B3F]/40 hover:text-[#596B3F]"
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#5C6353]">
            Mode
            <select
              value={serviceMode}
              onChange={(event) => updateParams({ serviceMode: event.target.value })}
              aria-label="Filter by service mode"
              className="h-9 rounded-lg border border-[#D8D6C9] bg-white px-2 text-sm text-[#30352B] outline-none focus-visible:border-[#596B3F]"
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode.value || "all"} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#5C6353]">
            Sort
            <select
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
              aria-label="Sort services"
              className="h-9 rounded-lg border border-[#D8D6C9] bg-white px-2 text-sm text-[#30352B] outline-none focus-visible:border-[#596B3F]"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>

          {category || query || serviceMode || sort !== "newest" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => updateParams({ reset: true })}
              className="h-9 border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        {state.status === "loading" ? (
          <div
            aria-busy="true"
            aria-label="Loading services"
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
              No services found
            </p>
            <p className="max-w-md text-sm text-[#5C6353]">
              Nothing matches the current filters yet — try another category or
              clear your search.
            </p>
            <Button
              type="button"
              onClick={() => updateParams({ reset: true })}
              variant="outline"
              className="mt-1 border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
            >
              Clear filters
            </Button>
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

      <p className="mt-10 text-center text-sm text-[#5C6353]">
        Can&apos;t find your device?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-[#596B3F] underline-offset-4 hover:underline"
        >
          Send a custom request
        </Link>
      </p>
    </div>
  )
}
