/** Lenient value helpers for live preview / calculate (strict Zod runs on submit only). */

export function mergeDraft(
  defaults: Record<string, unknown>,
  values: Record<string, unknown>,
): Record<string, unknown> {
  return { ...defaults, ...values }
}

export function draftNum(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function draftStr(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v)
}

export function draftOptStr(v: unknown): string | undefined {
  const s = draftStr(v).trim()
  return s || undefined
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function pickForCalculation<T>(
  values: Record<string, unknown>,
  parse: (v: Record<string, unknown>) => { success: true; data: T } | { success: false },
  coerce: (merged: Record<string, unknown>) => T,
  defaults: Record<string, unknown>,
): T {
  const strict = parse(values)
  if (strict.success) return strict.data
  return coerce(mergeDraft(defaults, values))
}
