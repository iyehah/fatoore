/** Font keys supported by the API (must match `fontRegistry` in lib/fonts/registry.ts). */
export const API_FONT_KEYS = [
  'geist',
  'inter',
  'notoSans',
  'nunitoSans',
  'figtree',
  'roboto',
  'raleway',
  'dmSans',
  'publicSans',
  'outfit',
  'geistMono',
  'geistPixelSquare',
  'jetBrainsMono',
  'notoSerif',
  'robotoSlab',
  'merriweather',
  'lora',
  'playfairDisplay',
  'amiri',
] as const

export type ApiFontKey = (typeof API_FONT_KEYS)[number]

export function parseFont(value: string | null | undefined): ApiFontKey {
  const key = value?.trim()
  if (key && (API_FONT_KEYS as readonly string[]).includes(key)) return key as ApiFontKey
  return 'geist'
}

export function isFontKey(value: string): value is ApiFontKey {
  return (API_FONT_KEYS as readonly string[]).includes(value)
}
