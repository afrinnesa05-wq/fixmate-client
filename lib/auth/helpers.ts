"use client"

/**
 * Frontend auth helpers for the FixMate Next.js app.
 *
 * This module deliberately does NOT create a Better Auth client — the single
 * instance lives in `lib/auth-client.ts` and is imported from there. Everything
 * here builds on top of that instance: role → home mapping, the current-session
 * hook, and the dashboard guards.
 */

import { useRouter } from "next/navigation"
import { createElement, Fragment, useEffect } from "react"

import { authClient } from "@/lib/auth-client"

/** Roles known to the app (mirrors the server-side `user.role` values). */
export type UserRole = "admin" | "technician" | "customer"

/** Variants of `DashboardShell`; `account` is role-agnostic. */
export type DashboardVariant = "customer" | "technician" | "admin" | "account"

/** Where each role lands after sign-in / sign-up / a role mismatch. */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  technician: "/dashboard/technician",
  customer: "/dashboard/customer",
}

/** Single destination for unauthenticated visitors. */
export const SIGN_IN_PATH = "/sign-in"

/** Type guard: is this value one of the app's known roles? */
export function isKnownRole(
  role: string | null | undefined
): role is UserRole {
  return role === "admin" || role === "technician" || role === "customer"
}

/**
 * Role → dashboard home path.
 *
 * Unknown, missing or malformed roles fall back to the customer dashboard,
 * which is the behaviour the sign-in page, sign-up page and navbar all had
 * before this helper existed.
 */
export function roleHomePath(role: string | null | undefined): string {
  return isKnownRole(role) ? ROLE_HOME[role] : ROLE_HOME.customer
}

/**
 * Read the Better Auth session once and expose it in a ready-to-use shape.
 * Wraps `authClient.useSession()` — no second client, no extra network layer.
 *
 * - `isLoading`   session request still in flight
 * - `session`     raw Better Auth session (or `null`)
 * - `user`        `session.user` or `null`
 * - `role`        normalised `UserRole`, or `null` when unknown/absent
 * - `isAuthenticated` convenience boolean
 */
export function useCurrentUser() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null
  const role = user && isKnownRole(user.role) ? user.role : null

  return {
    session,
    user,
    role,
    isLoading: isPending,
    isAuthenticated: Boolean(session),
  }
}

/**
 * Session + role guard used by `DashboardShell`.
 *
 * 1. Still loading → do nothing (the dashboard renders as usual).
 * 2. No session    → back to `/sign-in`.
 * 3. `account` variant → any signed-in role may stay (profile page).
 * 4. Role does not match the shell variant → that role's home dashboard.
 *
 * Runs in an effect so it survives a hard reload of a protected URL.
 */
export function useDashboardGuard(variant: DashboardVariant) {
  const router = useRouter()
  const { session, role, isLoading } = useCurrentUser()

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace(SIGN_IN_PATH)
      return
    }
    if (variant === "account") return
    if (role && role !== variant) {
      router.replace(roleHomePath(role))
    }
  }, [isLoading, session, role, variant, router])
}

type RequireRoleProps = {
  /** Omit to allow any signed-in user. */
  role?: UserRole
  children: React.ReactNode
}

/**
 * Declarative dashboard guard for layouts.
 *
 * While the session request is in flight the children render normally (so the
 * shell keeps its current loading behaviour). Once it settles:
 * - unauthenticated → render nothing and send the visitor to `/sign-in`
 * - wrong role → render nothing and send them to their own dashboard
 *
 * Used by `app/dashboard/layout.tsx`; role-specific enforcement stays in
 * `DashboardShell` via `useDashboardGuard`.
 */
export function RequireRole({ role: requiredRole, children }: RequireRoleProps) {
  const router = useRouter()
  const { session, role, isLoading } = useCurrentUser()

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace(SIGN_IN_PATH)
      return
    }
    if (requiredRole && role && role !== requiredRole) {
      router.replace(roleHomePath(role))
    }
  }, [isLoading, session, role, requiredRole, router])

  if (isLoading) return createElement(Fragment, null, children)
  if (!session) return null
  if (requiredRole && role && role !== requiredRole) return null
  return createElement(Fragment, null, children)
}
