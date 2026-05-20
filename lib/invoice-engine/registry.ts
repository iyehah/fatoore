import type { InvoiceType } from '@/types/invoice'
import type { InvoiceTypePlugin } from './types'
import { bookingPluginMeta, bookingZodSchema, calculateBooking } from './plugins/booking'
import {
  calculateInstallment,
  installmentPluginMeta,
  installmentZodSchema,
} from './plugins/installment'
import { calculateSales, salesPluginMeta, salesZodSchema } from './plugins/sales'
import { calculateService, servicePluginMeta, serviceZodSchema } from './plugins/service'
import {
  calculateSubscription,
  subscriptionPluginMeta,
  subscriptionZodSchema,
} from './plugins/subscription'

const plugins: InvoiceTypePlugin[] = [
  {
    ...salesPluginMeta,
    zodSchema: salesZodSchema,
    calculate: calculateSales,
  },
  {
    ...subscriptionPluginMeta,
    zodSchema: subscriptionZodSchema,
    calculate: calculateSubscription,
  },
  {
    ...servicePluginMeta,
    zodSchema: serviceZodSchema,
    calculate: calculateService,
  },
  {
    ...bookingPluginMeta,
    zodSchema: bookingZodSchema,
    calculate: calculateBooking,
  },
  {
    ...installmentPluginMeta,
    zodSchema: installmentZodSchema,
    calculate: calculateInstallment,
  },
]

const byType = new Map(plugins.map((p) => [p.type, p]))

export function getPlugin(type: InvoiceType): InvoiceTypePlugin {
  const plugin = byType.get(type)
  if (!plugin) throw new Error(`Unknown invoice type: ${type}`)
  return plugin
}

export function listInvoiceTypes(): InvoiceTypePlugin[] {
  return plugins
}

export function isInvoiceType(v: string): v is InvoiceType {
  return byType.has(v as InvoiceType)
}
