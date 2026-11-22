
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"

import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { roleHomePath } from "@/lib/auth/helpers"
import { clearToken, ensureToken } from "@/lib/auth/token"
import { cn } from "cn"

const ROLES = [
  { value: "customer", label: "I need repairs" },
  { value: "technician", label: "I provide repairs" },
] as const

export default function SignUpPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("customer")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage("")

    const formData = new FormData(event.currentTarget)

    const name = String(formData.get("name") || "")
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        role,
      })

      if (result.error) {
        setErrorMessage(result.error.message || "Unable to create account.")
        return
      }

      // Drop any cached rejection and mint the API token for the new session.
      clearToken()
      await ensureToken()

      router.push(roleHomePath(role))
      router.refresh()
    } catch (error) {
      console.error("Signup failed:", error)
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo markClassName="size-10" />
        <h1 className="text-2xl font-semibold text-[#30352B]">
          Create your account
        </h1>
        <p className="text-sm text-[#5C6353]">
          Join FixMate as a customer or a verified technician.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-[#30352B]">
            I want to
          </legend>

          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={role === option.value}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  role === option.value
                    ? "border-[#596B3F] bg-[#596B3F]/10 text-[#596B3F]"
                    : "border-[#D8D6C9] bg-white text-[#30352B] hover:border-[#596B3F]/40"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="sign-up-name"
            className="text-sm font-medium text-[#30352B]"
          >
            Full name
          </label>

          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
            <Input
              id="sign-up-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Jane Doe"
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="sign-up-email"
            className="text-sm font-medium text-[#30352B]"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
            <Input
              id="sign-up-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="sign-up-password"
            className="text-sm font-medium text-[#30352B]"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />

            <Input
              id="sign-up-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="pr-10 pl-9"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[#5C6353] hover:text-[#30352B]"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-11 rounded-lg bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#5C6353]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-[#596B3F] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

