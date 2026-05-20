'use client'

import { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDisplayDateFromValue } from '@/lib/format-display-date'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

export type DatePickerValueFormat = 'date' | 'iso-noon'

function toDayString(value: string | undefined): string {
  if (!value) return ''
  const day = value.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day
  const d = parseISO(value)
  return isValid(d) ? format(d, 'yyyy-MM-dd') : ''
}

function formatOutgoing(day: string, valueFormat: DatePickerValueFormat): string {
  if (!day) return ''
  return valueFormat === 'iso-noon' ? `${day}T12:00:00.000Z` : day
}

export interface DatePickerFieldProps {
  value?: string
  onChange: (value: string) => void
  /** `date` → `yyyy-MM-dd`; `iso-noon` → `yyyy-MM-ddT12:00:00.000Z` */
  valueFormat?: DatePickerValueFormat
  pickLabel?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
  id?: string
}

export function DatePickerField({
  value,
  onChange,
  valueFormat = 'date',
  pickLabel,
  className,
  buttonClassName,
  disabled,
  id,
}: DatePickerFieldProps) {
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const placeholder = pickLabel ?? t('invoice.pickDueDate')
  const day = toDayString(value)
  const selected = day ? parseISO(day) : undefined
  const label = formatDisplayDateFromValue(value, language, placeholder)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-11 w-full justify-start ps-3 text-start font-normal',
            buttonClassName,
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
          <span suppressHydrationWarning className={cn(!day && 'text-muted-foreground')}>
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', className)} align="start">
        <Calendar
          mode="single"
          selected={selected && isValid(selected) ? selected : undefined}
          onSelect={(d) => {
            onChange(formatOutgoing(d ? format(d, 'yyyy-MM-dd') : '', valueFormat))
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
