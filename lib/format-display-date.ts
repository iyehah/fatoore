import { format, isValid, parseISO } from 'date-fns'
import { ar, de, enUS, es, fr, pt } from 'date-fns/locale'
const DATE_FNS_LOCALES: Record<string, Locale> = {
  ar,
  fr,
  en: enUS,
  es,
  pt,
  de,
}

type Locale = typeof enUS

/** Gregorian calendar label — stable across SSR and client (avoids ar-SA Hijri mismatch). */
export function formatDisplayDate(
  day: string,
  language: string,
  fallback = '',
): string {
  if (!day) return fallback
  const d = parseISO(day)
  if (!isValid(d)) return fallback
  const locale = DATE_FNS_LOCALES[language] ?? enUS
  return format(d, 'PPP', { locale })
}

export function formatDisplayDateFromValue(
  value: string | undefined,
  language: string,
  pickText: string,
): string {
  const day = value?.slice(0, 10) ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    if (!value) return pickText
    const d = parseISO(value)
    if (!isValid(d)) return pickText
    const locale = DATE_FNS_LOCALES[language] ?? enUS
    return format(d, 'PPP', { locale })
  }
  return formatDisplayDate(day, language, pickText)
}
