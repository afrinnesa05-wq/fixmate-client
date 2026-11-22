"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { CalendarCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { createBooking } from "@/lib/api/bookings"
import { authClient } from "@/lib/auth-client"
import { cn } from "cn"

const fieldClass =
  "border-[#D8D6C9] text-[#30352B] placeholder:text-[#8A8F82] focus-visible:border-[#596B3F] focus-visible:ring-[#596B3F]/20"

type RequestServiceFormProps = {
  serviceId: string
}

export function RequestServiceForm({ serviceId }: RequestServiceFormProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const data = new FormData(event.currentTarget)
    const date = String(data.get("date") ?? "").trim()
    const time = String(data.get("time") ?? "").trim()
    const address = String(data.get("address") ?? "").trim()
    if (!date || !time || !address) {
      toast.error("Please choose a date, time and address.")
      return
    }

    setSubmitting(true)
    try {
      await createBooking({ serviceId, date, time, address })
      toast.success("Booking request sent to the technician.")
      setOpen(false)
      router.push("/dashboard/customer/bookings")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not send the request."
      )
      setSubmitting(false)
    }
  }

  if (isPending) {
    return (
      <Button
        type="button"
        disabled
        className="w-full bg-[#596B3F] font-semibold text-[#F7F6F0]"
      >
        Loading…
      </Button>
    )
  }

  if (!session) {
    return (
      <Button
        render={<a href="/sign-in" />}
        nativeButton={false}
        className="w-full bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
      >
        Sign in to request
      </Button>
    )
  }

  if (session.user.role && session.user.role !== "customer") {
    return (
      <p className="rounded-lg border border-[#D8D6C9] bg-[#F7F6F0] px-3 py-2 text-center text-xs text-[#5C6353]">
        Only customer accounts can request bookings.
      </p>
    )
  }

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
      >
        Request This Service
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-[#D8D6C9] bg-[#F7F6F0] p-4"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-[#30352B]">
        <CalendarCheck className="size-4 text-[#596B3F]" />
        Choose a slot
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          name="date"
          required
          aria-label="Preferred date"
          className={cn(fieldClass, "bg-white")}
        />
        <Input
          type="time"
          name="time"
          required
          aria-label="Preferred time"
          className={cn(fieldClass, "bg-white")}
        />
      </div>
      <Input
        name="address"
        required
        placeholder="Service address"
        aria-label="Service address"
        className={cn(fieldClass, "bg-white")}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="flex-1 border-[#D8D6C9] bg-white text-[#30352B] hover:bg-[#EFEEE7]"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          {submitting ? "Sending…" : "Send request"}
        </Button>
      </div>
    </form>
  )
}
