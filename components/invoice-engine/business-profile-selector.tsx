'use client'

import Image from 'next/image'
import { useLanguage } from '@/hooks/use-language'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface BusinessProfileSelectorProps {
  profiles: BusinessProfileStored[]
  value: string | null
  onChange: (id: string) => void
  defaultProfileId?: string | null
}

export function BusinessProfileSelector({
  profiles,
  value,
  onChange,
  defaultProfileId,
}: BusinessProfileSelectorProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('invoice.selectBusiness')}
      </span>
      <ScrollArea className="w-full">
        <div
          className="flex w-max gap-1.5 px-1 pb-3 pt-1.5"
          role="listbox"
          aria-label={t('invoice.selectBusiness')}
        >
          {profiles.map((p) => {
            const selected = value === p.id
            const title = [
              p.storeName,
              p.taxId ? `${t('profile.taxId')}: ${p.taxId}` : t('invoice.noTaxIdOnProfile'),
              defaultProfileId === p.id ? t('profile.defaultBadge') : '',
            ]
              .filter(Boolean)
              .join(' · ')

            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                title={title}
                onClick={() => onChange(p.id)}
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
                >
                  {p.logo ? (
                    <Image
                      src={p.logo}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      className="h-4 w-4 object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-[10px] font-bold leading-none">
                      {(p.storeName || '?').charAt(0)}
                    </span>
                  )}
                </span>
                <span className="max-w-[10rem] truncate">{p.storeName}</span>
                {defaultProfileId === p.id && (
                  <span
                    className={cn(
                      'rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                      selected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {t('profile.defaultBadge')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
