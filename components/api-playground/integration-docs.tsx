'use client'

import { BookOpen, Info } from 'lucide-react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'

const SECTIONS = [
  'types',
  'formats',
  'invoiceNumber',
  'color',
  'logo',
  'items',
  'shared',
] as const

const DOC_BASE =
  'https://github.com/iyehah/fatourati/blob/main/frontend/doc'

const DOC_LINKS = [
  { href: `${DOC_BASE}/README.md`, label: 'Documentation index' },
  { href: `${DOC_BASE}/api-reference.md`, label: 'API reference (full query table)' },
  { href: `${DOC_BASE}/architecture.md`, label: 'Architecture & diagrams' },
  { href: `${DOC_BASE}/branding-and-layout.md`, label: 'Logo, labels, fonts, colors' },
  { href: `${DOC_BASE}/integration-guide.md`, label: 'Integration guide' },
] as const

export function IntegrationDocs() {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          {t('api.docs.title')}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {t('api.docs.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            {t('api.docs.fullDocsTitle')}
          </div>
          <ul className="space-y-1.5 text-sm">
            {DOC_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('api.docs.fullDocsHint')}{' '}
            <Link href="/" className="underline underline-offset-2">
              README
            </Link>
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="types" className="w-full">
          {SECTIONS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                {t(`api.docs.${key}.title`)}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`api.docs.${key}.body`)}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Alert className="border-amber-500/40 bg-amber-500/5">
          <Info className="text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-950 dark:text-amber-100">
            {t('api.docs.authTitle')}
          </AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-200/90">
            {t('api.docs.authNote')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
