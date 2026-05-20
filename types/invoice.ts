export type InvoiceType = 'sales' | 'subscription' | 'service' | 'booking' | 'installment'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceDisplayColumn {
  key: string
  labelKey: string
  align?: 'start' | 'center' | 'end'
}

export interface InvoiceDisplayTable {
  id: string
  titleKey?: string
  columns: InvoiceDisplayColumn[]
  rows: Record<string, string | number>[]
}

export interface InvoiceSummaryLine {
  labelKey: string
  labelParams?: Record<string, string | number>
  amount?: number
  emphasis?: boolean
  variant?: 'default' | 'discount' | 'muted'
}

export interface InvoiceBadge {
  labelKey: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

/** Sales-specific stored payload */
export interface SalesInvoiceData {
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  shipping?: number
}

export interface SubscriptionInvoiceData {
  planName: string
  billingCycle: 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  autoRenew: boolean
  pricePerCycle: number
}

export interface ServiceMilestone {
  id: string
  title: string
  amount: number
}

export interface ServiceInvoiceData {
  serviceDescription: string
  pricingModel: 'fixed' | 'hourly' | 'milestone'
  fixedAmount?: number
  hours?: number
  hourlyRate?: number
  milestones?: ServiceMilestone[]
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

export interface BookingInvoiceData {
  bookingDate: string
  bookingTime: string
  duration: string
  serviceType?: string
  deposit: number
  totalPrice: number
  bookingStatus: BookingStatus
}

export type InstallmentStatus = 'paid' | 'unpaid' | 'partial' | 'late'

export interface InstallmentRow {
  id: string
  amount: number
  dueDate: string
  status: InstallmentStatus
  /** Amount applied toward this row (for partial payments). */
  paidAmount?: number
}

export interface InstallmentInvoiceData {
  totalAmount: number
  scheduleMode: 'count' | 'custom'
  installmentCount?: number
  scheduleStartDate?: string
  installmentInterval?: 'day' | 'week' | 'month' | 'year'
  interestOrFees?: number
  /** Total paid so far (equal-installment mode allocates across rows). */
  paidAmount?: number
  installments: InstallmentRow[]
}

export type ClientGender = 'M' | 'F'
export type ClientCustomInfoStyle = 'simple' | 'badge'

export type InvoiceTypeData =
  | { invoiceType: 'sales'; typeData: SalesInvoiceData }
  | { invoiceType: 'subscription'; typeData: SubscriptionInvoiceData }
  | { invoiceType: 'service'; typeData: ServiceInvoiceData }
  | { invoiceType: 'booking'; typeData: BookingInvoiceData }
  | { invoiceType: 'installment'; typeData: InstallmentInvoiceData }

export interface InvoiceBase {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate?: string
  status: InvoiceStatus
  businessProfileId?: string
  businessName: string
  businessLogo?: string
  businessPhone?: string
  businessAddress?: string
  businessTaxId?: string
  clientName: string
  clientPhone?: string
  clientAddress?: string
  clientGender?: ClientGender
  clientCustomInfoEnabled?: boolean
  clientCustomInfoLabel?: string
  clientCustomInfoValue?: string
  clientCustomInfoStyle?: ClientCustomInfoStyle
  items: InvoiceItem[]
  subtotal: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  shipping?: number
  total: number
  paymentMethod?: string
  paymentDetails?: string
  notes?: string
  /** When false, hides the footer QR code. Defaults to true. */
  showQrCode?: boolean
  userId: string
  currency: string
  summaryLines?: InvoiceSummaryLine[]
  displayTables?: InvoiceDisplayTable[]
  badges?: InvoiceBadge[]
}

export type Invoice = InvoiceBase & InvoiceTypeData

export interface InvoiceDraft {
  invoiceType: InvoiceType
  values: Record<string, unknown>
}

/** @deprecated Use InvoiceDraft — kept for legacy form bridge */
export interface InvoiceFormData {
  clientName: string
  clientPhone?: string
  clientAddress?: string
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  taxRate?: number
  discount?: number
  paymentMethod?: string
  paymentDetails?: string
  notes?: string
  dueDate?: string
  shipping?: number
}

export function getInvoiceType(invoice: Partial<Invoice>): InvoiceType {
  return invoice.invoiceType ?? 'sales'
}
