import type { AdminUser, StatItem, Testimonial } from "./types"

export const adminUsers: AdminUser[] = [
  {
    id: "usr-01",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    role: "customer",
    joined: "14 Mar 2026",
    status: "active",
  },
  {
    id: "usr-02",
    name: "Daniel Reyes",
    email: "daniel.reyes@example.com",
    role: "technician",
    joined: "02 Jan 2026",
    status: "active",
  },
  {
    id: "usr-03",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    role: "technician",
    joined: "19 Feb 2026",
    status: "active",
  },
  {
    id: "usr-04",
    name: "James Oduya",
    email: "james.oduya@example.com",
    role: "customer",
    joined: "27 Apr 2026",
    status: "active",
  },
  {
    id: "usr-05",
    name: "Marta Kowalski",
    email: "marta.kowalski@example.com",
    role: "technician",
    joined: "08 May 2026",
    status: "active",
  },
  {
    id: "usr-06",
    name: "Lena Fischer",
    email: "lena.fischer@example.com",
    role: "customer",
    joined: "21 Sep 2026",
    status: "pending",
  },
  {
    id: "usr-07",
    name: "Omar Haddad",
    email: "omar.haddad@example.com",
    role: "technician",
    joined: "11 Oct 2026",
    status: "pending",
  },
  {
    id: "usr-08",
    name: "Rita Gomez",
    email: "rita.gomez@example.com",
    role: "customer",
    joined: "03 Jun 2026",
    status: "suspended",
  },
]

export const testimonials: Testimonial[] = [
  {
    id: "tst-01",
    name: "James Oduya",
    role: "Customer, Northgate",
    image: "/images/technician-4.jpg",
    quote:
      "Booked an AC diagnostic in the morning and a technician was at my door by afternoon. Clear pricing and no surprises.",
    rating: 5,
  },
  {
    id: "tst-02",
    name: "Lena Fischer",
    role: "Customer, Westfield",
    image: "/images/technician-5.jpg",
    quote:
      "My laptop screen was fixed in under an hour. The status updates made it easy to follow the whole repair.",
    rating: 5,
  },
  {
    id: "tst-03",
    name: "Marcus Webb",
    role: "Customer, Southdale",
    image: "/images/technician-6.jpg",
    quote:
      "Transparent quotes, verified technicians and simple payment after the job. Exactly what home repairs should feel like.",
    rating: 4,
  },
  {
    id: "tst-04",
    name: "Rita Gomez",
    role: "Customer, Eastbrook",
    image: "/images/technician-3.jpg",
    quote:
      "The washer repair was tracked step by step from request to completion. I always knew what was happening.",
    rating: 5,
  },
]

export const customerStats: StatItem[] = [
  { label: "Total Bookings", value: "8", detail: "All time", trend: "up" },
  { label: "Active Repairs", value: "3", detail: "In progress now", trend: "flat" },
  { label: "Amount Due", value: "$218", detail: "2 unpaid bookings", trend: "down" },
  { label: "Completed", value: "3", detail: "100% satisfaction", trend: "up" },
]

export const technicianStats: StatItem[] = [
  { label: "Pending Requests", value: "2", detail: "Awaiting your response", trend: "flat" },
  { label: "Active Jobs", value: "1", detail: "Currently in progress", trend: "up" },
  { label: "Earnings (Nov)", value: "$642", detail: "After platform fees", trend: "up" },
  { label: "Rating", value: "4.9", detail: "From 214 reviews", trend: "up" },
]

export const adminStats: StatItem[] = [
  { label: "Registered Users", value: "1,248", detail: "+36 this week", trend: "up" },
  { label: "Services Listed", value: "15", detail: "1 pending approval", trend: "flat" },
  { label: "Bookings (Nov)", value: "312", detail: "+18% vs October", trend: "up" },
  { label: "Revenue (Nov)", value: "$18.4k", detail: "Platform commission", trend: "up" },
]
