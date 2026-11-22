import Link from "next/link"
import { SearchX } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#E8DFC9]">
          <SearchX className="size-7 text-[#414A35]" />
        </span>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#596B3F] uppercase">
          Error 404
        </p>
        <h1 className="text-3xl font-semibold text-[#30352B] sm:text-4xl">
          Page not found
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-[#5C6353] sm:text-base">
          The page you are looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back to a working device instead.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            Back to home
          </Button>
          <Button
            render={<Link href="/services" />}
            nativeButton={false}
            variant="outline"
            className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            Browse services
          </Button>
        </div>
      </main>
      <Footer />
    </>
  )
}
