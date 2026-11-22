import { Search, Send, Wallet, Wrench } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Find a Service",
    description:
      "Browse verified services by category and pick the right expert for your device.",
  },
  {
    step: "02",
    icon: Send,
    title: "Send a Request",
    description:
      "Share your issue and preferred time — the technician confirms your request.",
  },
  {
    step: "03",
    icon: Wrench,
    title: "Technician Fixes It",
    description:
      "Track the repair as it happens with clear status updates at every stage.",
  },
  {
    step: "04",
    icon: Wallet,
    title: "Pay After Completion",
    description:
      "Inspect the result and pay only after you are fully satisfied with the job.",
  },
] as const

export function HowItWorks() {
  return (
    <section className="bg-[#F7F6F0]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHeading
          align="center"
          eyebrow="How FixMate Works"
          title="Four simple steps to a working device"
          description="From finding the right technician to paying after the job — the whole repair journey stays transparent."
        />

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.step}
              className="relative flex flex-col gap-3 rounded-xl border border-[#D8D6C9] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-lg bg-[#596B3F]">
                  <step.icon className="size-5 text-[#F7F6F0]" />
                </span>
                <span className="text-3xl font-semibold text-[#E8DFC9]">
                  {step.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#30352B]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5C6353]">
                {step.description}
              </p>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-3.5 hidden h-px w-7 bg-[#A8B39A] lg:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
