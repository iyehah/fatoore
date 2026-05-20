export function clampNonNegative(n: number): number {
  return Math.max(0, n)
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function applyDiscount(amount: number, discount = 0): number {
  return clampNonNegative(amount - discount)
}

export function applyTax(amount: number, taxRate = 0): number {
  if (!taxRate || taxRate <= 0) return 0
  return roundMoney(amount * (taxRate / 100))
}

export function splitEqual(total: number, count: number): number[] {
  if (count <= 0) return []
  const base = roundMoney(total / count)
  const parts = Array.from({ length: count }, () => base)
  const diff = roundMoney(total - parts.reduce((s, v) => s + v, 0))
  if (parts.length > 0) parts[parts.length - 1] = roundMoney(parts[parts.length - 1] + diff)
  return parts
}

export function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function addInterval(
  isoDate: string,
  index: number,
  unit: 'day' | 'week' | 'month' | 'year',
): string {
  switch (unit) {
    case 'day':
      return addDays(isoDate, index)
    case 'week':
      return addWeeks(isoDate, index)
    case 'year':
      return addYears(isoDate, index)
    default:
      return addMonths(isoDate, index)
  }
}

export function addWeeks(isoDate: string, weeks: number): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().slice(0, 10)
}

export function addYears(isoDate: string, years: number): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}

export function nextBillingDate(
  startDate: string,
  cycle: 'weekly' | 'monthly' | 'yearly',
): string {
  switch (cycle) {
    case 'weekly':
      return addWeeks(startDate, 1)
    case 'yearly':
      return addYears(startDate, 1)
    default:
      return addMonths(startDate, 1)
  }
}
