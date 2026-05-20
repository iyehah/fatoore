import type { Invoice, InvoiceType, SalesInvoiceData } from '@/types/invoice'

function storageKey(userId: string) {
  return `riminvoice-invoices-${userId}`
}

function migrateInvoice(raw: Record<string, unknown>): Invoice {
  const invoice = raw as Invoice & Record<string, unknown>

  if (invoice.invoiceType && invoice.typeData !== undefined) {
    return invoice as Invoice
  }

  const items = Array.isArray(invoice.items) ? invoice.items : []
  const typeData: SalesInvoiceData = {
    items: items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    shipping: typeof invoice.shipping === 'number' ? invoice.shipping : undefined,
  }

  return {
    ...invoice,
    invoiceType: 'sales' satisfies InvoiceType,
    typeData,
  } as Invoice
}

export function loadInvoices(userId: string): Invoice[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((row) => migrateInvoice(row))
  } catch {
    return []
  }
}

export function saveInvoices(userId: string, invoices: Invoice[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(invoices))
}

export function getInvoiceById(userId: string, invoiceId: string): Invoice | null {
  return loadInvoices(userId).find((i) => i.id === invoiceId) ?? null
}

export function addInvoice(userId: string, invoice: Invoice): void {
  const list = loadInvoices(userId)
  saveInvoices(userId, [invoice, ...list])
}

export function updateInvoiceInStore(userId: string, invoiceId: string, updates: Partial<Invoice>): void {
  const list = loadInvoices(userId).map((i) => (i.id === invoiceId ? { ...i, ...updates } : i))
  saveInvoices(userId, list)
}

export function deleteInvoiceFromStore(userId: string, invoiceId: string): void {
  saveInvoices(
    userId,
    loadInvoices(userId).filter((i) => i.id !== invoiceId),
  )
}

export function newInvoiceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
