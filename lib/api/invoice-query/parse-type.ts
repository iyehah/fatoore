import { getPlugin, isInvoiceType } from '@/lib/invoice-engine/registry'
import type { InvoiceType } from '@/types/invoice'
import { MAX_ITEMS } from './types'
import { parseJsonParam, parseNumberParam, parseBooleanParam, sanitizeString } from './sanitize'

function parseItemsArray(params: URLSearchParams): Record<string, unknown>[] | undefined {
  const json = params.get('items')
  if (json) {
    const parsed = parseJsonParam<unknown[]>(json, 'items')
    if (!Array.isArray(parsed)) throw new Error('items must be a JSON array')
    return parsed.slice(0, MAX_ITEMS).map((row, i) => {
      if (!row || typeof row !== 'object') throw new Error(`items[${i}] must be an object`)
      const r = row as Record<string, unknown>
      return {
        description: String(r.description ?? '').slice(0, 500),
        quantity: Math.max(Number(r.quantity) || 1, 0.01),
        unitPrice: Math.max(Number(r.unitPrice) || 0, 0),
      }
    })
  }

  const items: Record<string, unknown>[] = []
  for (let i = 0; i < MAX_ITEMS; i++) {
    const desc = params.get(`item${i}_desc`) ?? params.get(`items[${i}][description]`)
    if (!desc) break
    items.push({
      description: desc.slice(0, 500),
      quantity: Math.max(parseNumberParam(params.get(`item${i}_qty`) ?? params.get(`items[${i}][quantity]`)) ?? 1, 0.01),
      unitPrice: Math.max(parseNumberParam(params.get(`item${i}_price`) ?? params.get(`items[${i}][unitPrice]`)) ?? 0, 0),
    })
  }
  return items.length ? items : undefined
}

function parseMilestones(params: URLSearchParams): Record<string, unknown>[] | undefined {
  const json = params.get('milestones')
  if (!json) return undefined
  const parsed = parseJsonParam<unknown[]>(json, 'milestones')
  if (!Array.isArray(parsed)) throw new Error('milestones must be a JSON array')
  return parsed.slice(0, MAX_ITEMS).map((row, i) => {
    if (!row || typeof row !== 'object') throw new Error(`milestones[${i}] must be an object`)
    const r = row as Record<string, unknown>
    return {
      title: String(r.title ?? '').slice(0, 200),
      amount: Math.max(Number(r.amount) || 0, 0),
    }
  })
}

function parseInstallments(params: URLSearchParams): Record<string, unknown>[] | undefined {
  const json = params.get('installments')
  if (!json) return undefined
  const parsed = parseJsonParam<unknown[]>(json, 'installments')
  if (!Array.isArray(parsed)) throw new Error('installments must be a JSON array')
  return parsed.slice(0, MAX_ITEMS).map((row, i) => {
    if (!row || typeof row !== 'object') throw new Error(`installments[${i}] must be an object`)
    const r = row as Record<string, unknown>
    const status = r.status
    const validStatus =
      status === 'paid' || status === 'unpaid' || status === 'partial' || status === 'late'
        ? status
        : 'unpaid'
    return {
      amount: Math.max(Number(r.amount) || 0, 0),
      dueDate: String(r.dueDate ?? new Date().toISOString().slice(0, 10)),
      status: validStatus,
      paidAmount: r.paidAmount != null ? Math.max(Number(r.paidAmount) || 0, 0) : undefined,
    }
  })
}

export function parseTypeSpecificValues(
  type: InvoiceType,
  params: URLSearchParams,
): Record<string, unknown> {
  const extra: Record<string, unknown> = {}

  switch (type) {
    case 'sales': {
      const items = parseItemsArray(params)
      if (items?.length) extra.items = items
      const shipping = parseNumberParam(params.get('shipping'))
      if (shipping != null) extra.shipping = shipping
      break
    }
    case 'subscription': {
      const planName = sanitizeString(params.get('planName'))
      if (planName) extra.planName = planName
      const cycle = params.get('billingCycle')?.trim()
      if (cycle === 'weekly' || cycle === 'monthly' || cycle === 'yearly') {
        extra.billingCycle = cycle
      }
      const startDate = sanitizeString(params.get('startDate'))
      if (startDate) extra.startDate = startDate
      const endDate = sanitizeString(params.get('endDate'))
      if (endDate) extra.endDate = endDate
      extra.autoRenew = parseBooleanParam(params.get('autoRenew'), true)
      const pricePerCycle = parseNumberParam(params.get('pricePerCycle'))
      if (pricePerCycle != null) extra.pricePerCycle = pricePerCycle
      break
    }
    case 'service': {
      const serviceDescription = sanitizeString(params.get('serviceDescription'))
      if (serviceDescription) extra.serviceDescription = serviceDescription
      const pricingModel = params.get('pricingModel')?.trim()
      if (pricingModel === 'fixed' || pricingModel === 'hourly' || pricingModel === 'milestone') {
        extra.pricingModel = pricingModel
      }
      const fixedAmount = parseNumberParam(params.get('fixedAmount'))
      if (fixedAmount != null) extra.fixedAmount = fixedAmount
      const hours = parseNumberParam(params.get('hours'))
      if (hours != null) extra.hours = hours
      const hourlyRate = parseNumberParam(params.get('hourlyRate'))
      if (hourlyRate != null) extra.hourlyRate = hourlyRate
      const milestones = parseMilestones(params)
      if (milestones?.length) extra.milestones = milestones
      break
    }
    case 'booking': {
      const bookingDate = sanitizeString(params.get('bookingDate'))
      if (bookingDate) extra.bookingDate = bookingDate
      const bookingTime = sanitizeString(params.get('bookingTime'))
      if (bookingTime) extra.bookingTime = bookingTime
      const duration = sanitizeString(params.get('duration'))
      if (duration) extra.duration = duration
      const serviceType = sanitizeString(params.get('serviceType'))
      if (serviceType) extra.serviceType = serviceType
      const deposit = parseNumberParam(params.get('deposit'))
      if (deposit != null) extra.deposit = deposit
      const totalPrice = parseNumberParam(params.get('totalPrice'))
      if (totalPrice != null) extra.totalPrice = totalPrice
      const bookingStatus = params.get('bookingStatus')?.trim()
      if (
        bookingStatus === 'confirmed' ||
        bookingStatus === 'cancelled' ||
        bookingStatus === 'completed'
      ) {
        extra.bookingStatus = bookingStatus
      }
      break
    }
    case 'installment': {
      const totalAmount = parseNumberParam(params.get('totalAmount'))
      if (totalAmount != null) extra.totalAmount = totalAmount
      const scheduleMode = params.get('scheduleMode')?.trim()
      if (scheduleMode === 'count' || scheduleMode === 'custom') extra.scheduleMode = scheduleMode
      const installmentCount = parseNumberParam(params.get('installmentCount'))
      if (installmentCount != null) extra.installmentCount = installmentCount
      const scheduleStartDate = sanitizeString(params.get('scheduleStartDate'))
      if (scheduleStartDate) extra.scheduleStartDate = scheduleStartDate
      const installmentInterval = params.get('installmentInterval')?.trim()
      if (
        installmentInterval === 'day' ||
        installmentInterval === 'week' ||
        installmentInterval === 'month' ||
        installmentInterval === 'year'
      ) {
        extra.installmentInterval = installmentInterval
      }
      const interestOrFees = parseNumberParam(params.get('interestOrFees'))
      if (interestOrFees != null) extra.interestOrFees = interestOrFees
      const paidAmount = parseNumberParam(params.get('paidAmount'))
      if (paidAmount != null) extra.paidAmount = paidAmount
      const installments = parseInstallments(params)
      if (installments?.length) extra.installments = installments
      break
    }
  }

  return extra
}

export function mergeWithPluginDefaults(
  type: InvoiceType,
  common: Record<string, unknown>,
  specific: Record<string, unknown>,
): Record<string, unknown> {
  const plugin = getPlugin(type)
  return { ...plugin.defaultValues, ...common, ...specific }
}

export function parseInvoiceType(params: URLSearchParams): InvoiceType {
  const raw = params.get('type')?.trim().toLowerCase() ?? 'sales'
  if (!isInvoiceType(raw)) throw new Error(`Unknown invoice type: ${raw}`)
  return raw
}
