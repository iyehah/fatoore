export type InvoiceAccentPreset = 'black' | 'blue' | 'green' | 'orange' | 'gray' | 'custom'

export const INVOICE_ACCENT_STORAGE_KEY = 'rim-invoice-accent-color'

export const INVOICE_ACCENT_PRESETS: Record<
  Exclude<InvoiceAccentPreset, 'custom'>,
  string
> = {
  black: '#0f172a',
  blue: '#2563eb',
  green: '#16a34a',
  orange: '#ea580c',
  gray: '#64748b',
}

const DEFAULT_CUSTOM_HEX = '#2563eb'

export interface InvoiceAccentState {
  preset: InvoiceAccentPreset
  customHex: string
  applyToBorders: boolean
}

export const DEFAULT_INVOICE_ACCENT: InvoiceAccentState = {
  preset: 'black',
  customHex: DEFAULT_CUSTOM_HEX,
  applyToBorders: false,
}

export function isInvoiceAccentPreset(v: string): v is InvoiceAccentPreset {
  return (
    v === 'black' ||
    v === 'blue' ||
    v === 'green' ||
    v === 'orange' ||
    v === 'gray' ||
    v === 'custom'
  )
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return DEFAULT_CUSTOM_HEX
}

export function resolveAccentHex(state: InvoiceAccentState): string {
  if (state.preset === 'custom') return normalizeHex(state.customHex)
  return INVOICE_ACCENT_PRESETS[state.preset]
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex)
  const match = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(normalized)
  if (!match) return null
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

function mixWithWhite(hex: string, accentWeight: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#f1f5f9'
  const w = 1 - accentWeight
  const r = Math.round(rgb.r * accentWeight + 255 * w)
  const g = Math.round(rgb.g * accentWeight + 255 * w)
  const b = Math.round(rgb.b * accentWeight + 255 * w)
  return `rgb(${r}, ${g}, ${b})`
}

function mixAccentBorder(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#cbd5e1'
  const r = Math.round(rgb.r * 0.35 + 255 * 0.65)
  const g = Math.round(rgb.g * 0.35 + 255 * 0.65)
  const b = Math.round(rgb.b * 0.35 + 255 * 0.65)
  return `rgb(${r}, ${g}, ${b})`
}

export function parseStoredAccent(raw: string | null): InvoiceAccentState {
  if (!raw) return DEFAULT_INVOICE_ACCENT
  try {
    const data = JSON.parse(raw) as Partial<InvoiceAccentState>
    const preset =
      data.preset && isInvoiceAccentPreset(data.preset)
        ? data.preset
        : DEFAULT_INVOICE_ACCENT.preset
    return {
      preset,
      customHex: data.customHex ? normalizeHex(data.customHex) : DEFAULT_CUSTOM_HEX,
      applyToBorders: Boolean(data.applyToBorders),
    }
  } catch {
    return DEFAULT_INVOICE_ACCENT
  }
}

export function buildInvoiceAccentCssVars(state: InvoiceAccentState): {
  cssVars: Record<string, string>
  className: string
} {
  const accent = resolveAccentHex(state)
  const isBlack = state.preset === 'black'

  const cssVars: Record<string, string> = {
    '--inv-accent': accent,
    '--inv-accent-soft': isBlack ? '#f1f5f9' : mixWithWhite(accent, 0.12),
    '--inv-accent-tint': isBlack ? '#e8edf3' : mixWithWhite(accent, 0.08),
    '--inv-accent-on': '#ffffff',
    '--inv-accent-icon': isBlack ? '#64748b' : accent,
    '--inv-badge-border': mixAccentBorder(accent),
  }

  if (state.applyToBorders && !isBlack) {
    cssVars['--inv-border-accent'] = mixAccentBorder(accent)
  }

  const className = state.applyToBorders && !isBlack ? 'invoice-doc--accent-borders' : ''

  return { cssVars, className }
}
