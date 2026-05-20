'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InvoiceBadgeProps {
  children: ReactNode
  className?: string
}

/** Pill badge using invoice dynamic accent color and border (--inv-accent, --inv-badge-border). */
export function InvoiceBadge({ children, className }: InvoiceBadgeProps) {
  return <span className={cn('invoice-badge', className)}>{children}</span>
}
