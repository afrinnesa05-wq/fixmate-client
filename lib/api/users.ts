/** Users/profile API client — matches fixmate-server routes/users.js. */

import { api } from "./client"

export type Profile = {
  id: string
  name: string
  email: string
  role: string
  phone: string
  area: string
  address: string
  bio: string
  image: string
  emailVerified: boolean
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  joined: string
  status: "active" | "pending" | "suspended"
}

export type ProfileUpdate = Partial<{
  name: string
  phone: string
  area: string
  address: string
  bio: string
  image: string
}>

export async function fetchProfile(signal?: AbortSignal): Promise<Profile> {
  const json = await api.get<{ user: Profile }>("/users/me", signal)
  return json.user
}

export async function updateProfile(input: ProfileUpdate): Promise<Profile> {
  const json = await api.patch<{ user: Profile }>("/users/me", input)
  return json.user
}

export async function fetchUsers(signal?: AbortSignal): Promise<AdminUser[]> {
  const json = await api.get<{ users: AdminUser[] }>("/users", signal)
  return json.users
}

export async function setUserSuspended(
  id: string,
  suspended: boolean
): Promise<AdminUser> {
  const json = await api.patch<{ user: AdminUser }>(`/users/${id}`, { suspended })
  return json.user
}

export type AdminRole = "customer" | "technician" | "admin"

export async function setUserRole(
  id: string,
  role: AdminRole
): Promise<AdminUser> {
  const json = await api.patch<{ user: AdminUser }>(`/users/${id}`, { role })
  return json.user
}
