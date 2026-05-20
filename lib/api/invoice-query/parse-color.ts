import {
  DEFAULT_INVOICE_ACCENT,
  INVOICE_ACCENT_PRESETS,
  isInvoiceAccentPreset,
  type InvoiceAccentState,
} from '@/lib/invoice-accent-color'
import { parseBooleanParam } from './sanitize'

export function parseAccentColor(
  color: string | null | undefined,
  applyBorders?: string | null,
): InvoiceAccentState {
  const applyToBorders = parseBooleanParam(applyBorders, false)
  if (color == null || color === '' || color.trim().toLowerCase() === 'default') {
    return { ...DEFAULT_INVOICE_ACCENT, applyToBorders }
  }

  const raw = color.trim()
  if (raw.startsWith('#')) {
    return { preset: 'custom', customHex: raw, applyToBorders }
  }

  const lower = raw.toLowerCase()
  if (isInvoiceAccentPreset(lower) && lower !== 'custom') {
    return {
      preset: lower,
      customHex: INVOICE_ACCENT_PRESETS[lower],
      applyToBorders,
    }
  }

  if (lower in INVOICE_ACCENT_PRESETS) {
    const preset = lower as keyof typeof INVOICE_ACCENT_PRESETS
    return {
      preset,
      customHex: INVOICE_ACCENT_PRESETS[preset],
      applyToBorders,
    }
  }

  return { ...DEFAULT_INVOICE_ACCENT, applyToBorders }
}
