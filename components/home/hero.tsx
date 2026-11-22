"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BadgeCheck, Search, ShieldCheck, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Verified technicians" },
  { icon: ShieldCheck, label: "90-day repair warranty" },
  { icon: Wallet, label: "Pay after completion" },
] as const

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(
      trimmed
        ? `/services?q=${encodeURIComponent(trimmed)}`
        : "/services"
    )
  }

  return (
    <section className="relative overflow-hidden bg-[#F7F6F0]">
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 hidden h-72 w-72 translate-x-24 -translate-y-24 rounded-full bg-[#E8DFC9]/60 blur-2xl lg:block"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#596B3F]/25 bg-[#596B3F]/10 px-3 py-1 text-xs font-semibold text-[#596B3F]">
            <BadgeCheck className="size-3.5" />
            Trusted home-service repairs
          </span>

          <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-[#30352B] sm:text-5xl">
            Broken Device?{" "}
            <span className="text-[#596B3F]">
              Get It Fixed by Verified Technicians
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[#5C6353] sm:text-lg">
            FixMate connects you with vetted local technicians for smartphone,
            appliance and electronics repairs. Book in minutes, track every step
            and pay only after the job is done.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What needs fixing? e.g. AC, laptop, fridge"
                aria-label="Search services"
                className="h-12 border-[#D8D6C9] pl-9 text-[#30352B] placeholder:text-[#8A8F82]"
              />
            </div>
            <Button
              type="submit"
              className="h-12 bg-[#596B3F] px-6 font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Search Services
            </Button>
          </form>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5C6353]">
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-1.5">
                <point.icon className="size-4 text-[#596B3F]" />
                {point.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -right-4 -bottom-4 hidden h-40 w-40 rounded-2xl bg-[#E8DFC9] sm:block"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#D8D6C9] shadow-md sm:aspect-[5/4]">
            <Image
              src="/images/hero-repair-technician.jpg"
              alt="Verified technician repairing an air conditioning unit on site"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
