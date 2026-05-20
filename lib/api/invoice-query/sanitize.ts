import { MAX_FIELD_LENGTH } from './types'

export function sanitizeString(
  value: string | null | undefined,
  maxLen = MAX_FIELD_LENGTH,
): string | undefined {
  if (value == null || value === '') return undefined
  const trimmed = value.trim().slice(0, maxLen)
  return trimmed || undefined
}

export function sanitizeUrl(value: string | null | undefined): string | undefined {
  const raw = sanitizeString(value, 2048)
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export function parseBooleanParam(value: string | null | undefined, defaultValue: boolean): boolean {
  if (value == null || value === '') return defaultValue
  const v = value.trim().toLowerCase()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return defaultValue
}

export function parseNumberParam(value: string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function parseJsonParam<T>(value: string | null | undefined, label: string): T | undefined {
  if (value == null || value === '') return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error(`Invalid JSON for "${label}"`)
  }
}
