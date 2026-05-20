import { z } from 'zod'
import { customerFieldDefaults, customerFieldsZod, coerceCustomerFields } from '../customer-fields'
import { draftNum, draftOptStr, draftStr, pickForCalculation } from '../coerce-draft'
import { applyDiscount, applyTax, clampNonNegative, roundMoney } from '../math'
import type { CalculationResult, FormSectionSchema } from '../types'
import { customerSection, paymentSection, totalsSection } from '../shared-fields'

const milestoneSchema = z.object({
  title: z.string().optional().default(''),
  amount: z.coerce.number().min(0),
})

export const serviceZodSchema = z.object({
  ...customerFieldsZod,
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  serviceDescription: z.string().min(1),
  pricingModel: z.enum(['fixed', 'hourly', 'milestone']),
  fixedAmount: z.coerce.number().min(0).optional(),
  hours: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  milestones: z.array(milestoneSchema).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  paymentDetails: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
})

export const serviceSections: FormSectionSchema[] = [
  customerSection,
  {
    id: 'service',
    titleKey: 'invoice.engine.sections.service',
    fields: [
      {
        id: 'serviceDescription',
        type: 'textarea',
        labelKey: 'invoice.engine.fields.serviceDescription',
        required: true,
        colSpan: 2,
      },
      {
        id: 'pricingModel',
        type: 'select',
        labelKey: 'invoice.engine.fields.pricingModel',
        required: true,
        defaultValue: 'fixed',
        options: [
          { value: 'fixed', labelKey: 'invoice.engine.pricingModels.fixed' },
          { value: 'hourly', labelKey: 'invoice.engine.pricingModels.hourly' },
          { value: 'milestone', labelKey: 'invoice.engine.pricingModels.milestone' },
        ],
      },
      {
        id: 'fixedAmount',
        type: 'currency',
        labelKey: 'invoice.engine.fields.fixedAmount',
        visibleWhen: { field: 'pricingModel', equals: 'fixed' },
        min: 0,
      },
      {
        id: 'hours',
        type: 'number',
        labelKey: 'invoice.engine.fields.hours',
        visibleWhen: { field: 'pricingModel', equals: 'hourly' },
        min: 0,
      },
      {
        id: 'hourlyRate',
        type: 'currency',
        labelKey: 'invoice.engine.fields.hourlyRate',
        visibleWhen: { field: 'pricingModel', equals: 'hourly' },
        min: 0,
      },
      {
        id: 'milestones',
        type: 'array',
        labelKey: 'invoice.engine.fields.milestones',
        visibleWhen: { field: 'pricingModel', equals: 'milestone' },
        itemLabelKey: 'invoice.engine.fields.milestoneRow',
        itemFields: [
          { id: 'title', type: 'text', labelKey: 'invoice.engine.fields.milestoneName', required: true },
          { id: 'amount', type: 'currency', labelKey: 'invoice.amount', required: true, min: 0 },
        ],
      },
    ],
  },
  totalsSection,
  paymentSection,
]

export const serviceDefaultValues: Record<string, unknown> = {
  ...customerFieldDefaults,
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  serviceDescription: '',
  pricingModel: 'fixed',
  fixedAmount: 0,
  hours: 1,
  hourlyRate: 0,
  milestones: [{ title: '', amount: 0 }],
  taxRate: 0,
  discount: 0,
  paymentMethod: '',
  paymentDetails: '',
  notes: '',
  dueDate: '',
}

type ServiceCalcValues = z.infer<typeof serviceZodSchema>

function coerceServiceValues(merged: Record<string, unknown>): ServiceCalcValues {
  const pricingModel =
    merged.pricingModel === 'hourly' || merged.pricingModel === 'milestone'
      ? merged.pricingModel
      : 'fixed'
  const milestones = Array.isArray(merged.milestones)
    ? (merged.milestones as Record<string, unknown>[]).map((row) => ({
        title: draftStr(row?.title),
        amount: draftNum(row?.amount),
      }))
    : []

  return {
    ...coerceCustomerFields(merged),
    clientName: draftStr(merged.clientName),
    clientPhone: draftOptStr(merged.clientPhone),
    clientAddress: draftOptStr(merged.clientAddress),
    serviceDescription: draftStr(merged.serviceDescription),
    pricingModel,
    fixedAmount: draftNum(merged.fixedAmount),
    hours: draftNum(merged.hours, 1),
    hourlyRate: draftNum(merged.hourlyRate),
    milestones,
    taxRate: draftNum(merged.taxRate),
    discount: draftNum(merged.discount),
    paymentMethod: draftOptStr(merged.paymentMethod),
    paymentDetails: draftOptStr(merged.paymentDetails),
    notes: draftOptStr(merged.notes),
    dueDate: draftOptStr(merged.dueDate),
  }
}

export function parseServiceValues(values: Record<string, unknown>, strict = false) {
  if (strict) return serviceZodSchema.parse(values)
  return pickForCalculation(
    values,
    (input) => serviceZodSchema.safeParse(input),
    coerceServiceValues,
    serviceDefaultValues,
  )
}

function buildServiceDisplayTable(v: ServiceCalcValues) {
  const desc = v.serviceDescription || '—'

  if (v.pricingModel === 'fixed') {
    return {
      id: 'breakdown',
      titleKey: 'invoice.engine.sections.service',
      columns: [
        { key: 'description', labelKey: 'invoice.description' },
        { key: 'amount', labelKey: 'invoice.amount', align: 'end' as const },
      ],
      rows: [{ description: desc, amount: roundMoney(v.fixedAmount ?? 0) }],
    }
  }

  if (v.pricingModel === 'hourly') {
    const hours = v.hours ?? 0
    const rate = v.hourlyRate ?? 0
    return {
      id: 'breakdown',
      titleKey: 'invoice.engine.sections.service',
      columns: [
        { key: 'description', labelKey: 'invoice.description' },
        { key: 'hours', labelKey: 'invoice.engine.fields.hours', align: 'center' as const },
        { key: 'rate', labelKey: 'invoice.engine.fields.hourlyRate', align: 'end' as const },
        { key: 'amount', labelKey: 'invoice.amount', align: 'end' as const },
      ],
      rows: [
        {
          description: desc,
          hours,
          rate,
          amount: roundMoney(hours * rate),
        },
      ],
    }
  }

  const milestones = v.milestones ?? []
  return {
    id: 'breakdown',
    titleKey: 'invoice.engine.sections.service',
    columns: [
      { key: 'milestone', labelKey: 'invoice.engine.fields.milestoneColumn' },
      { key: 'name', labelKey: 'invoice.engine.fields.milestoneName' },
      { key: 'amount', labelKey: 'invoice.amount', align: 'end' as const },
    ],
    rows: milestones.map((m, i) => ({
      milestone: i + 1,
      name: m.title || '—',
      amount: m.amount,
    })),
  }
}

export function calculateService(values: Record<string, unknown>): CalculationResult {
  const v = parseServiceValues(values, false)

  let subtotal = 0
  if (v.pricingModel === 'fixed') {
    subtotal = roundMoney(v.fixedAmount ?? 0)
  } else if (v.pricingModel === 'hourly') {
    subtotal = roundMoney((v.hours ?? 0) * (v.hourlyRate ?? 0))
  } else {
    subtotal = roundMoney((v.milestones ?? []).reduce((s, m) => s + m.amount, 0))
  }

  const discount = v.discount ?? 0
  const afterDiscount = roundMoney(subtotal - discount)
  const taxAmount = applyTax(afterDiscount, v.taxRate ?? 0)
  const total = clampNonNegative(roundMoney(afterDiscount + taxAmount))

  return {
    subtotal,
    taxRate: v.taxRate,
    taxAmount: taxAmount || undefined,
    discount: discount || undefined,
    total,
    summaryLines: [
      { labelKey: 'invoice.subtotal', amount: subtotal },
      ...(discount > 0 ? [{ labelKey: 'invoice.discount', amount: discount, variant: 'discount' as const }] : []),
      ...(taxAmount > 0 ? [{ labelKey: 'invoice.tax', labelParams: { rate: v.taxRate ?? 0 }, amount: taxAmount }] : []),
    ],
    displayTables: [buildServiceDisplayTable(v)],
    badges: [],
  }
}

export const servicePluginMeta = {
  type: 'service' as const,
  labelKey: 'invoice.types.service.label',
  descriptionKey: 'invoice.types.service.description',
  icon: 'Wrench',
  sections: serviceSections,
  defaultValues: serviceDefaultValues,
}
