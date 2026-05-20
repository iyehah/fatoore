import { z } from 'zod'
import { customerFieldDefaults, customerFieldsZod, coerceCustomerFields } from '../customer-fields'
import { draftNum, draftOptStr, draftStr, pickForCalculation, todayIso } from '../coerce-draft'
import { clampNonNegative, roundMoney } from '../math'
import type { CalculationResult, FormSectionSchema } from '../types'
import { customerSection, paymentSection } from '../shared-fields'

export const bookingZodSchema = z.object({
  ...customerFieldsZod,
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  duration: z.string().min(1),
  serviceType: z.string().optional(),
  deposit: z.coerce.number().min(0),
  totalPrice: z.coerce.number().min(0),
  bookingStatus: z.enum(['confirmed', 'cancelled', 'completed']),
  paymentMethod: z.string().optional(),
  paymentDetails: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
})

export const bookingSections: FormSectionSchema[] = [
  customerSection,
  {
    id: 'booking',
    titleKey: 'invoice.engine.sections.booking',
    fields: [
      { id: 'bookingDate', type: 'date', labelKey: 'invoice.engine.fields.bookingDate', required: true },
      { id: 'bookingTime', type: 'time', labelKey: 'invoice.engine.fields.bookingTime', required: true },
      { id: 'duration', type: 'text', labelKey: 'invoice.engine.fields.duration', required: true },
      { id: 'serviceType', type: 'text', labelKey: 'invoice.engine.fields.serviceType' },
      { id: 'deposit', type: 'currency', labelKey: 'invoice.engine.fields.deposit', min: 0, defaultValue: 0 },
      { id: 'totalPrice', type: 'currency', labelKey: 'invoice.engine.fields.totalPrice', required: true, min: 0 },
      {
        id: 'bookingStatus',
        type: 'select',
        labelKey: 'invoice.engine.fields.bookingStatus',
        defaultValue: 'confirmed',
        options: [
          { value: 'confirmed', labelKey: 'invoice.engine.bookingStatus.confirmed' },
          { value: 'cancelled', labelKey: 'invoice.engine.bookingStatus.cancelled' },
          { value: 'completed', labelKey: 'invoice.engine.bookingStatus.completed' },
        ],
      },
    ],
  },
  paymentSection,
]

export const bookingDefaultValues: Record<string, unknown> = {
  ...customerFieldDefaults,
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  bookingDate: new Date().toISOString().slice(0, 10),
  bookingTime: '09:00',
  duration: '1h',
  serviceType: '',
  deposit: 0,
  totalPrice: 0,
  bookingStatus: 'confirmed',
  paymentMethod: '',
  paymentDetails: '',
  notes: '',
  dueDate: '',
}

function coerceBookingValues(merged: Record<string, unknown>): z.infer<typeof bookingZodSchema> {
  const bookingStatus =
    merged.bookingStatus === 'cancelled' || merged.bookingStatus === 'completed'
      ? merged.bookingStatus
      : 'confirmed'

  return {
    ...coerceCustomerFields(merged),
    clientName: draftStr(merged.clientName),
    clientPhone: draftOptStr(merged.clientPhone),
    clientAddress: draftOptStr(merged.clientAddress),
    bookingDate: draftStr(merged.bookingDate, todayIso()),
    bookingTime: draftStr(merged.bookingTime, '09:00'),
    duration: draftStr(merged.duration, '1h'),
    serviceType: draftOptStr(merged.serviceType),
    deposit: draftNum(merged.deposit),
    totalPrice: draftNum(merged.totalPrice),
    bookingStatus,
    paymentMethod: draftOptStr(merged.paymentMethod),
    paymentDetails: draftOptStr(merged.paymentDetails),
    notes: draftOptStr(merged.notes),
    dueDate: draftOptStr(merged.dueDate),
  }
}

export function parseBookingValues(values: Record<string, unknown>, strict = false) {
  if (strict) return bookingZodSchema.parse(values)
  return pickForCalculation(
    values,
    (input) => bookingZodSchema.safeParse(input),
    coerceBookingValues,
    bookingDefaultValues,
  )
}

export function calculateBooking(values: Record<string, unknown>): CalculationResult {
  const v = parseBookingValues(values, false)

  const subtotal = roundMoney(v.totalPrice)
  const deposit = roundMoney(v.deposit)
  const remaining = clampNonNegative(roundMoney(subtotal - deposit))

  const badgeVariant =
    v.bookingStatus === 'confirmed'
      ? 'success'
      : v.bookingStatus === 'cancelled'
        ? 'destructive'
        : 'default'

  return {
    subtotal,
    total: subtotal,
    summaryLines: [
      { labelKey: 'invoice.engine.fields.totalPrice', amount: subtotal },
      { labelKey: 'invoice.engine.fields.deposit', amount: deposit },
      { labelKey: 'invoice.engine.fields.remainingBalance', amount: remaining, emphasis: true },
    ],
    displayTables: [
      {
        id: 'booking',
        titleKey: 'invoice.engine.sections.booking',
        columns: [
          { key: 'date', labelKey: 'invoice.engine.fields.bookingDate' },
          { key: 'time', labelKey: 'invoice.engine.fields.bookingTime' },
          { key: 'duration', labelKey: 'invoice.engine.fields.duration' },
          { key: 'service', labelKey: 'invoice.engine.fields.serviceType' },
        ],
        rows: [
          {
            date: v.bookingDate,
            time: v.bookingTime,
            duration: v.duration,
            service: v.serviceType || '—',
          },
        ],
      },
    ],
    badges: [
      {
        labelKey: `invoice.engine.bookingStatus.${v.bookingStatus}`,
        variant: badgeVariant as 'default' | 'success' | 'warning' | 'destructive',
      },
    ],
  }
}

export const bookingPluginMeta = {
  type: 'booking' as const,
  labelKey: 'invoice.types.booking.label',
  descriptionKey: 'invoice.types.booking.description',
  icon: 'Calendar',
  sections: bookingSections,
  defaultValues: bookingDefaultValues,
}
