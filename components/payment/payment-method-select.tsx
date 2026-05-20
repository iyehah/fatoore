'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import paymentMethodsConfig from '@/config/payment-methods.json'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface PaymentMethodSelectProps {
  value?: string
  onChange: (value: string) => void
  /** When false, only the pill row is rendered (parent supplies label). */
  showLabel?: boolean
}

export function PaymentMethodSelect({ value, onChange, showLabel = true }: PaymentMethodSelectProps) {
  const { language, t } = useLanguage()

  const methods = paymentMethodsConfig.methods.filter((m) => m.isEnabled)

  const getMethodName = (method: (typeof methods)[0]) => {
    if (language === 'ar') return method.nameAr
    if (language === 'fr') return method.nameFr
    return method.name
  }

  const getHint = (method: (typeof methods)[0]) => {
    if (language === 'ar') return method.instructionsAr
    if (language === 'fr') return method.instructionsFr
    return method.instructions
  }

  const pills = (
    <ScrollArea className="w-full">
      <div
        className="flex w-max gap-1.5 px-1 pb-3 pt-1.5"
        role="radiogroup"
        aria-label={t('invoice.paymentMethod')}
      >
        {methods.map((method) => {
          const selected = value === method.id
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={selected}
              title={getHint(method)}
              onClick={() => onChange(method.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/80 bg-muted/40 text-foreground hover:border-primary/40 hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border',
                  selected
                    ? 'border-primary-foreground/30 bg-primary-foreground/15'
                    : 'border-border/60 bg-white',
                )}
                style={
                  !selected && method.color
                    ? { backgroundColor: `${method.color}18`, borderColor: `${method.color}35` }
                    : undefined
                }
              >
                {method.logo ? (
                  <Image
                    src={method.logo}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className="h-4 w-4 object-contain"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="text-[10px] font-bold leading-none"
                    style={method.color ? { color: method.color } : undefined}
                  >
                    {method.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="max-w-[9rem] truncate">{getMethodName(method)}</span>
            </button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )

  if (!showLabel) return pills

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('invoice.paymentMethod')}
      </span>
      {pills}
    </div>
  )
}
