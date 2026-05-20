import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { InvoiceType } from '@/types/invoice'
import { getPlugin } from './registry'

export function getZodSchema(type: InvoiceType): z.ZodType<Record<string, unknown>> {
  return getPlugin(type).zodSchema
}

export function getZodResolver(type: InvoiceType) {
  return zodResolver(getZodSchema(type))
}
