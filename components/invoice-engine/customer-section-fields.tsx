'use client'

import type { ReactNode } from 'react'
import type { FieldSchema } from '@/lib/invoice-engine/types'
import { cn } from '@/lib/utils'

const CORE_GRID: Record<string, string> = {
  clientName: 'sm:col-span-4',
  clientGender: 'sm:col-span-2',
  clientPhone: 'sm:col-span-3',
  clientAddress: 'sm:col-span-6',
}

interface CustomerSectionFieldsProps {
  fields: FieldSchema[]
  renderField: (field: FieldSchema) => ReactNode
}

export function CustomerSectionFields({ fields, renderField }: CustomerSectionFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      {fields.map((field) => (
        <div key={field.id} className={cn(CORE_GRID[field.id] ?? 'sm:col-span-3')}>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}
