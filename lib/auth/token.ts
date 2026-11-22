/**
 * Short-lived JWT storage for FixMate REST calls.
 *
 * The token is minted by `POST /auth/token` only after Better Auth has
 * verified the session cookie, so the browser holds a 1-hour API credential
 * instead of the session secret. `JWT_SECRET` never reaches the client.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "")
const STORAGE_KEY = "fixmate.access_token"
const RETRY_AFTER_MS = 5000

let memory: string | null = null
let hydrated = false
let inflight: Promise<string | null> | null = null
let rejectedAt = 0

function read(): string | null {
  if (typeof window === "undefined") return null
  if (!hydrated) {
    try {
      memory = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      memory = null
    }
    hydrated = true
  }
  return memory
}

export function getToken(): string | null {
  return read()
}

export function setToken(token: string): void {
  memory = token
  hydrated = true
  rejectedAt = 0
  try {
    window.localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Storage can be unavailable (private mode) — the in-memory copy still works.
  }
}

export function clearToken(): void {
  memory = null
  hydrated = true
  rejectedAt = 0
  inflight = null
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore: nothing to clear.
  }
}

function canRequest(): boolean {
  return typeof window !== "undefined" && API_BASE.length > 0
}

/**
 * Returns a usable JWT, minting one from the current session when needed.
 * Concurrent callers share a single request, and repeated failures are
 * briefly suppressed so signed-out page views do not hammer the endpoint.
 */
export async function ensureToken(): Promise<string | null> {
  const existing = read()
  if (existing) return existing
  if (!canRequest()) return null
  if (Date.now() - rejectedAt < RETRY_AFTER_MS) return null
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      if (!response.ok) {
        rejectedAt = Date.now()
        return null
      }
      const json = (await response.json().catch(() => null)) as {
        token?: unknown
      } | null
      if (typeof json?.token === "string" && json.token.length > 0) {
        setToken(json.token)
        return json.token
      }
      rejectedAt = Date.now()
      return null
    } catch {
      rejectedAt = Date.now()
      return null
    } finally {
      inflight = null
    }
  })()

  return inflight
}
