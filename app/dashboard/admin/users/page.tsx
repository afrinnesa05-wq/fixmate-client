"use client"

import { useCallback, useEffect, useState } from "react"
import { Users } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { fetchUsers, setUserRole, setUserSuspended, type AdminRole, type AdminUser } from "@/lib/api/users"
import { cn } from "cn"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "technician", label: "Technicians" },
  { key: "admin", label: "Admins" },
  { key: "pending", label: "Pending" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; users: AdminUser[] }

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const [search, setSearch] = useState("")
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback((signal?: AbortSignal) => {
    fetchUsers(signal)
      .then((users) => {
        if (signal?.aborted) return
        setState(users.length > 0 ? { status: "ready", users } : { status: "empty" })
      })
      .catch((error: unknown) => {
        if (signal?.aborted) return
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "We couldn't load users right now.",
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

  async function handleSuspendToggle(user: AdminUser) {
    if (busyId) return
    const next = user.status !== "suspended"
    setBusyId(user.id)
    try {
      await setUserSuspended(user.id, next)
      toast.success(next ? `${user.name} suspended.` : `${user.name} reactivated.`)
      load()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update the user."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleRoleChange(user: AdminUser, role: AdminRole) {
    if (busyId || role === user.role) return
    setBusyId(user.id)
    try {
      await setUserRole(user.id, role)
      toast.success(`${user.name} is now ${role}.`)
      load()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update the role."
      )
    } finally {
      setBusyId(null)
    }
  }

  const allUsers = state.status === "ready" ? state.users : []
  const rows = allUsers.filter((user) => {
    if (filter === "pending" && user.status !== "pending") return false
    if (
      (filter === "customer" || filter === "technician" || filter === "admin") &&
      user.role !== filter
    ) {
      return false
    }
    if (search) {
      const needle = search.toLowerCase()
      return (
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle)
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="All customer, technician and admin accounts on the platform."
        actions={
          <SearchInput
            placeholder="Search users…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter users">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === option.key
                ? "border-[#596B3F] bg-[#596B3F] text-[#F7F6F0]"
                : "border-[#D8D6C9] bg-white text-[#30352B] hover:border-[#596B3F]/40 hover:text-[#596B3F]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Loading users" className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-[#EFEEE7]" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          icon={Users}
          title="Users unavailable"
          description={state.message}
          action={
            <Button
              type="button"
              onClick={() => retry()}
              className="bg-[#596B3F] font-semibold text-[#F7F6F0] hover:bg-[#414A35] hover:text-[#F7F6F0]"
            >
              Try again
            </Button>
          }
        />
      ) : null}

      {state.status === "empty" || (state.status === "ready" && rows.length === 0) ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Accounts matching this filter will appear here."
        />
      ) : null}

      {state.status === "ready" && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[#5C6353]">{user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-transparent capitalize",
                      user.role === "technician"
                        ? "bg-[#596B3F] text-[#F7F6F0]"
                        : user.role === "admin"
                          ? "bg-[#414A35] text-[#F7F6F0]"
                          : "bg-[#E8DFC9] text-[#414A35]"
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-[#5C6353]">
                  {user.joined}
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <select
                      aria-label={`Change role for ${user.name}`}
                      value={user.role}
                      disabled={busyId === user.id}
                      onChange={(event) =>
                        handleRoleChange(user, event.target.value as AdminRole)
                      }
                      className="h-9 rounded-lg border border-[#D8D6C9] bg-white px-2 text-sm text-[#30352B] outline-none transition focus:border-[#596B3F] disabled:pointer-events-none disabled:opacity-50"
                    >
                      <option value="customer">Customer</option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === user.id}
                      onClick={() => handleSuspendToggle(user)}
                      className="border-[#D8D6C9] bg-transparent text-[#30352B] hover:bg-[#EFEEE7]"
                    >
                      {busyId === user.id
                        ? "Saving…"
                        : user.status === "suspended"
                          ? "Reactivate"
                          : "Suspend"}
                    </Button>
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
