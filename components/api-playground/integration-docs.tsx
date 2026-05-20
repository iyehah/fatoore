'use client'

import { Info } from 'lucide-react'
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
