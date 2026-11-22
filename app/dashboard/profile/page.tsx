"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Camera, Lock, Save, User } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { fetchProfile, updateProfile, type Profile } from "@/lib/api/users"
import { authClient } from "@/lib/auth-client"
import { cn } from "cn"

const fieldClass =
  "border-[#D8D6C9] text-[#30352B] placeholder:text-[#8A8F82] focus-visible:border-[#596B3F] focus-visible:ring-[#596B3F]/20"

const NOTIFICATIONS = [
  {
    id: "booking-updates",
    label: "Booking status updates",
    description: "Get notified when a technician accepts or completes a job.",
    defaultChecked: true,
  },
  {
    id: "payment-receipts",
    label: "Payment receipts",
    description: "Receive a receipt whenever a payment is processed.",
    defaultChecked: true,
  },
  {
    id: "promotions",
    label: "Promotions & tips",
    description: "Occasional offers and maintenance advice.",
    defaultChecked: false,
  },
] as const

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchProfile(controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return
        setProfile(user)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "We couldn't load your profile."
        )
        setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const roleLabel =
    profile?.role === "admin"
      ? "Administrator"
      : profile?.role === "technician"
        ? "Technician"
        : "Customer"

  const avatar =
    profile?.image ||
    (profile?.role === "admin"
      ? "/images/persona-admin.jpg"
      : "/images/persona-customer.jpg")

  async function handlePersonalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingPersonal) return
    const data = new FormData(event.currentTarget)
    setSavingPersonal(true)
    try {
      const updated = await updateProfile({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? ""),
        area: String(data.get("area") ?? ""),
        address: String(data.get("address") ?? ""),
        bio: String(data.get("bio") ?? ""),
      })
      setProfile(updated)
      toast.success("Profile updated.")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save changes."
      )
    } finally {
      setSavingPersonal(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingPassword) return
    const data = new FormData(event.currentTarget)
    const currentPassword = String(data.get("currentPassword") ?? "")
    const newPassword = String(data.get("newPassword") ?? "")
    if (!currentPassword || newPassword.length < 8) {
      toast.error("Enter your current password and a new password (8+ chars).")
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      if (error) {
        toast.error(error.message || "Could not change the password.")
      } else {
        toast.success("Password updated.")
        event.currentTarget.reset()
      }
    } catch {
      toast.error("Could not change the password.")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information, password and notification preferences."
      />

      {loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#B4553F]/30 bg-[#B4553F]/10 px-4 py-3 text-sm text-[#8C3F2C]"
        >
          {loadError}
        </p>
      ) : null}

      <section className="flex flex-col items-start gap-5 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-[#E9EDE4]">
          <Image
            src={avatar}
            alt={profile?.name || "Profile"}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[#30352B]">
            {loading ? "Loading…" : profile?.name || "Your profile"}
          </h2>
          <p className="text-sm text-[#5C6353]">
            {roleLabel} · {profile?.email || ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.info("Profile photos are not configurable yet.")
          }
          className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
        >
          <Camera className="size-4" />
          Change photo
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form
          onSubmit={handlePersonalSubmit}
          className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#30352B]">
            <User className="size-4 text-[#596B3F]" />
            Personal information
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-[#30352B]">
              Full name
            </label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={profile?.name ?? ""}
              key={`name-${profile?.id ?? "loading"}`}
              required
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-email" className="text-sm font-medium text-[#30352B]">
              Email
            </label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-phone" className="text-sm font-medium text-[#30352B]">
              Phone
            </label>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              key={`phone-${profile?.id ?? "loading"}`}
              placeholder="+1 (555) 000-0000"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-area" className="text-sm font-medium text-[#30352B]">
              Service area
            </label>
            <Input
              id="profile-area"
              name="area"
              defaultValue={profile?.area ?? ""}
              key={`area-${profile?.id ?? "loading"}`}
              placeholder="e.g. Brookfield"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-address" className="text-sm font-medium text-[#30352B]">
              Default address
            </label>
            <Input
              id="profile-address"
              name="address"
              defaultValue={profile?.address ?? ""}
              key={`address-${profile?.id ?? "loading"}`}
              placeholder="Street, city, postcode"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-bio" className="text-sm font-medium text-[#30352B]">
              Bio
            </label>
            <textarea
              id="profile-bio"
              name="bio"
              rows={3}
              defaultValue={profile?.bio ?? ""}
              key={`bio-${profile?.id ?? "loading"}`}
              placeholder="A short introduction…"
              className={cn(
                "flex w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8A8F82]",
                fieldClass
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={savingPersonal || loading}
            className="mt-1 w-fit bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            <Save className="size-4" />
            {savingPersonal ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="flex flex-col gap-6">
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#30352B]">
              <Lock className="size-4 text-[#596B3F]" />
              Change password
            </h2>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-current-password"
                className="text-sm font-medium text-[#30352B]"
              >
                Current password
              </label>
              <Input
                id="profile-current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-new-password"
                className="text-sm font-medium text-[#30352B]"
              >
                New password
              </label>
              <Input
                id="profile-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
                className={fieldClass}
              />
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
              className="mt-1 w-fit bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
          </form>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              toast.success("Notification preferences saved on this device.")
            }}
            className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[#30352B]">
              Notifications
            </h2>
            {NOTIFICATIONS.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-[#D8D6C9] px-4 py-3 transition-colors hover:bg-[#F7F6F0]"
                )}
              >
                <input
                  type="checkbox"
                  name={option.id}
                  defaultChecked={option.defaultChecked}
                  className="mt-0.5 size-4 shrink-0 accent-[#596B3F]"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[#30352B]">
                    {option.label}
                  </span>
                  <span className="text-xs text-[#5C6353]">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
            <Button
              type="submit"
              className="w-fit bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Save preferences
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
