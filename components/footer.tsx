import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/logo"

// PLACEHOLDER — no real FixMate contact info exists in this project yet.
// Replace these three values with the real ones before launch.
const CONTACT = {
  email: "support@fixmate.example",
  phone: { label: "+1 (555) 010-0000", href: "tel:+15550100000" },
  address: "123 Main Street, Suite 100, Springfield, ST 00000",
} as const

// PLACEHOLDER — replace hrefs with the real FixMate social profiles.
// Icons are simple-icons brand marks (Lucide ships no brand icons;
// its `X` export is the close/cross icon, not the X logo).
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/fixmate",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/fixmate",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793 0 1.439.645 1.439 1.439z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/fixmate",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
  {
    label: "X",
    href: "https://x.com/fixmate",
    path: "M18.901 1.153h3.679l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
] as const

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
] as const

// TODO: point each category at its own page (e.g. /services/plumbing) when it exists.
const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "AC Repair",
  "Cleaning",
  "Painting",
  "Appliance Repair",
] as const

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-[#F7F6F0] uppercase">
      {children}
    </h2>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#F7F6F0]/10 bg-[#414A35] text-[#F7F6F0]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo
              markClassName="size-8"
              textClassName="text-[#F7F6F0]"
              mateClassName="text-[#A8B39A]"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#F7F6F0]/75">
              Reliable home repair and maintenance services — trusted
              professionals, upfront pricing, and work built to last.
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex items-center justify-center rounded-lg border border-[#F7F6F0]/20 p-2.5 text-[#F7F6F0]/85 transition-colors hover:border-[#A8B39A] hover:bg-[#A8B39A]/15 hover:text-[#A8B39A] focus-visible:ring-2 focus-visible:ring-[#A8B39A]/70 focus-visible:outline-none"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                      className="size-4"
                    >
                      <path d={link.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Quick Links</FooterHeading>
            <nav aria-label="Quick links">
              <ul className="mt-4 space-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F7F6F0]/75 transition-colors hover:text-[#F7F6F0]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Popular Categories</FooterHeading>
            <ul className="mt-4 space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href="/services"
                    className="text-sm text-[#F7F6F0]/75 transition-colors hover:text-[#F7F6F0]"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Contact Information</FooterHeading>
            <address className="mt-4 space-y-3 not-italic">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-start gap-3 text-sm text-[#F7F6F0]/75 transition-colors hover:text-[#F7F6F0]"
              >
                <Mail
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#A8B39A]"
                />
                <span>{CONTACT.email}</span>
              </a>
              <a
                href={CONTACT.phone.href}
                className="flex items-start gap-3 text-sm text-[#F7F6F0]/75 transition-colors hover:text-[#F7F6F0]"
              >
                <Phone
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#A8B39A]"
                />
                <span>{CONTACT.phone.label}</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#F7F6F0]/75">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#A8B39A]"
                />
                <span>{CONTACT.address}</span>
              </div>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F7F6F0]/10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <p className="text-sm text-[#F7F6F0]/65">
            © {year} FixMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
