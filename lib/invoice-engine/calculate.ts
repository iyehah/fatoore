import type { InvoiceType } from '@/types/invoice'
import type { CalculationResult } from './types'
import { getPlugin } from './registry'

export function calculateInvoice(
  type: InvoiceType,
  values: Record<string, unknown>,
): CalculationResult {
  return getPlugin(type).calculate(values)
}
