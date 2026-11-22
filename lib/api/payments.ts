/** Payments API client — matches fixmate-server routes/payments.js. */

import { api } from "./client"

export type Payment = {
  id: string
  bookingId: string
  serviceName: string
  amount: number
  status: "pending" | "paid" | "refunded" | "failed"
  method: string | null
  date: string
  createdAt?: string
}

export type Transaction = {
  id: string
  date: string
  description: string
  type: "earning" | "refund"
  amount: number
  status: string
}

/** Starts a Stripe Checkout session for a completed, unpaid booking. */
export async function startCheckout(bookingId: string): Promise<{ url: string }> {
  return api.post<{ url: string }>("/payments/checkout", { bookingId })
}

/** Confirms a Stripe session on the success page (idempotent). */
export async function verifyPayment(
  sessionId: string,
  signal?: AbortSignal
): Promise<{ paid: boolean; bookingId: string | null }> {
  return api.get(
    `/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
    signal
  )
}

export async function fetchPayments(
  scope: "customer" | "all" = "customer",
  signal?: AbortSignal
): Promise<Payment[]> {
  const json = await api.get<{ payments: Payment[] }>(
    `/payments?scope=${scope}`,
    signal
  )
  return json.payments
}

export async function fetchTransactions(
  signal?: AbortSignal
): Promise<Transaction[]> {
  const json = await api.get<{ transactions: Transaction[] }>(
    "/transactions",
    signal
  )
  return json.transactions
}
