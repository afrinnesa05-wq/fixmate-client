export type Role = "customer" | "technician" | "admin"

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"

export type PaymentStatus = "unpaid" | "paid" | "refunded"

export type RequestStatus = "pending" | "accepted" | "declined" | "completed"

export interface Category {
  slug: string
  name: string
  description: string
  image: string
}

export interface Technician {
  id: string
  name: string
  image: string
  specialty: string
  categories: string[]
  rating: number
  reviewCount: number
  jobsCompleted: number
  experience: string
  verified: boolean
}

export interface Booking {
  id: string
  serviceId: string
  serviceName: string
  categorySlug: string
  customerName: string
  technicianId: string
  date: string
  time: string
  address: string
  status: BookingStatus
  amount: number
  paymentStatus: PaymentStatus
}

export interface Payment {
  id: string
  bookingId: string
  serviceName: string
  amount: number
  status: PaymentStatus
  method: string | null
  date: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  type: "earning" | "payout" | "refund" | "fee"
  amount: number
  status: "completed" | "pending" | "failed"
}

export interface ServiceRequest {
  id: string
  serviceName: string
  categorySlug: string
  customerName: string
  date: string
  address: string
  proposedAmount: number
  status: RequestStatus
  finalAmount: number | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  joined: string
  status: "active" | "pending" | "suspended"
}

export interface Testimonial {
  id: string
  name: string
  role: string
  image: string
  quote: string
  rating: number
}

export interface StatItem {
  label: string
  value: string
  detail: string
  trend?: "up" | "down" | "flat"
}
