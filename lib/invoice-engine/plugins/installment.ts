import { z } from 'zod'
import { customerFieldDefaults, customerFieldsZod, coerceCustomerFields } from '../customer-fields'
import { draftNum, draftOptStr, draftStr, pickForCalculation, todayIso } from '../coerce-draft'
import { applyPaidAmountToSchedule, sumPaidFromSchedule } from '../installment-schedule'
import { addInterval, clampNonNegative, roundMoney, splitEqual } from '../math'
import type { CalculationResult, FormSectionSchema } from '../types'
import type { InstallmentRow } from '@/types/invoice'
import {
  coercePaymentFields,
  customerSection,
  paymentFieldDefaults,
  paymentFieldsZod,
  paymentSection,
} from '../shared-fields'

const installmentRowSchema = z.object({
  amount: z.coerce.number().min(0),
  dueDate: z.string().min(1),
  status: z.enum(['paid', 'unpaid', 'partial', 'late']).default('unpaid'),
  paidAmount: z.coerce.number().min(0).optional(),
})

export const installmentZodSchema = z.object({
  ...customerFieldsZod,
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  totalAmount: z.coerce.number().min(0),
  scheduleMode: z.enum(['count', 'custom']),
  installmentCount: z.coerce.number().min(1).max(60).optional(),
  scheduleStartDate: z.string().optional(),
  installmentInterval: z.enum(['day', 'week', 'month', 'year']).optional(),
  interestOrFees: z.coerce.number().min(0).optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  installments: z.array(installmentRowSchema).optional(),
  ...paymentFieldsZod,
})

export const installmentSections: FormSectionSchema[] = [
  customerSection,
  {
    id: 'installment',
    titleKey: 'invoice.engine.sections.installment',
    fields: [
      { id: 'totalAmount', type: 'currency', labelKey: 'invoice.engine.fields.totalAmount', required: true, min: 0 },
      {
        id: 'scheduleMode',
        type: 'select',
        labelKey: 'invoice.engine.fields.scheduleMode',
        defaultValue: 'count',
        options: [
          { value: 'count', labelKey: 'invoice.engine.scheduleModes.count' },
          { value: 'custom', labelKey: 'invoice.engine.scheduleModes.custom' },
        ],
      },
      {
        id: 'scheduleStartDate',
        type: 'date',
        labelKey: 'invoice.engine.fields.scheduleStartDate',
        visibleWhen: { field: 'scheduleMode', equals: 'count' },
      },
      {
        id: 'installmentInterval',
        type: 'select',
        labelKey: 'invoice.engine.fields.installmentInterval',
        visibleWhen: { field: 'scheduleMode', equals: 'count' },
        defaultValue: 'month',
        options: [
          { value: 'day', labelKey: 'invoice.engine.intervalUnits.day' },
          { value: 'week', labelKey: 'invoice.engine.intervalUnits.week' },
          { value: 'month', labelKey: 'invoice.engine.intervalUnits.month' },
          { value: 'year', labelKey: 'invoice.engine.intervalUnits.year' },
        ],
      },
      {
        id: 'installmentCount',
        type: 'number',
        labelKey: 'invoice.engine.fields.installmentCount',
        visibleWhen: { field: 'scheduleMode', equals: 'count' },
        min: 1,
        max: 60,
        defaultValue: 3,
      },
      {
        id: 'paidAmount',
        type: 'currency',
        labelKey: 'invoice.engine.fields.paidAmount',
        visibleWhen: { field: 'scheduleMode', equals: 'count' },
        min: 0,
        defaultValue: 0,
        colSpan: 2,
      },
      {
        id: 'interestOrFees',
        type: 'currency',
        labelKey: 'invoice.engine.fields.interestOrFees',
        min: 0,
        defaultValue: 0,
      },
      {
        id: 'installments',
        type: 'array',
        labelKey: 'invoice.engine.fields.installments',
        visibleWhen: { field: 'scheduleMode', equals: 'custom' },
        itemLabelKey: 'invoice.engine.fields.installmentRow',
        itemFields: [
          { id: 'amount', type: 'currency', labelKey: 'invoice.amount', required: true, min: 0 },
          { id: 'dueDate', type: 'date', labelKey: 'invoice.dueDate', required: true },
          {
            id: 'status',
            type: 'select',
            labelKey: 'invoice.engine.fields.installmentStatus',
            defaultValue: 'unpaid',
            options: [
              { value: 'unpaid', labelKey: 'invoice.engine.installmentStatus.unpaid' },
              { value: 'paid', labelKey: 'invoice.engine.installmentStatus.paid' },
              { value: 'partial', labelKey: 'invoice.engine.installmentStatus.partial' },
              { value: 'late', labelKey: 'invoice.engine.installmentStatus.late' },
            ],
          },
          {
            id: 'paidAmount',
            type: 'currency',
            labelKey: 'invoice.engine.fields.paidColumn',
            min: 0,
            defaultValue: 0,
            visibleWhen: { field: 'status', equals: 'partial' },
          },
        ],
      },
    ],
  },
  paymentSection,
]

export const installmentDefaultValues: Record<string, unknown> = {
  ...customerFieldDefaults,
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  totalAmount: 0,
  scheduleMode: 'count',
  scheduleStartDate: new Date().toISOString().slice(0, 10),
  installmentInterval: 'month',
  installmentCount: 3,
  paidAmount: 0,
  interestOrFees: 0,
  installments: [{ amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: 'unpaid' }],
  ...paymentFieldDefaults,
}

type InstallmentCalcInput = z.infer<typeof installmentZodSchema>

function buildEqualSchedule(values: InstallmentCalcInput): Omit<InstallmentRow, 'id'>[] {
  const fees = values.interestOrFees ?? 0
  const grand = roundMoney(values.totalAmount + fees)
  const count = values.installmentCount ?? 3
  const parts = splitEqual(grand, count)
  const start = values.scheduleStartDate || values.dueDate || todayIso()
  const interval =
    values.installmentInterval === 'day' ||
    values.installmentInterval === 'week' ||
    values.installmentInterval === 'year'
      ? values.installmentInterval
      : 'month'

  const base = parts.map((amount, i) => ({
    amount,
    dueDate: addInterval(start, i, interval),
  }))

  return applyPaidAmountToSchedule(base, values.paidAmount ?? 0)
}

function buildCustomSchedule(values: InstallmentCalcInput): Omit<InstallmentRow, 'id'>[] {
  const rows = values.installments ?? []
  return rows.map((row) => {
    const amount = roundMoney(row.amount)
    let paidAmount = 0
    if (row.status === 'paid') paidAmount = amount
    else if (row.status === 'partial') {
      paidAmount = roundMoney(Math.min(amount, row.paidAmount ?? 0))
    }
    return { amount, dueDate: row.dueDate, status: row.status, paidAmount }
  })
}

function buildInstallmentSchedule(values: InstallmentCalcInput): InstallmentRow[] {
  const rows =
    values.scheduleMode === 'custom' && values.installments?.length
      ? buildCustomSchedule(values)
      : buildEqualSchedule(values)

  return rows.map((row, i) => ({
    id: `inst-${i}`,
    ...row,
  }))
}

function coerceInstallmentValues(merged: Record<string, unknown>): InstallmentCalcInput {
  const scheduleMode = merged.scheduleMode === 'custom' ? 'custom' : 'count'
  const installments = Array.isArray(merged.installments)
    ? (merged.installments as Record<string, unknown>[]).map((row) => ({
        amount: draftNum(row?.amount),
        dueDate: draftStr(row?.dueDate, todayIso()),
        status:
          row?.status === 'paid' || row?.status === 'partial' || row?.status === 'late'
            ? row.status
            : ('unpaid' as const),
        paidAmount: draftNum(row?.paidAmount),
      }))
    : []

  return {
    ...coerceCustomerFields(merged),
    clientName: draftStr(merged.clientName),
    clientPhone: draftOptStr(merged.clientPhone),
    clientAddress: draftOptStr(merged.clientAddress),
    totalAmount: draftNum(merged.totalAmount),
    scheduleMode,
    installmentCount: Math.max(1, Math.min(60, Math.round(draftNum(merged.installmentCount, 3)))),
    scheduleStartDate: draftStr(merged.scheduleStartDate, todayIso()),
    installmentInterval:
      merged.installmentInterval === 'day' ||
      merged.installmentInterval === 'week' ||
      merged.installmentInterval === 'year'
        ? merged.installmentInterval
        : 'month',
    interestOrFees: draftNum(merged.interestOrFees),
    paidAmount: draftNum(merged.paidAmount),
    installments,
    ...coercePaymentFields(merged),
  }
}

export function parseInstallmentValues(values: Record<string, unknown>, strict = false) {
  if (strict) return installmentZodSchema.parse(values)
  return pickForCalculation(
    values,
    (input) => installmentZodSchema.safeParse(input),
    coerceInstallmentValues,
    installmentDefaultValues,
  )
}

export function calculateInstallment(values: Record<string, unknown>): CalculationResult {
  const v = parseInstallmentValues(values, false)
  const schedule = buildInstallmentSchedule(v)
  const subtotal = roundMoney(v.totalAmount)
  const fees = v.interestOrFees ?? 0
  const total = roundMoney(subtotal + fees)
  const paid = sumPaidFromSchedule(schedule)
  const remaining = clampNonNegative(roundMoney(total - paid))

  return {
    subtotal,
    total,
    summaryLines: [
      { labelKey: 'invoice.engine.fields.totalAmount', amount: subtotal },
      ...(fees > 0 ? [{ labelKey: 'invoice.engine.fields.interestOrFees', amount: fees }] : []),
      { labelKey: 'invoice.engine.fields.paidToDate', amount: paid },
      { labelKey: 'invoice.engine.fields.remainingBalance', amount: remaining, emphasis: true },
    ],
    displayTables: [
      {
        id: 'installments',
        titleKey: 'invoice.engine.sections.installment',
        columns: [
          { key: 'installment', labelKey: 'invoice.engine.fields.installmentColumn' },
          { key: 'dueDate', labelKey: 'invoice.dueDate' },
          { key: 'amount', labelKey: 'invoice.amount', align: 'end' },
          { key: 'paid', labelKey: 'invoice.engine.fields.paidColumn', align: 'end' },
          { key: 'status', labelKey: 'invoice.engine.fields.installmentStatus', align: 'center' },
        ],
        rows: schedule.map((r, i) => ({
          installment: i + 1,
          dueDate: r.dueDate,
          amount: r.amount,
          paid: r.paidAmount ?? (r.status === 'paid' ? r.amount : 0),
          status: r.status,
        })),
      },
    ],
    badges: [],
  }
}

export function resolveInstallmentSchedule(
  values: Record<string, unknown>,
  strict: boolean,
): InstallmentRow[] {
  const v = parseInstallmentValues(values, strict)
  return buildInstallmentSchedule(v)
}

export const installmentPluginMeta = {
  type: 'installment' as const,
  labelKey: 'invoice.types.installment.label',
  descriptionKey: 'invoice.types.installment.description',
  icon: 'Layers',
  sections: installmentSections,
  defaultValues: installmentDefaultValues,
}
