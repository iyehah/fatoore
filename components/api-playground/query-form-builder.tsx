'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceTypeSelector } from '@/components/invoice-engine/invoice-type-selector'
import { PaymentMethodSelect } from '@/components/payment/payment-method-select'
import { useLanguage } from '@/hooks/use-language'
import { fontOptions } from '@/lib/fonts/registry'
import { isFontKey } from '@/lib/api/invoice-query/parse-font'
import { INVOICE_API_DEFAULTS } from '@/lib/api/invoice-query/types'
import { isInvoiceType } from '@/lib/invoice-engine/registry'
import type { InvoiceType } from '@/types/invoice'
import {
  defaultPlaygroundFormState,
  mergePlaygroundStateForType,
} from './example-presets'
import { DatePickerField } from '@/components/ui/date-picker-field'
import { ApiAccentPicker } from './api-accent-picker'
import { ApiOptionsCard } from './api-options-card'
import { TypeSpecificFields } from './type-specific-fields'

export interface QueryFormState {
  [key: string]: string
}

interface QueryFormBuilderProps {
  state: QueryFormState
  onChange: (next: QueryFormState) => void
}

export function QueryFormBuilder({ state, onChange }: QueryFormBuilderProps) {
  const { t } = useLanguage()
  const type = (state.type ?? INVOICE_API_DEFAULTS.type) as InvoiceType

  const set = (key: string, value: string) => onChange({ ...state, [key]: value })
  const autoInvoiceNumber = state.autoInvoiceNumber !== 'false'

  return (
    <div className="space-y-6">
      <InvoiceTypeSelector
        value={type}
        onChange={(next) => {
          if (next === type) return
          onChange(mergePlaygroundStateForType(state, next))
        }}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('api.form.render')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <ToolbarSelect
              label={t('api.form.format')}
              value={state.format ?? 'img'}
              onValueChange={(v) => set('format', v)}
              options={[
                { value: 'img', label: 'img' },
                { value: 'pdf', label: 'pdf' },
              ]}
            />
            <ToolbarSelect
              label={t('api.form.lang')}
              value={state.lang ?? 'en'}
              onValueChange={(v) => set('lang', v)}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'ar', label: 'AR' },
                { value: 'fr', label: 'FR' },
              ]}
            />
            <ToolbarSelect
              label={t('api.form.size')}
              value={state.size ?? 'm'}
              onValueChange={(v) => set('size', v)}
              options={[
                { value: 's', label: 'S' },
                { value: 'm', label: 'M' },
                { value: 'l', label: 'L' },
              ]}
            />
            <ToolbarSelect
              label={t('api.form.font')}
              value={state.font && isFontKey(state.font) ? state.font : 'geist'}
              onValueChange={(v) => set('font', v)}
              options={fontOptions.map((f) => ({ value: f.key, label: f.label }))}
              className="min-w-34"
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">{t('api.form.color')}</Label>
            <ApiAccentPicker value={state.color ?? 'default'} onChange={(c) => set('color', c)} />
          </div>
        </CardContent>
      </Card>

      <ApiOptionsCard state={state} onPatch={(patch) => onChange({ ...state, ...patch })} />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.invoiceMeta')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('api.form.createdAt')}>
            <DatePickerField
              value={state.createdAt}
              valueFormat="iso-noon"
              pickLabel={t('api.form.pickDate')}
              buttonClassName="h-9"
              onChange={(v) => set('createdAt', v)}
            />
          </Field>
          <Field label={t('api.form.invoiceNumber')}>
            <Input
              className="h-9"
              dir="ltr"
              disabled={autoInvoiceNumber}
              placeholder={autoInvoiceNumber ? t('api.form.invoiceNumberAuto') : undefined}
              value={state.invoiceNumber ?? ''}
              onChange={(e) => set('invoiceNumber', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.business')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('api.form.businessName')} className="sm:col-span-2">
            <Input className="h-9" value={state.businessName ?? ''} onChange={(e) => set('businessName', e.target.value)} />
          </Field>
          <Field label={t('api.form.businessLogo')} className="sm:col-span-2">
            <Input className="h-9" value={state.businessLogo ?? ''} onChange={(e) => set('businessLogo', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('api.form.businessPhone')}>
            <Input className="h-9" value={state.businessPhone ?? ''} onChange={(e) => set('businessPhone', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('api.form.businessTaxId')}>
            <Input className="h-9" value={state.businessTaxId ?? ''} onChange={(e) => set('businessTaxId', e.target.value)} />
          </Field>
          <Field label={t('api.form.businessAddress')} className="sm:col-span-2">
            <Textarea value={state.businessAddress ?? ''} onChange={(e) => set('businessAddress', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.customer')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('api.form.clientName')} className="sm:col-span-2">
            <Input className="h-9" value={state.clientName ?? ''} onChange={(e) => set('clientName', e.target.value)} />
          </Field>
          <Field label={t('api.form.clientPhone')}>
            <Input className="h-9" value={state.clientPhone ?? ''} onChange={(e) => set('clientPhone', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('invoice.engine.fields.gender')}>
            <Select
              value={state.clientGender || '_none'}
              onValueChange={(v) => set('clientGender', v === '_none' ? '' : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                <SelectItem value="M">{t('invoice.engine.gender.M')}</SelectItem>
                <SelectItem value="F">{t('invoice.engine.gender.F')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('api.form.clientAddress')} className="sm:col-span-2">
            <Textarea value={state.clientAddress ?? ''} onChange={(e) => set('clientAddress', e.target.value)} />
          </Field>
          <Field label={t('api.form.taxRate')}>
            <Input className="h-9" type="number" value={state.taxRate ?? '0'} onChange={(e) => set('taxRate', e.target.value)} />
          </Field>
          <Field label={t('api.form.discount')}>
            <Input className="h-9" type="number" value={state.discount ?? '0'} onChange={(e) => set('discount', e.target.value)} />
          </Field>
          <Field label={t('invoice.dueDate')}>
            <DatePickerField
              value={state.dueDate}
              pickLabel={t('invoice.pickDueDate')}
              buttonClassName="h-9"
              onChange={(v) => set('dueDate', v)}
            />
          </Field>
          <Field label={t('api.form.currency')}>
            <Input className="h-9" value={state.currency ?? 'MRU'} onChange={(e) => set('currency', e.target.value)} />
          </Field>
          <Field label={t('api.form.notes')} className="sm:col-span-2">
            <Textarea value={state.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>
      </section>

      <TypeSpecificFields type={type} state={state} onChange={set} />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('invoice.paymentMethod')}</h3>
        <PaymentMethodSelect
          value={state.paymentMethod || undefined}
          onChange={(id) => set('paymentMethod', id)}
        />
        <Field label={t('invoice.paymentDetails')}>
          <Textarea
            placeholder={t('invoice.paymentDetailsPlaceholder')}
            value={state.paymentDetails ?? ''}
            onChange={(e) => set('paymentDetails', e.target.value)}
            className="min-h-18"
          />
        </Field>
      </section>
    </div>
  )
}

function ToolbarSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 min-w-18 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function defaultFormState(): QueryFormState {
  return defaultPlaygroundFormState()
}

export function formStateToSearchParams(state: QueryFormState): URLSearchParams {
  const p = new URLSearchParams()
  const autoInvoice = state.autoInvoiceNumber !== 'false'
  for (const [k, v] of Object.entries(state)) {
    if (v == null || v === '' || v === '_none') continue
    if (autoInvoice && k === 'invoiceNumber') continue
    p.set(k, v)
  }
  if (!p.has('autoInvoiceNumber')) p.set('autoInvoiceNumber', 'true')
  if (!p.has('type') || !isInvoiceType(p.get('type')!)) p.set('type', 'sales')
  if (!p.has('font')) p.set('font', 'geist')
  return p
}
