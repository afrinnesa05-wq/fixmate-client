"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ImagePlus, Info, Send } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categories, SERVICE_MODES } from "@/lib/data"
import { cn } from "cn"
import {
  createService,
  fileToDataUrl,
  ServicesApiError,
} from "@/lib/api/services"

const MAX_IMAGE_BYTES = 7 * 1024 * 1024

const fieldClass =
  "border-[#D8D6C9] text-[#30352B] placeholder:text-[#8A8F82] focus-visible:border-[#596B3F] focus-visible:ring-[#596B3F]/20"

export default function AddServicePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImageError(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (!file) {
      setImageName(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      event.target.value = ""
      setImageName(null)
      setImageError("Please choose a JPG or PNG image.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = ""
      setImageName(null)
      setImageError("Image must be 7 MB or smaller.")
      return
    }
    setImageName(file.name)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setImageError(null)

    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get("title") ?? "").trim()
    const category = String(data.get("category") ?? "")
    const serviceMode = String(data.get("serviceMode") ?? "")
    const priceInput = String(data.get("price") ?? "").trim()
    const price = Number(priceInput)
    const duration = String(data.get("duration") ?? "").trim()
    const area = String(data.get("area") ?? "").trim()
    const description = String(data.get("description") ?? "").trim()
    const imageFile = data.get("image")

    if (
      !title ||
      !category ||
      !serviceMode ||
      !duration ||
      !area ||
      !description ||
      priceInput === ""
    ) {
      setError("Please fill in all required fields.")
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Starting price must be greater than zero.")
      return
    }
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        setImageError("Please choose a JPG or PNG image.")
        return
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        setImageError("Image must be 7 MB or smaller.")
        return
      }
    }

    setSubmitting(true)
    try {
      let imageBase64: string | undefined
      if (imageFile instanceof File && imageFile.size > 0) {
        imageBase64 = await fileToDataUrl(imageFile)
      }

      await createService({
        title,
        category,
        serviceMode,
        price,
        duration,
        area,
        description,
        imageBase64,
      })
      toast.success("Service submitted for admin review.")
      router.push("/dashboard/technician/my-services")
    } catch (err) {
      const message =
        err instanceof ServicesApiError
          ? err.message
          : "Something went wrong while submitting the service."
      setError(message)
      toast.error(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add Service"
        description="List a new repair service. Admin approval is required before it appears publicly."
        actions={
          <Button
            render={<Link href="/dashboard/technician/my-services" />}
            nativeButton={false}
            variant="outline"
            className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
          >
            My services
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-[#596B3F]/25 bg-[#596B3F]/10 px-4 py-3 text-sm text-[#414A35]">
        <Info className="mt-0.5 size-4 shrink-0 text-[#596B3F]" />
        <p>
          New services start as <strong>pending</strong> and only go live after
          admin review.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#B4553F]/30 bg-[#B4553F]/10 px-4 py-3 text-sm text-[#8C3F2C]"
        >
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid max-w-3xl grid-cols-1 gap-5 rounded-xl border border-[#D8D6C9] bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="service-title" className="text-sm font-medium text-[#30352B]">
            Service title
          </label>
          <Input
            id="service-title"
            name="title"
            placeholder="e.g. Laptop Screen Replacement"
            required
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="service-category" className="text-sm font-medium text-[#30352B]">
            Category
          </label>
          <select
            id="service-category"
            name="category"
            required
            defaultValue=""
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition",
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
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="service-mode" className="text-sm font-medium text-[#30352B]">
            Service mode
          </label>
          <select
            id="service-mode"
            name="serviceMode"
            required
            defaultValue="on-site"
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition",
              fieldClass
            )}
          >
            {SERVICE_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="service-price" className="text-sm font-medium text-[#30352B]">
            Starting price ($)
          </label>
          <Input
            id="service-price"
            name="price"
            type="number"
            min={1}
            step="1"
            placeholder="79"
            required
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="service-duration" className="text-sm font-medium text-[#30352B]">
            Typical duration
          </label>
          <Input
            id="service-duration"
            name="duration"
            placeholder="e.g. 45–90 min"
            required
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="service-area" className="text-sm font-medium text-[#30352B]">
            Service area
          </label>
          <Input
            id="service-area"
            name="area"
            placeholder="e.g. City-wide, 15 km radius"
            required
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="service-description" className="text-sm font-medium text-[#30352B]">
            Description
          </label>
          <textarea
            id="service-description"
            name="description"
            rows={4}
            placeholder="Describe what this service includes…"
            required
            className={cn(
              "flex w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8A8F82]",
              fieldClass
            )}
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium text-[#30352B]">Cover image</span>
          <label
            htmlFor="service-image"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[#A8B39A] bg-[#F7F6F0] px-4 py-8 text-center transition-colors hover:border-[#596B3F] hover:bg-[#E9EDE4]"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Selected cover preview"
                className="h-32 rounded-lg object-cover"
              />
            ) : (
              <ImagePlus className="size-6 text-[#596B3F]" />
            )}
            <span className="text-sm font-medium text-[#30352B]">
              {imageName ?? "Upload an image"}
            </span>
            <span className="text-xs text-[#5C6353]">
              JPG or PNG — optional
            </span>
            <input
              id="service-image"
              name="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
          {imageError ? (
            <p role="alert" className="text-sm text-[#8C3F2C]">
              {imageError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
          <Button
            render={<Link href="/dashboard/technician/my-services" />}
            nativeButton={false}
            variant="outline"
            className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
          >
            <Send className="size-4" />
            {submitting ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
      </form>
    </div>
  )
}
