
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { roleHomePath } from "@/lib/auth/helpers"
import { clearToken, ensureToken } from "@/lib/auth/token"

export default function SignInPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage("")

    const formData = new FormData(event.currentTarget)

    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setErrorMessage(result.error.message || "Invalid email or password.")
        return
      }

      const session = await authClient.getSession()
      const role = session.data?.user?.role

      // Drop any cached rejection and mint the API token for the new session.
      clearToken()
      await ensureToken()

      router.push(roleHomePath(role))
      router.refresh()
    } catch {
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
          Welcome back
        </h1>
        <p className="text-sm text-[#5C6353]">
          Sign in to manage your bookings and requests.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sign-in-email"
            className="text-sm font-medium text-[#30352B]"
          >
            Email
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />
            <Input
              id="sign-in-email"
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="sign-in-password"
              className="text-sm font-medium text-[#30352B]"
            >
              Password
            </label>

            <button
              type="button"
              className="text-xs font-medium text-[#596B3F] hover:underline"
              onClick={() => setErrorMessage("Password reset is not configured yet.")}
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5C6353]" />

            <Input
              id="sign-in-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
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

        <Button
          type="submit"
          disabled={loading}
          className="mt-1 h-11 bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#5C6353]">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-[#596B3F] underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
