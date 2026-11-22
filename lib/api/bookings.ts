/** Bookings API client — matches fixmate-server routes/bookings.js. */

import { api } from "./client"

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"

/** Server-authored timeline entry. Older bookings may omit this array. */
export type StatusHistoryEntry = {
  status: BookingStatus | "paid"
  changedAt: string
}

export type Booking = {
  id: string
  serviceId: string
  serviceName: string
  categorySlug: string
  customerName: string
  customerId: string
  technicianId: string
  date: string
  time: string
  address: string
  status: BookingStatus
  amount: number
  finalAmount: number | null
  paymentStatus: "unpaid" | "paid" | "refunded"
  cancelledBy: "customer" | "technician" | null
  statusHistory?: StatusHistoryEntry[]
  createdAt?: string
  updatedAt?: string
}

export type CreateBookingInput = {
  serviceId: string
  date: string
  time: string
  address: string
}

export type BookingAction = "cancel" | "accept" | "decline" | "start" | "complete"

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const json = await api.post<{ booking: Booking }>("/bookings", input)
  return json.booking
}

export async function fetchBookings(
  scope: "customer" | "technician" | "all" = "customer",
  signal?: AbortSignal
): Promise<Booking[]> {
  const json = await api.get<{ bookings: Booking[] }>(
    `/bookings?scope=${scope}`,
    signal
  )
  return json.bookings
}

export async function updateBooking(
  id: string,
  action: BookingAction,
  finalAmount?: number
): Promise<Booking> {
  const json = await api.patch<{ booking: Booking }>(`/bookings/${id}`, {
    action,
    ...(finalAmount !== undefined ? { finalAmount } : {}),
  })
  return json.booking
}
