"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Inbox, RefreshCw, Wrench } from "lucide-react"
import { toast } from "sonner"

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
import { ApiError } from "@/lib/api/client"
import {
  fetchServices,
  patchService,
  ServicesApiError,
  type ServiceCardData,
} from "@/lib/api/services"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; services: ServiceCardData[] }

export default function AdminServicesPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [search, setSearch] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback((signal?: AbortSignal) => {
    fetchServices({ limit: 100, signal })
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
        setState({
          status: "error",
          message:
            error instanceof ServicesApiError && error.kind === "unconfigured"
              ? "The service catalogue loads from the backend API — set NEXT_PUBLIC_API_BASE_URL to connect it."
              : error instanceof ApiError || error instanceof ServicesApiError
                ? error.message
                : "We couldn't load services right now.",
        })
      })
  }, [])

  const retry = useCallback(() => {
    setState({ status: "loading" })
    load()
  }, [load])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function decide(
    service: ServiceCardData,
    approvalStatus: "approved" | "rejected" | "suspended"
  ) {
    if (busyId) return
    setBusyId(service.id)
    try {
      await patchService(service.id, { approvalStatus })
      toast.success(
        approvalStatus === "approved"
          ? `"${service.title}" approved.`
          : approvalStatus === "rejected"
            ? `"${service.title}" rejected.`
            : `"${service.title}" suspended.`
      )
      load()
    } catch (error) {
      toast.error(
        error instanceof ServicesApiError || error instanceof ApiError
          ? error.message
          : "Could not update the service."
      )
    } finally {
      setBusyId(null)
    }
  }

  const all = state.status === "ready" ? state.services : []
  const rows = search
    ? all.filter((service) => {
        const needle = search.toLowerCase()
        return (
          service.title.toLowerCase().includes(needle) ||
          service.category.toLowerCase().includes(needle) ||
          service.technicianName.toLowerCase().includes(needle)
        )
      })
    : all

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="Review service listings — approve new submissions or suspend existing ones."
        actions={
          <>
            <SearchInput
              placeholder="Search services…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              render={<Link href="/dashboard/admin/bookings" />}
              nativeButton={false}
              variant="outline"
              className="border-[#596B3F]/40 bg-transparent text-[#30352B] hover:bg-[#596B3F]/10"
            >
              Bookings
            </Button>
          </>
        }
      />

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Loading services" className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]" />
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
              onClick={() => retry()}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          }
        />
      ) : null}

      {state.status === "empty" || (state.status === "ready" && rows.length === 0) ? (
        <EmptyState
          icon={Wrench}
          title="No services yet"
          description="Service listings submitted by technicians will appear here for review."
        />
      ) : null}

      {state.status === "ready" && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Price</TableHead>
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
                  {service.technicianName || "—"}
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
                      render={<Link href={`/services/${service.id}`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
                    >
                      View
                    </Button>
                    {service.approvalStatus === "pending" ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId === service.id}
                          onClick={() => decide(service, "rejected")}
                          className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === service.id}
                          onClick={() => decide(service, "approved")}
                          className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                        >
                          {busyId === service.id ? "Saving…" : "Approve"}
                        </Button>
                      </>
                    ) : service.approvalStatus === "approved" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyId === service.id}
                        onClick={() => decide(service, "suspended")}
                        className="border-[#D8D6C9] bg-transparent text-[#5C6353] hover:bg-[#EFEEE7]"
                      >
                        Suspend
                      </Button>
                    ) : service.approvalStatus === "suspended" ||
                      service.approvalStatus === "rejected" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === service.id}
                        onClick={() => decide(service, "approved")}
                        className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
                      >
                        Approve
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}
