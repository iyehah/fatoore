import { Noto_Sans_Arabic } from 'next/font/google'
import { fontRegistry, type FontKey } from '@/lib/fonts/registry'

/** Arabic UI fallback (not selectable in `fontRegistry`) */
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  weight: ['400', '500', '600', '700'],
})

const UI_FALLBACK = 'ui-sans-serif, system-ui, sans-serif' as const

export function resolvedBodyFontFamily(key: FontKey): string {
  const primary = fontRegistry[key].font.style.fontFamily
  const arabic = notoSansArabic.style.fontFamily
  return `${primary}, ${arabic}, ${UI_FALLBACK}`
}
