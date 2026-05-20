import { roundMoney } from './math'
import type { InstallmentRow, InstallmentStatus } from '@/types/invoice'

export function applyPaidAmountToSchedule(
  rows: Omit<InstallmentRow, 'id' | 'status' | 'paidAmount'>[] & { status?: InstallmentStatus }[],
  paidAmount: number,
): Omit<InstallmentRow, 'id'>[] {
  let remaining = roundMoney(Math.max(0, paidAmount))

  return rows.map((row) => {
    const amount = roundMoney(row.amount)
    if (remaining <= 0) {
      return { amount, dueDate: row.dueDate, status: 'unpaid' as const, paidAmount: 0 }
    }
    if (remaining >= amount) {
      remaining = roundMoney(remaining - amount)
      return { amount, dueDate: row.dueDate, status: 'paid' as const, paidAmount: amount }
    }
    const applied = remaining
    remaining = 0
    return { amount, dueDate: row.dueDate, status: 'partial' as const, paidAmount: applied }
  })
}

export function sumPaidFromSchedule(rows: Pick<InstallmentRow, 'paidAmount' | 'status' | 'amount'>[]): number {
  return roundMoney(
    rows.reduce((sum, row) => {
      if (row.status === 'paid') return sum + row.amount
      if (row.status === 'partial') return sum + (row.paidAmount ?? 0)
      return sum
    }, 0),
  )
}
