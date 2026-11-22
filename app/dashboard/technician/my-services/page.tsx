"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ImagePlus, Inbox, ListPlus, Pencil, RefreshCw, X } from "lucide-react"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { SearchInput } from "@/components/dashboard/search-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import {
  fetchServiceById,
  fetchServices,
  fileToDataUrl,
  ServicesApiError,
  updateService,
  type ServiceCardData,
} from "@/lib/api/services"
import { categories, SERVICE_MODES, serviceModeLabel } from "@/lib/data"
import { cn } from "cn"
import { toast } from "sonner"

const fieldClass =
  "border-[#D8D6C9] text-[#30352B] placeholder:text-[#8A8F82] focus-visible:border-[#596B3F] focus-visible:ring-[#596B3F]/20"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; services: ServiceCardData[] }

type EditDraft = {
  id: string
  title: string
  category: string
  serviceMode: string
  price: string
  duration: string
  area: string
  description: string
  image: string
}

export default function TechnicianMyServicesPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [search, setSearch] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [edit, setEdit] = useState<EditDraft | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editImageName, setEditImageName] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editImageError, setEditImageError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    }
  }, [editImagePreview])

  const cancelEdit = useCallback(() => {
    if (savingEdit) return
    setEdit(null)
    setEditError(null)
    setEditImageName(null)
    setEditImageError(null)
    setEditImagePreview(null)
  }, [savingEdit])

  async function openEdit(service: ServiceCardData) {
    if (busyId || savingEdit) return
    setEditError(null)
    setEditImageName(null)
    setEditImageError(null)
    setEditImagePreview(null)
    setBusyId(service.id)
    try {
      const detail = await fetchServiceById(service.id)
      setEdit({
        id: detail.id,
        title: detail.title,
        category:
          categories.find((c) => c.name === detail.category)?.slug ??
          detail.category,
        serviceMode: detail.serviceMode,
        price: String(detail.startingPrice),
        duration: detail.duration ?? "",
        area: detail.area ?? "",
        description: detail.description ?? "",
        image: detail.image ?? "",
      })
    } catch (error) {
      toast.error(
        error instanceof ApiError || error instanceof ServicesApiError
          ? error.message
          : "Could not load this service for editing."
      )
    } finally {
      setBusyId(null)
    }
  }

  function updateEdit<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setEdit((current) => (current ? { ...current, [key]: value } : current))
  }

  function handleEditImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setEditImageError(null)
    if (!file) {
      setEditImageName(null)
      setEditImagePreview(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      event.target.value = ""
      setEditImageName(null)
      setEditImagePreview(null)
      setEditImageError("Please choose a JPG or PNG image.")
      return
    }
    if (file.size > 7 * 1024 * 1024) {
      event.target.value = ""
      setEditImageName(null)
      setEditImagePreview(null)
      setEditImageError("Image must be 7 MB or smaller.")
      return
    }
    setEditImageName(file.name)
    setEditImagePreview(URL.createObjectURL(file))
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!edit || savingEdit) return
    const data = new FormData(event.currentTarget)
    const title = String(data.get("title") ?? "").trim()
    const category = String(data.get("category") ?? "")
    const serviceMode = String(data.get("serviceMode") ?? "")
    const priceInput = String(data.get("price") ?? "").trim()
    const price = Number(priceInput)
    const duration = String(data.get("duration") ?? "").trim()
    const area = String(data.get("area") ?? "").trim()
    const description = String(data.get("description") ?? "").trim()
    const imageFile = data.get("editImage")

    if (
      !title ||
      !category ||
      !serviceMode ||
      !duration ||
      !area ||
      !description ||
      priceInput === ""
    ) {
      const message = "Please fill in all required fields."
      setEditError(message)
      toast.error(message)
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      const message = "Starting price must be greater than zero."
      setEditError(message)
      toast.error(message)
      return
    }
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        setEditImageError("Please choose a JPG or PNG image.")
        return
      }
      if (imageFile.size > 7 * 1024 * 1024) {
        setEditImageError("Image must be 7 MB or smaller.")
        return
      }
    }

    setEditError(null)
    setSavingEdit(true)
    try {
      let imageBase64: string | undefined
      if (imageFile instanceof File && imageFile.size > 0) {
        imageBase64 = await fileToDataUrl(imageFile)
      }

      await updateService(edit.id, {
        title,
        category,
        serviceMode,
        price,
        duration,
        area,
        description,
        imageBase64,
      })
      toast.success("Service updated — it will be re-reviewed by the admin.")
      setEdit(null)
      setEditError(null)
      setEditImageName(null)
      setEditImageError(null)
      setEditImagePreview(null)
      load()
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof ServicesApiError
          ? error.message
          : "Could not save the service."
      setEditError(message)
      toast.error(message)
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(service: ServiceCardData) {
    if (busyId || savingEdit) return
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) {
      return
    }
    setBusyId(service.id)
    try {
      const { api } = await import("@/lib/api/client")
      await api.delete(`/services/${service.id}`)
      toast.success("Service deleted.")
      load()
    } catch (error) {
      toast.error(
        error instanceof ApiError || error instanceof ServicesApiError
          ? error.message
          : "Could not delete the service."
      )
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    if (!edit) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancelEdit()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [edit, cancelEdit])

  const applyResult = useCallback(
    (promise: Promise<ServiceCardData[]>, signal?: AbortSignal) => {
      promise
        .then((services) => {
          if (signal?.aborted) return
          setState(
            services.length > 0
              ? { status: "ready", services }
              : { status: "empty" }
          )
        })
        .catch((error: unknown) => {
          if (signal?.aborted) return
          if (error instanceof DOMException && error.name === "AbortError") return
          const message =
            error instanceof ServicesApiError && error.kind === "unconfigured"
              ? "Your service listings load from the backend API — set NEXT_PUBLIC_API_BASE_URL to connect it."
              : "We couldn't load your services right now."
          setState({ status: "error", message })
        })
    },
    []
  )

  const load = useCallback(
    (signal?: AbortSignal) => {
      setState({ status: "loading" })
      applyResult(
        fetchServices({ technicianId: "me", limit: 50, signal }),
        signal
      )
    },
    [applyResult]
  )

  useEffect(() => {
    const controller = new AbortController()
    applyResult(
      fetchServices({
        technicianId: "me",
        limit: 50,
        signal: controller.signal,
      }),
      controller.signal
    )
    return () => controller.abort()
  }, [applyResult])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Services"
        description="Services you have listed — pending items are reviewed by the admin before going live."
        actions={
          <>
            <SearchInput
              placeholder="Search my services…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              render={<Link href="/dashboard/technician/add-service" />}
              nativeButton={false}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <ListPlus className="size-4" />
              Add service
            </Button>
          </>
        }
      />

      {state.status === "loading" ? (
        <div
          aria-busy="true"
          aria-label="Loading my services"
          className="flex flex-col gap-3"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]"
            />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={Inbox}
          title="Services unavailable"
          description={state.message}
          action={
            <Button
              type="button"
              onClick={() => load()}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          }
        />
      ) : null}

      {state.status === "empty" ? (
        <EmptyState
          icon={ListPlus}
          title="No services yet"
          description="Add your first service to start receiving customer requests."
          action={
            <Button
              render={<Link href="/dashboard/technician/add-service" />}
              nativeButton={false}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Add service
            </Button>
          }
        />
      ) : null}

      {state.status === "ready" ? (
        (() => {
          const rows = search
            ? state.services.filter((service) => {
                const needle = search.toLowerCase()
                return (
                  service.title.toLowerCase().includes(needle) ||
                  service.category.toLowerCase().includes(needle)
                )
              })
            : state.services
          if (rows.length === 0) {
            return (
              <EmptyState
                icon={ListPlus}
                title="No matching services"
                description="Try a different search term."
              />
            )
          }
          return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <p className="font-medium">{service.title}</p>
                  <p className="text-xs text-[#5C6353]">{service.id}</p>
                </TableCell>
                <TableCell className="text-[#5C6353]">
                  {service.category || "—"}
                </TableCell>
                <TableCell className="text-[#5C6353]">
                  {service.serviceMode || "—"}
                </TableCell>
                <TableCell className="font-medium">
                  ${service.startingPrice}
                </TableCell>
                <TableCell>
                  {service.approvalStatus ? (
                    <StatusBadge status={service.approvalStatus} />
                  ) : (
                    <span className="text-xs text-[#8A8F82]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      render={
                        <Link href={`/services/${service.id}`} />
                      }
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId !== null || savingEdit}
                      onClick={() => openEdit(service)}
                      className="border-[#D8D6C9] bg-transparent text-[#596B3F] hover:bg-[#596B3F]/10"
                    >
                      <Pencil className="size-3.5" />
                      {busyId === service.id ? "Loading…" : "Edit"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === service.id}
                      onClick={() => handleDelete(service)}
                      className="border-[#D8D6C9] bg-transparent text-[#8C3F2C] hover:bg-[#EFEEE7]"
                    >
                      {busyId === service.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          )
        })()
      ) : null}

      {edit ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#30352B]/40 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancelEdit()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-heading"
            className="w-full max-w-2xl rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2
                  id="edit-service-heading"
                  className="text-lg font-semibold text-[#30352B]"
                >
                  Edit service
                </h2>
                <p className="text-sm text-[#5C6353]">
                  Updated listings are re-reviewed by the admin before going
                  live.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close edit form"
                disabled={savingEdit}
                onClick={cancelEdit}
                className="text-[#5C6353] hover:bg-[#EFEEE7] hover:text-[#30352B]"
              >
                <X className="size-4" />
              </Button>
            </div>

            {editError ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-[#B4553F]/30 bg-[#B4553F]/10 px-4 py-3 text-sm text-[#8C3F2C]"
              >
                {editError}
              </p>
            ) : null}

            <form
              onSubmit={handleSaveEdit}
              className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="edit-service-title"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Service title
                </label>
                <Input
                  id="edit-service-title"
                  name="title"
                  value={edit.title}
                  onChange={(event) => updateEdit("title", event.target.value)}
                  placeholder="e.g. Laptop Screen Replacement"
                  required
                  disabled={savingEdit}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-service-category"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Category
                </label>
                <select
                  id="edit-service-category"
                  name="category"
                  value={edit.category}
                  onChange={(event) =>
                    updateEdit("category", event.target.value)
                  }
                  required
                  disabled={savingEdit}
                  className={cn(
                    "flex h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition disabled:pointer-events-none disabled:opacity-50",
                    fieldClass
                  )}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                  {categories.every((c) => c.slug !== edit.category) ? (
                    <option value={edit.category}>{edit.category}</option>
                  ) : null}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-service-mode"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Service mode
                </label>
                <select
                  id="edit-service-mode"
                  name="serviceMode"
                  value={edit.serviceMode}
                  onChange={(event) =>
                    updateEdit("serviceMode", event.target.value)
                  }
                  required
                  disabled={savingEdit}
                  className={cn(
                    "flex h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition disabled:pointer-events-none disabled:opacity-50",
                    fieldClass
                  )}
                >
                  <option value="" disabled>
                    Select a mode
                  </option>
                  {SERVICE_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                  {SERVICE_MODES.every((m) => m.value !== edit.serviceMode) ? (
                    <option value={edit.serviceMode}>{edit.serviceMode}</option>
                  ) : null}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-service-price"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Starting price ($)
                </label>
                <Input
                  id="edit-service-price"
                  name="price"
                  type="number"
                  min={1}
                  step="1"
                  value={edit.price}
                  onChange={(event) => updateEdit("price", event.target.value)}
                  required
                  disabled={savingEdit}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-service-duration"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Typical duration
                </label>
                <Input
                  id="edit-service-duration"
                  name="duration"
                  value={edit.duration}
                  onChange={(event) =>
                    updateEdit("duration", event.target.value)
                  }
                  placeholder="e.g. 45–90 min"
                  required
                  disabled={savingEdit}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="edit-service-area"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Service area
                </label>
                <Input
                  id="edit-service-area"
                  name="area"
                  value={edit.area}
                  onChange={(event) => updateEdit("area", event.target.value)}
                  placeholder="e.g. City-wide, 15 km radius"
                  required
                  disabled={savingEdit}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="edit-service-description"
                  className="text-sm font-medium text-[#30352B]"
                >
                  Description
                </label>
                <textarea
                  id="edit-service-description"
                  name="description"
                  rows={4}
                  value={edit.description}
                  onChange={(event) =>
                    updateEdit("description", event.target.value)
                  }
                  placeholder="Describe what this service includes…"
                  required
                  disabled={savingEdit}
                  className={cn(
                    "flex w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8A8F82] disabled:pointer-events-none disabled:opacity-50",
                    fieldClass
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-[#30352B]">
                  Cover image
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="edit-service-image"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#A8B39A] bg-[#F7F6F0] px-4 py-3 text-sm text-[#30352B] transition-colors hover:border-[#596B3F] hover:bg-[#E9EDE4]"
                  >
                    <ImagePlus className="size-4 text-[#596B3F]" />
                    <span className="font-medium">
                      {editImageName ?? "Upload a new image"}
                    </span>
                    <input
                      id="edit-service-image"
                      name="editImage"
                      type="file"
                      accept="image/*"
                      disabled={savingEdit}
                      className="sr-only"
                      onChange={handleEditImageChange}
                    />
                  </label>
                  {editImagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editImagePreview}
                      alt="New cover preview"
                      className="h-16 rounded-lg object-cover"
                    />
                  ) : null}
                  <span className="text-xs text-[#5C6353]">
                    {edit.image
                      ? "Choosing a file replaces the current cover; leaving it empty keeps it."
                      : "No cover yet — JPG or PNG."}
                  </span>
                </div>
                {editImageError ? (
                  <p role="alert" className="text-sm text-[#8C3F2C]">
                    {editImageError}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingEdit}
                  onClick={cancelEdit}
                  className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                >
                  {savingEdit ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
