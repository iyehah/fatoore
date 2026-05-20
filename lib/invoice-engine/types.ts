import type { z } from 'zod'
import type {
  Invoice,
  InvoiceBadge,
  InvoiceDisplayTable,
  InvoiceSummaryLine,
  InvoiceType,
} from '@/types/invoice'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'time'
  | 'select'
  | 'switch'
  | 'array'

export interface VisibleWhen {
  field: string
  equals?: string | number | boolean
  notEquals?: string | number | boolean
}

export interface FieldSchema {
  id: string
  type: FieldType
  labelKey: string
  placeholderKey?: string
  required?: boolean
  defaultValue?: unknown
  min?: number
  max?: number
  step?: number
  options?: { value: string; labelKey: string }[]
  visibleWhen?: VisibleWhen
  /** For array fields: nested field definitions */
  itemFields?: FieldSchema[]
  itemLabelKey?: string
  colSpan?: 1 | 2
}

export interface FormSectionSchema {
  id: string
  titleKey: string
  descriptionKey?: string
  fields: FieldSchema[]
}

export interface CalculationResult {
  subtotal: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  shipping?: number
  total: number
  summaryLines: InvoiceSummaryLine[]
  displayTables: InvoiceDisplayTable[]
  badges: InvoiceBadge[]
}

export interface PreviewBodyProps {
  invoice: Partial<Invoice>
}

export interface InvoiceTypePlugin {
  type: InvoiceType
  labelKey: string
  descriptionKey: string
  icon: string
  sections: FormSectionSchema[]
  defaultValues: Record<string, unknown>
  zodSchema: z.ZodType<Record<string, unknown>>
  calculate: (values: Record<string, unknown>) => CalculationResult
}

export interface BuildInvoiceContext {
  userId: string
  currency?: string
  invoiceNumber?: string
  createdAt?: string
  business: {
    id?: string
    storeName: string
    logo?: string
    phone?: string
    address?: string
    taxId?: string
  }
}
