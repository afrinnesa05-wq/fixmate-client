/**
 * Shared fetch helper for authenticated FixMate backend REST calls.
 * A short-lived JWT rides in `Authorization: Bearer …` (see lib/auth/token);
 * Better Auth session cookies still ride along via credentials: "include".
 */

import { clearToken, ensureToken } from "@/lib/auth/token"

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/+$/, "")

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  signal?: AbortSignal
}

/** Backend errors use `{ error }`; JWT middleware uses `{ message }`. */
function errorMessage(json: unknown, status: number): string {
  if (json && typeof json === "object") {
    const record = json as { error?: unknown; message?: unknown }
    if (typeof record.error === "string" && record.error) return record.error
    if (typeof record.message === "string" && record.message) return record.message
  }
  return `Request failed with status ${status}.`
}

async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
  retried = false
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not set.")
  }

  const token = await ensureToken()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      cache: "no-store",
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(0, "Could not reach the FixMate API.")
  }

  // An expired token is refreshed once; the server rejected the request
  // before touching data, so replaying it is safe.
  if (response.status === 401 && token && !retried) {
    clearToken()
    return requestJson<T>(path, options, true)
  }

  let json: unknown = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(json, response.status))
  }

  return json as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => requestJson<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    requestJson<T>(path, { method: "POST", body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    requestJson<T>(path, { method: "PUT", body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    requestJson<T>(path, { method: "PATCH", body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    requestJson<T>(path, { method: "DELETE", signal }),
}
