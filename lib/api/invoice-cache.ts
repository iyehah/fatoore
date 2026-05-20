import { createHash } from 'crypto'

const memoryCache = new Map<string, { buffer: Buffer; contentType: string; expires: number }>()

const TTL_MS = 60_000
const MAX_ENTRIES = 32

export function cacheKeyForQuery(queryString: string): string {
  return createHash('sha256').update(queryString).digest('hex').slice(0, 16)
}

export function getCachedExport(
  key: string,
): { buffer: Buffer; contentType: string } | null {
  const hit = memoryCache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expires) {
    memoryCache.delete(key)
    return null
  }
  return { buffer: hit.buffer, contentType: hit.contentType }
}

export function setCachedExport(key: string, buffer: Buffer, contentType: string): void {
  if (memoryCache.size >= MAX_ENTRIES) {
    const first = memoryCache.keys().next().value
    if (first) memoryCache.delete(first)
  }
  memoryCache.set(key, {
    buffer,
    contentType,
    expires: Date.now() + TTL_MS,
  })
}
