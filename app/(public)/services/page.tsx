import { Suspense } from "react"

import { ServicesBrowser } from "@/components/services-browser"

function BrowserFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="h-20 w-full max-w-2xl animate-pulse rounded-lg bg-[#EFEEE7]" />
      <div className="mt-6 h-10 w-full max-w-xl animate-pulse rounded-lg bg-[#EFEEE7]" />
      <div className="mt-6 h-8 w-full max-w-3xl animate-pulse rounded bg-[#EFEEE7]" />
      <div
        aria-busy="true"
        aria-label="Loading services"
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/3] animate-pulse rounded-xl bg-[#EFEEE7]"
          />
        ))}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<BrowserFallback />}>
      <ServicesBrowser />
    </Suspense>
  )
}
