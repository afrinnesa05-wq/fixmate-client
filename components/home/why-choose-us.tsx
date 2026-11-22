import { BadgeCheck, HandCoins, Receipt, ShieldCheck } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

const REASONS = [
  {
    icon: BadgeCheck,
    title: "Verified Technicians",
    description:
      "Every technician is identity-checked, skill-reviewed and rated by real customers before they join FixMate.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Repair Services",
    description:
      "Repairs are covered by a 90-day warranty on parts and labour, so your device stays fixed for longer.",
  },
  {
    icon: Receipt,
    title: "Transparent Pricing",
    description:
      "See starting prices upfront and approve the final quote before any work begins — no hidden charges.",
  },
  {
    icon: HandCoins,
    title: "Pay After Service",
    description:
      "Money moves only when the repair is complete and you are happy with the result.",
  },
] as const

export function WhyChooseUs() {
  return (
    <section className="bg-[#F7F6F0]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHeading
          align="center"
          eyebrow="Why Choose FixMate"
          title="Built for stress-free home repairs"
          description="The standards every FixMate booking is backed by."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col gap-3 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-[#E9EDE4]">
                <reason.icon className="size-5 text-[#596B3F]" />
              </span>
              <h3 className="text-base font-semibold text-[#30352B]">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5C6353]">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
