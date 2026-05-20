import { z } from 'zod'
import { customerFieldDefaults, customerFieldsZod, coerceCustomerFields } from '../customer-fields'
import { draftNum, draftOptStr, draftStr, pickForCalculation, todayIso } from '../coerce-draft'
import { applyDiscount, applyTax, clampNonNegative, nextBillingDate, roundMoney } from '../math'
import type { CalculationResult, FormSectionSchema, InvoiceTypePlugin } from '../types'
import { customerSection, paymentSection, totalsSection } from '../shared-fields'

export const subscriptionZodSchema = z.object({
  ...customerFieldsZod,
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  planName: z.string().min(1),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  autoRenew: z.boolean().default(true),
  pricePerCycle: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  paymentDetails: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
})

export const subscriptionSections: FormSectionSchema[] = [
  customerSection,
  {
    id: 'subscription',
    titleKey: 'invoice.engine.sections.subscription',
    fields: [
      { id: 'planName', type: 'text', labelKey: 'invoice.engine.fields.planName', required: true },
      {
        id: 'billingCycle',
        type: 'select',
        labelKey: 'invoice.engine.fields.billingCycle',
        required: true,
        defaultValue: 'monthly',
        options: [
          { value: 'weekly', labelKey: 'invoice.engine.cycles.weekly' },
          { value: 'monthly', labelKey: 'invoice.engine.cycles.monthly' },
          { value: 'yearly', labelKey: 'invoice.engine.cycles.yearly' },
        ],
      },
      { id: 'startDate', type: 'date', labelKey: 'invoice.engine.fields.startDate', required: true },
      { id: 'endDate', type: 'date', labelKey: 'invoice.engine.fields.endDate', visibleWhen: { field: 'autoRenew', equals: false } },
      { id: 'autoRenew', type: 'switch', labelKey: 'invoice.engine.fields.autoRenew', defaultValue: true },
      { id: 'pricePerCycle', type: 'currency', labelKey: 'invoice.engine.fields.pricePerCycle', required: true, min: 0 },
    ],
  },
  totalsSection,
  paymentSection,
]

export const subscriptionDefaultValues: Record<string, unknown> = {
  ...customerFieldDefaults,
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  planName: '',
  billingCycle: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  autoRenew: true,
  pricePerCycle: 0,
  taxRate: 0,
  discount: 0,
  paymentMethod: '',
  paymentDetails: '',
  notes: '',
  dueDate: '',
}

function coerceSubscriptionValues(merged: Record<string, unknown>): z.infer<typeof subscriptionZodSchema> {
  const billingCycle =
    merged.billingCycle === 'weekly' || merged.billingCycle === 'yearly'
      ? merged.billingCycle
      : 'monthly'

  return {
    ...coerceCustomerFields(merged),
    clientName: draftStr(merged.clientName),
    clientPhone: draftOptStr(merged.clientPhone),
    clientAddress: draftOptStr(merged.clientAddress),
    planName: draftStr(merged.planName),
    billingCycle,
    startDate: draftStr(merged.startDate, todayIso()),
    endDate: draftOptStr(merged.endDate),
    autoRenew: Boolean(merged.autoRenew ?? true),
    pricePerCycle: draftNum(merged.pricePerCycle),
    taxRate: draftNum(merged.taxRate),
    discount: draftNum(merged.discount),
    paymentMethod: draftOptStr(merged.paymentMethod),
    paymentDetails: draftOptStr(merged.paymentDetails),
    notes: draftOptStr(merged.notes),
    dueDate: draftOptStr(merged.dueDate),
  }
}

export function parseSubscriptionValues(values: Record<string, unknown>, strict = false) {
  if (strict) return subscriptionZodSchema.parse(values)
  return pickForCalculation(
    values,
    (input) => subscriptionZodSchema.safeParse(input),
    coerceSubscriptionValues,
    subscriptionDefaultValues,
  )
}

export function calculateSubscription(values: Record<string, unknown>): CalculationResult {
  const v = parseSubscriptionValues(values, false)

  const subtotal = roundMoney(v.pricePerCycle)
  const discount = v.discount ?? 0
  const afterDiscount = roundMoney(subtotal - discount)
  const taxAmount = applyTax(afterDiscount, v.taxRate ?? 0)
  const total = clampNonNegative(roundMoney(afterDiscount + taxAmount))

  const nextPayment = nextBillingDate(v.startDate, v.billingCycle)

  return {
    subtotal,
    taxRate: v.taxRate,
    taxAmount: taxAmount || undefined,
    discount: discount || undefined,
    total,
    summaryLines: [
      { labelKey: 'invoice.engine.fields.pricePerCycle', amount: subtotal },
      ...(discount > 0 ? [{ labelKey: 'invoice.discount', amount: discount, variant: 'discount' as const }] : []),
      ...(taxAmount > 0 ? [{ labelKey: 'invoice.tax', labelParams: { rate: v.taxRate ?? 0 }, amount: taxAmount }] : []),
      { labelKey: 'invoice.engine.fields.nextPayment', labelParams: { date: nextPayment }, variant: 'muted' as const },
    ],
    displayTables: [
      {
        id: 'subscription',
        titleKey: 'invoice.engine.sections.subscription',
        columns: [
          { key: 'plan', labelKey: 'invoice.engine.fields.planName' },
          { key: 'cycle', labelKey: 'invoice.engine.fields.billingCycle' },
          { key: 'start', labelKey: 'invoice.engine.fields.startDate' },
          { key: 'next', labelKey: 'invoice.engine.fields.nextPayment' },
        ],
        rows: [
          {
            plan: v.planName,
            cycle: v.billingCycle,
            start: v.startDate,
            next: nextPayment,
          },
        ],
      },
    ],
    badges: v.autoRenew
      ? [{ labelKey: 'invoice.engine.badges.autoRenew', variant: 'success' }]
      : [],
  }
}

export const subscriptionPluginMeta = {
  type: 'subscription' as const,
  labelKey: 'invoice.types.subscription.label',
  descriptionKey: 'invoice.types.subscription.description',
  icon: 'RefreshCw',
  sections: subscriptionSections,
  defaultValues: subscriptionDefaultValues,
}
