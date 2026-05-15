'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppFontPreference } from '@/components/font-provider'
import { useLanguage } from '@/hooks/use-language'
import { ACTIVE_LANGUAGE_CODES, COMING_SOON_DIALECTS, isActiveLanguage } from '@/lib/i18n-config'
import { fontOptions, fontRegistry, type FontKey } from '@/lib/fonts/registry'
import { cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'light' as const, icon: Sun, labelKey: 'theme.light' },
  { value: 'dark' as const, icon: Moon, labelKey: 'theme.dark' },
  { value: 'system' as const, icon: Monitor, labelKey: 'theme.system' },
]

export function AppSettingsMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t, direction } = useLanguage()
  const { fontKey, setFontKey } = useAppFontPreference()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenu dir={direction} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'shrink-0 border-border/70 bg-background/90 backdrop-blur-sm',
            'hover:bg-accent/80',
            className,
          )}
          aria-label={t('settings.menuTitle')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,20rem)] p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold leading-tight">{t('settings.menuTitle')}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{t('settings.description')}</p>
        </div>
        <div className="max-h-[min(70vh,26rem)] overflow-y-auto overscroll-contain">
          <div className="space-y-4 p-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.theme')}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => {
                  const active = mounted && theme === value
                  return (
                    <Button
                      key={value}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-auto flex-col gap-1 py-2.5 font-normal',
                        !active && 'border-dashed bg-muted/30',
                      )}
                      onClick={() => setTheme(value)}
                    >
                      <Icon className="h-4 w-4 opacity-90" />
                      <span className="text-[10px] leading-tight">{t(labelKey)}</span>
                    </Button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t('settings.themeDescription')}</p>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.fontFamily')}
              </p>
              <Select
                value={fontKey}
                onValueChange={(value) => {
                  if (value in fontRegistry) setFontKey(value as FontKey)
                }}
              >
                <SelectTrigger
                  dir={direction}
                  size="sm"
                  className="h-auto min-h-9 w-full whitespace-normal py-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  dir={direction}
                  position="popper"
                  className="max-h-[min(50vh,16rem)] w-[var(--radix-select-trigger-width)]"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {fontOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {t('settings.fontFamilyDescription')}
              </p>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.language')}
              </p>
              <Select
                value={language}
                onValueChange={(value) => {
                  if (isActiveLanguage(value)) setLanguage(value)
                }}
              >
                <SelectTrigger
                  dir={direction}
                  size="sm"
                  className="h-auto min-h-9 w-full whitespace-normal py-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  dir={direction}
                  position="popper"
                  className="max-h-[min(50vh,16rem)] w-(--radix-select-trigger-width)"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {ACTIVE_LANGUAGE_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {t(`languages.${code}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.languageDescription')} ({t('dialects.soonHint')})
              </p>
              <Select>
                <SelectTrigger
                  dir={direction}
                  size="sm"
                  className="h-auto min-h-9 w-full whitespace-normal py-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <SelectValue placeholder={t('dialects.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent
                  dir={direction}
                  position="popper"
                  className="max-h-[min(50vh,16rem)] w-(--radix-select-trigger-width)"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {COMING_SOON_DIALECTS.map((d) => (
                    <SelectItem key={d.id} value={d.id} disabled className="cursor-not-allowed">
                      <span className="flex w-full min-w-0 items-center justify-between gap-2 pr-1">
                        <span className="truncate">{t(d.labelKey)}</span>
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-normal tabular-nums">
                          {t('layout.comingSoon')}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
