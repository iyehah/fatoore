import type { FormSectionSchema } from './types'

export const customerSection: FormSectionSchema = {
  id: 'customer',
  titleKey: 'invoice.engine.sections.customer',
  fields: [
    { id: 'clientName', type: 'text', labelKey: 'client.name', required: true },
    {
      id: 'clientGender',
      type: 'select',
      labelKey: 'invoice.engine.fields.gender',
      options: [
        { value: 'M', labelKey: 'invoice.engine.gender.M' },
        { value: 'F', labelKey: 'invoice.engine.gender.F' },
      ],
    },
    { id: 'clientPhone', type: 'text', labelKey: 'client.phone' },
    { id: 'clientAddress', type: 'textarea', labelKey: 'client.address' },
  ],
}

export const paymentSection: FormSectionSchema = {
  id: 'payment',
  titleKey: 'invoice.engine.sections.payment',
  fields: [
    { id: 'paymentMethod', type: 'text', labelKey: 'invoice.paymentMethod' },
    { id: 'paymentDetails', type: 'textarea', labelKey: 'invoice.paymentDetails', colSpan: 2 },
    { id: 'dueDate', type: 'date', labelKey: 'invoice.dueDate' },
    { id: 'notes', type: 'textarea', labelKey: 'invoice.notes', colSpan: 2 },
  ],
}

export const totalsSection: FormSectionSchema = {
  id: 'totals',
  titleKey: 'invoice.engine.sections.totals',
  fields: [
    { id: 'taxRate', type: 'percent', labelKey: 'invoice.tax', min: 0, max: 100, defaultValue: 0 },
    { id: 'discount', type: 'currency', labelKey: 'invoice.discount', min: 0, defaultValue: 0 },
  ],
}

export function sharedCustomerPaymentSections(): FormSectionSchema[] {
  return [customerSection, paymentSection]
}
