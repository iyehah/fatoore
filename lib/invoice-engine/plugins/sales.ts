import { z } from 'zod'
import type { InvoiceItem } from '@/types/invoice'
import { customerFieldDefaults, customerFieldsZod, coerceCustomerFields } from '../customer-fields'
import { draftNum, draftOptStr, draftStr, pickForCalculation } from '../coerce-draft'
import { applyDiscount, applyTax, clampNonNegative, roundMoney } from '../math'
import type { CalculationResult, FormSectionSchema, InvoiceTypePlugin } from '../types'
import {
  coercePaymentFields,
  customerSection,
  paymentFieldDefaults,
  paymentFieldsZod,
  paymentSection,
  totalsSection,
} from '../shared-fields'

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().min(0.01),
  unitPrice: z.coerce.number().min(0),
})

export const salesZodSchema = z.object({
  ...customerFieldsZod,
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  items: z.array(itemSchema).min(1),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  ...paymentFieldsZod,
})

export const salesSections: FormSectionSchema[] = [
  customerSection,
  {
    id: 'items',
    titleKey: 'invoice.item',
    fields: [
      {
        id: 'items',
        type: 'array',
        labelKey: 'invoice.item',
        itemLabelKey: 'invoice.item',
        required: true,
        itemFields: [
          { id: 'description', type: 'text', labelKey: 'invoice.description', required: true },
          { id: 'quantity', type: 'number', labelKey: 'invoice.quantity', required: true, min: 0.01, defaultValue: 1 },
          { id: 'unitPrice', type: 'currency', labelKey: 'invoice.unitPrice', required: true, min: 0, defaultValue: 0 },
        ],
      },
      { id: 'shipping', type: 'currency', labelKey: 'invoice.engine.fields.shipping', min: 0, defaultValue: 0 },
    ],
  },
  totalsSection,
  paymentSection,
]

export const salesDefaultValues: Record<string, unknown> = {
  ...customerFieldDefaults,
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  taxRate: 0,
  discount: 0,
  shipping: 0,
  ...paymentFieldDefaults,
}

function coerceSalesValues(merged: Record<string, unknown>): z.infer<typeof salesZodSchema> {
  const itemsRaw = Array.isArray(merged.items) ? merged.items : salesDefaultValues.items
  const items = (itemsRaw as Record<string, unknown>[]).map((row) => ({
    description: draftStr(row?.description),
    quantity: Math.max(draftNum(row?.quantity, 1), 0),
    unitPrice: draftNum(row?.unitPrice),
  }))
  if (!items.length) {
    items.push({ description: '', quantity: 1, unitPrice: 0 })
  }

  return {
    ...coerceCustomerFields(merged),
    clientName: draftStr(merged.clientName),
    clientPhone: draftOptStr(merged.clientPhone),
    clientAddress: draftOptStr(merged.clientAddress),
    items,
    taxRate: draftNum(merged.taxRate),
    discount: draftNum(merged.discount),
    shipping: draftNum(merged.shipping),
    ...coercePaymentFields(merged),
  }
}

export function parseSalesValues(values: Record<string, unknown>, strict = false) {
  if (strict) return salesZodSchema.parse(values)
  return pickForCalculation(
    values,
    (input) => salesZodSchema.safeParse(input),
    coerceSalesValues,
    salesDefaultValues,
  )
}

export function calculateSales(values: Record<string, unknown>): CalculationResult {
  const v = parseSalesValues(values, false)

  const lineItems: InvoiceItem[] = v.items.map((item, index) => ({
    id: `item-${index}`,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: roundMoney(item.quantity * item.unitPrice),
  }))

  const subtotal = roundMoney(lineItems.reduce((s, i) => s + i.total, 0))
  const discount = v.discount ?? 0
  const afterDiscount = applyDiscount(subtotal, discount)
  const taxAmount = applyTax(afterDiscount, v.taxRate ?? 0)
  const shipping = v.shipping ?? 0
  const total = clampNonNegative(roundMoney(afterDiscount + taxAmount + shipping))

  const summaryLines = [
    { labelKey: 'invoice.subtotal', amount: subtotal },
    ...(discount > 0 ? [{ labelKey: 'invoice.discount', amount: discount, variant: 'discount' as const }] : []),
    ...(taxAmount > 0 ? [{ labelKey: 'invoice.tax', labelParams: { rate: v.taxRate ?? 0 }, amount: taxAmount }] : []),
    ...(shipping > 0 ? [{ labelKey: 'invoice.engine.fields.shipping', amount: shipping }] : []),
  ]

  return {
    subtotal,
    taxRate: v.taxRate,
    taxAmount: taxAmount || undefined,
    discount: discount || undefined,
    shipping: shipping || undefined,
    total,
    summaryLines,
    displayTables: [
      {
        id: 'items',
        columns: [
          { key: 'description', labelKey: 'invoice.description' },
          { key: 'quantity', labelKey: 'invoice.quantity', align: 'center' },
          { key: 'unitPrice', labelKey: 'invoice.unitPrice', align: 'end' },
          { key: 'total', labelKey: 'invoice.amount', align: 'end' },
        ],
        rows: lineItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
      },
    ],
    badges: [],
  }
}

export const salesPluginMeta: Omit<InvoiceTypePlugin, 'calculate' | 'zodSchema'> = {
  type: 'sales',
  labelKey: 'invoice.types.sales.label',
  descriptionKey: 'invoice.types.sales.description',
  icon: 'ShoppingCart',
  sections: salesSections,
  defaultValues: salesDefaultValues,
}
