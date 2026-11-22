/**
 * Frontend-only client for the FixMate backend services API.
 * The backend is built separately — these helpers only read from it.
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (see .env / README).
 */

import { clearToken, ensureToken } from "@/lib/auth/token"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/+$/, "")

export type ServicesApiErrorKind = "unconfigured" | "network" | "http" | "empty"

export class ServicesApiError extends Error {
  readonly kind: ServicesApiErrorKind

  constructor(kind: ServicesApiErrorKind, message: string) {
    super(message)
    this.name = "ServicesApiError"
    this.kind = kind
  }
}

export type ServiceCardData = {
  id: string
  title: string
  category: string
  serviceMode: string
  startingPrice: number
  image: string
  technicianName: string
  approvalStatus: string
}

export type ServiceDetailData = ServiceCardData & {
  description: string
  duration: string
  rating: number
  reviewCount: number
  isAvailable: boolean
}

type RawService = {
  id?: string
  _id?: string
  title?: string
  name?: string
  category?: string | { name?: string; slug?: string }
  serviceMode?: string
  mode?: string
  price?: number
  startingPrice?: number
  basePrice?: number
  image?: string
  imageUrl?: string
  thumbnail?: string
  technician?:
    | string
    | { name?: string; fullName?: string }
  technicianName?: string
  description?: string
  duration?: string
  rating?: number
  reviewCount?: number
  isAvailable?: boolean
  approvalStatus?: string
  status?: string
}

export function isServicesApiConfigured(): boolean {
  return API_BASE_URL.length > 0
}

/** Backend handlers use `{ error }`; JWT middleware uses `{ message }`. */
function serverMessage(json: unknown, status: number): string {
  if (json && typeof json === "object") {
    const record = json as { error?: unknown; message?: unknown }
    if (typeof record.error === "string" && record.error) return record.error
    if (typeof record.message === "string" && record.message) return record.message
  }
  return `Services API responded with status ${status}.`
}

/**
 * Hosts that `next/image` is allowed to load (see `images.remotePatterns` in
 * `next.config.ts`). A stored URL outside this list would make `<Image>` throw
 * during render, so cards fall back to the placeholder instead of crashing.
 */
const RENDERABLE_HOSTS = new Set(["i.ibb.co"])

/** True when `url` is an image the app can safely hand to `next/image`. */
export function isRenderableImage(url: string | undefined | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" && RENDERABLE_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

function buildUrl(
  path: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(`${API_BASE_URL}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function categoryDisplayName(
  raw: RawService["category"]
): string {
  if (!raw) return ""
  if (typeof raw === "string") return raw
  return raw.name ?? ""
}

function technicianDisplayName(raw: RawService): string {
  if (raw.technicianName) return raw.technicianName
  if (typeof raw.technician === "string") return raw.technician
  if (raw.technician) return raw.technician.name ?? raw.technician.fullName ?? ""
  return ""
}

function normalizeService(raw: RawService): ServiceCardData | null {
  const id = raw._id ?? raw.id
  const title = raw.title ?? raw.name
  if (!id || !title) return null

  const price = raw.startingPrice ?? raw.price ?? raw.basePrice

  return {
    id: String(id),
    title: String(title),
    category: categoryDisplayName(raw.category),
    serviceMode: raw.serviceMode ?? raw.mode ?? "",
    startingPrice: typeof price === "number" ? price : Number(price ?? 0),
    image: raw.image ?? raw.imageUrl ?? raw.thumbnail ?? "",
    technicianName: technicianDisplayName(raw),
    approvalStatus: raw.approvalStatus ?? raw.status ?? "",
  }
}

function normalizeDetail(
  raw: RawService,
  base: ServiceCardData
): ServiceDetailData {
  return {
    ...base,
    description: raw.description ?? "",
    duration: raw.duration ?? "",
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
    isAvailable: raw.isAvailable ?? false,
  }
}

async function requestJson(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
  retried = false
): Promise<unknown> {
  if (!isServicesApiConfigured()) {
    throw new ServicesApiError(
      "unconfigured",
      "NEXT_PUBLIC_API_BASE_URL is not set."
    )
  }

  const token = await ensureToken()

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }
    throw new ServicesApiError(
      "network",
      "Could not reach the FixMate services API."
    )
  }

  if (response.status === 401 && token && !retried) {
    clearToken()
    return requestJson(path, params, signal, true)
  }

  let json: unknown = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok) {
    throw new ServicesApiError("http", serverMessage(json, response.status))
  }

  if (json === null) {
    throw new ServicesApiError("http", "Services API returned invalid JSON.")
  }

  return json
}

function extractList(json: unknown): RawService[] {
  if (Array.isArray(json)) return json as RawService[]
  if (json && typeof json === "object") {
    const record = json as Record<string, unknown>
    const candidate = record.services ?? record.data ?? record.items
    if (Array.isArray(candidate)) return candidate as RawService[]
  }
  return []
}

export type FetchServicesOptions = {
  approvalStatus?: "approved" | "pending"
  isAvailable?: boolean
  category?: string
  serviceMode?: string
  q?: string
  technicianId?: string
  limit?: number
  sort?: "createdAt" | "price" | "title"
  order?: "asc" | "desc"
  signal?: AbortSignal
}

/** Fetches services from the backend using the documented filter contract. */
export async function fetchServices(
  options: FetchServicesOptions = {}
): Promise<ServiceCardData[]> {
  const json = await requestJson(
    "/services",
    {
      approvalStatus: options.approvalStatus,
      isAvailable: options.isAvailable,
      category: options.category,
      serviceMode: options.serviceMode,
      q: options.q,
      technicianId: options.technicianId,
      limit: options.limit ?? 6,
      sort: options.sort ?? "createdAt",
      order: options.order ?? "desc",
    },
    options.signal
  )

  return extractList(json)
    .map(normalizeService)
    .filter((service): service is ServiceCardData => service !== null)
}

/** Latest 6 approved + available services for the homepage. */
export async function fetchFeaturedServices(
  signal?: AbortSignal
): Promise<ServiceCardData[]> {
  return fetchServices({
    approvalStatus: "approved",
    isAvailable: true,
    limit: 6,
    signal,
  })
}

export async function fetchServiceById(
  id: string,
  signal?: AbortSignal
): Promise<ServiceDetailData> {
  const json = await requestJson(`/services/${encodeURIComponent(id)}`, {}, signal)

  const raw = (json &&
    typeof json === "object" &&
    "service" in (json as Record<string, unknown>)
      ? (json as { service: RawService }).service
      : (json as RawService)) as RawService | undefined

  const normalized = raw ? normalizeService(raw) : null
  if (!normalized) {
    throw new ServicesApiError("http", "Service not found.")
  }
  return normalizeDetail(raw as RawService, normalized)
}

async function mutateJson(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  body: Record<string, unknown>,
  signal?: AbortSignal,
  retried = false
): Promise<RawService> {
  if (!isServicesApiConfigured()) {
    throw new ServicesApiError("unconfigured", "NEXT_PUBLIC_API_BASE_URL is not set.")
  }

  const token = await ensureToken()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ServicesApiError("network", "Could not reach the FixMate services API.")
  }

  if (response.status === 401 && token && !retried) {
    clearToken()
    return mutateJson(path, method, body, signal, true)
  }

  let json: unknown = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok) {
    throw new ServicesApiError("http", serverMessage(json, response.status))
  }

  const raw =
    json && typeof json === "object" && "service" in json
      ? (json as { service: RawService }).service
      : (json as RawService)
  const normalized = normalizeService(raw)
  if (!normalized) {
    throw new ServicesApiError("http", "Services API returned an unexpected service.")
  }
  return raw
}

export type CreateServiceInput = {
  title: string
  category: string
  serviceMode: string
  price: number
  duration?: string
  description: string
  imageBase64?: string
}

/** Technician submits a new listing (starts pending). */
export async function createService(input: CreateServiceInput): Promise<ServiceCardData> {
  const raw = await mutateJson("/services", "POST", { ...input })
  return normalizeService(raw) as ServiceCardData
}

/** Owner edit — approval resets to pending. */
export async function updateService(
  id: string,
  input: Partial<CreateServiceInput>
): Promise<ServiceCardData> {
  const raw = await mutateJson(
    `/services/${encodeURIComponent(id)}`,
    "PUT",
    { ...input }
  )
  return normalizeService(raw) as ServiceCardData
}

/** Approval decisions / availability toggles. */
export async function patchService(
  id: string,
  body: { approvalStatus?: string; isAvailable?: boolean },
  signal?: AbortSignal
): Promise<ServiceCardData> {
  const raw = await mutateJson(
    `/services/${encodeURIComponent(id)}`,
    "PATCH",
    { ...body },
    signal
  )
  return normalizeService(raw) as ServiceCardData
}

/** Reads a File as a data URL for imageBase64 payloads. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read the image file."))
    reader.readAsDataURL(file)
  })
}
