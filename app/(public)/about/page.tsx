import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, HandCoins, Receipt, ShieldCheck } from "lucide-react"

import { HowItWorks } from "@/components/home/how-it-works"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { SectionHeading } from "@/components/section-heading"
import { Button } from "@/components/ui/button"

const STATS = [
  { value: "7", label: "Repair categories" },
  { value: "4.9", label: "Average rating" },
  { value: "90-day", label: "Repair warranty" },
  { value: "24/7", label: "Booking access" },
] as const

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Verified technicians only",
    description:
      "Identity, skills and reviews are checked before anyone joins the platform.",
  },
  {
    icon: Receipt,
    title: "Upfront, honest quotes",
    description:
      "Starting prices are public and final amounts are confirmed before work begins.",
  },
  {
    icon: ShieldCheck,
    title: "Repairs that last",
    description:
      "Every completed job is covered by a 90-day parts-and-labour warranty.",
  },
  {
    icon: HandCoins,
    title: "Pay when it works",
    description:
      "Payment is released only after you confirm the repair is done right.",
  },
] as const

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#F7F6F0]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#596B3F] uppercase">
              About FixMate
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-[#30352B] sm:text-5xl">
              Home repairs, handled by people you can trust
            </h1>
            <p className="text-base leading-relaxed text-[#5C6353] sm:text-lg">
              FixMate is a modern home-service platform that connects households
              with verified technicians for smartphone, computer and appliance
              repairs. We keep the process transparent end to end — from the
              first request to the final payment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                render={<Link href="/services" />}
                nativeButton={false}
                className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
              >
                Browse services
              </Button>
              <Button
                render={<Link href="/sign-up" />}
                nativeButton={false}
                variant="outline"
                className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
              >
                Join as a technician
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#D8D6C9] shadow-md">
            <Image
              src="/images/about-workshop.jpg"
              alt="FixMate technician working in a repair workshop"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#D8D6C9] bg-white p-5 text-center shadow-sm"
            >
              <dt className="text-3xl font-semibold text-[#596B3F]">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-[#5C6353]">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionHeading
          eyebrow="Our Promise"
          title="What FixMate stands for"
          description="Four principles shape every booking on the platform."
        />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="flex gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#E9EDE4]">
                <value.icon className="size-5 text-[#596B3F]" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#30352B]">
                  {value.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#5C6353]">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />
      <WhyChooseUs />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#414A35] px-6 py-12 text-center">
          <h2 className="max-w-xl text-2xl font-semibold text-[#F7F6F0] sm:text-3xl">
            Ready to get your device fixed?
          </h2>
          <p className="max-w-lg text-sm text-[#A8B39A] sm:text-base">
            Browse verified technicians in your area and book a repair in
            minutes.
          </p>
          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            className="mt-1 bg-[#F7F6F0] font-semibold text-[#414A35] hover:bg-[#E8DFC9] hover:text-[#414A35]"
          >
            Find a service
          </Button>
        </div>
      </section>
    </>
  )
}
