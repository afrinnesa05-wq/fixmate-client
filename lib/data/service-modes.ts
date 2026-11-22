export const SERVICE_MODES = [
  { value: "on-site", label: "Home Visit" },
  { value: "in-shop", label: "Shop Drop-off" },
] as const

export function serviceModeLabel(value: string): string {
  if (!value) return ""
  return SERVICE_MODES.find((mode) => mode.value === value)?.label ?? value
}
