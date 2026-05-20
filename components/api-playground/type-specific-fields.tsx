'use client'

import { DatePickerField } from '@/components/ui/date-picker-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'
import type { InvoiceType } from '@/types/invoice'
import type { QueryFormState } from './query-form-builder'

interface TypeSpecificFieldsProps {
  type: InvoiceType
  state: QueryFormState
  onChange: (key: string, value: string) => void
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

export function TypeSpecificFields({ type, state, onChange }: TypeSpecificFieldsProps) {
  const { t } = useLanguage()
  const set = (key: string, value: string) => onChange(key, value)

  if (type === 'sales') {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.typeFields')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('invoice.engine.fields.shipping')}>
            <Input
              className="h-9"
              type="number"
              value={state.shipping ?? '0'}
              onChange={(e) => set('shipping', e.target.value)}
            />
          </Field>
          <Field label={t('api.form.itemsJson')} className="sm:col-span-2">
            <Textarea
              className="min-h-25 font-mono text-xs"
              dir="ltr"
              value={state.items ?? ''}
              onChange={(e) => set('items', e.target.value)}
            />
          </Field>
        </div>
      </section>
    )
  }

  if (type === 'subscription') {
    const autoRenew = (state.autoRenew ?? 'true') !== 'false'
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.typeFields')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('invoice.engine.fields.planName')} className="sm:col-span-2">
            <Input className="h-9" value={state.planName ?? ''} onChange={(e) => set('planName', e.target.value)} />
          </Field>
          <Field label={t('invoice.engine.fields.billingCycle')}>
            <Select value={state.billingCycle ?? 'monthly'} onValueChange={(v) => set('billingCycle', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{t('invoice.engine.cycles.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('invoice.engine.cycles.monthly')}</SelectItem>
                <SelectItem value="yearly">{t('invoice.engine.cycles.yearly')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={t('invoice.engine.fields.pricePerCycle')}>
            <Input
              className="h-9"
              type="number"
              value={state.pricePerCycle ?? ''}
              onChange={(e) => set('pricePerCycle', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.startDate')}>
            <DatePickerField
              value={state.startDate}
              pickLabel={t('invoice.pickDueDate')}
              buttonClassName="h-9"
              onChange={(v) => set('startDate', v)}
            />
          </Field>
          {!autoRenew && (
            <Field label={t('invoice.engine.fields.endDate')}>
              <DatePickerField
                value={state.endDate}
                pickLabel={t('invoice.pickDueDate')}
                buttonClassName="h-9"
                onChange={(v) => set('endDate', v)}
              />
            </Field>
          )}
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 sm:col-span-2">
            <Label>{t('invoice.engine.fields.autoRenew')}</Label>
            <Switch
              checked={autoRenew}
              onCheckedChange={(c) => set('autoRenew', String(c))}
            />
          </div>
        </div>
      </section>
    )
  }

  if (type === 'service') {
    const model = state.pricingModel ?? 'fixed'
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.typeFields')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('invoice.engine.fields.serviceDescription')} className="sm:col-span-2">
            <Textarea
              value={state.serviceDescription ?? ''}
              onChange={(e) => set('serviceDescription', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.pricingModel')} className="sm:col-span-2">
            <Select value={model} onValueChange={(v) => set('pricingModel', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{t('invoice.engine.pricingModels.fixed')}</SelectItem>
                <SelectItem value="hourly">{t('invoice.engine.pricingModels.hourly')}</SelectItem>
                <SelectItem value="milestone">{t('invoice.engine.pricingModels.milestone')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {model === 'fixed' && (
            <Field label={t('invoice.engine.fields.fixedAmount')}>
              <Input
                className="h-9"
                type="number"
                value={state.fixedAmount ?? ''}
                onChange={(e) => set('fixedAmount', e.target.value)}
              />
            </Field>
          )}
          {model === 'hourly' && (
            <>
              <Field label={t('invoice.engine.fields.hours')}>
                <Input
                  className="h-9"
                  type="number"
                  value={state.hours ?? '1'}
                  onChange={(e) => set('hours', e.target.value)}
                />
              </Field>
              <Field label={t('invoice.engine.fields.hourlyRate')}>
                <Input
                  className="h-9"
                  type="number"
                  value={state.hourlyRate ?? ''}
                  onChange={(e) => set('hourlyRate', e.target.value)}
                />
              </Field>
            </>
          )}
          {model === 'milestone' && (
            <Field label={t('api.form.milestonesJson')} className="sm:col-span-2">
              <Textarea
                className="min-h-20 font-mono text-xs"
                dir="ltr"
                placeholder='[{"title":"Phase 1","amount":5000}]'
                value={state.milestones ?? ''}
                onChange={(e) => set('milestones', e.target.value)}
              />
            </Field>
          )}
        </div>
      </section>
    )
  }

  if (type === 'booking') {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.typeFields')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('invoice.engine.fields.bookingDate')}>
            <DatePickerField
              value={state.bookingDate}
              pickLabel={t('invoice.pickDueDate')}
              buttonClassName="h-9"
              onChange={(v) => set('bookingDate', v)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.bookingTime')}>
            <Input
              className="h-9"
              type="time"
              dir="ltr"
              value={state.bookingTime ?? ''}
              onChange={(e) => set('bookingTime', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.duration')}>
            <Input className="h-9" value={state.duration ?? ''} onChange={(e) => set('duration', e.target.value)} />
          </Field>
          <Field label={t('invoice.engine.fields.serviceType')}>
            <Input className="h-9" value={state.serviceType ?? ''} onChange={(e) => set('serviceType', e.target.value)} />
          </Field>
          <Field label={t('invoice.engine.fields.deposit')}>
            <Input
              className="h-9"
              type="number"
              value={state.deposit ?? '0'}
              onChange={(e) => set('deposit', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.totalPrice')}>
            <Input
              className="h-9"
              type="number"
              value={state.totalPrice ?? ''}
              onChange={(e) => set('totalPrice', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.bookingStatus')} className="sm:col-span-2">
            <Select value={state.bookingStatus ?? 'confirmed'} onValueChange={(v) => set('bookingStatus', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">{t('invoice.engine.bookingStatus.confirmed')}</SelectItem>
                <SelectItem value="cancelled">{t('invoice.engine.bookingStatus.cancelled')}</SelectItem>
                <SelectItem value="completed">{t('invoice.engine.bookingStatus.completed')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>
    )
  }

  if (type === 'installment') {
    const scheduleMode = state.scheduleMode ?? 'count'
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('api.form.typeFields')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('invoice.engine.fields.totalAmount')}>
            <Input
              className="h-9"
              type="number"
              value={state.totalAmount ?? ''}
              onChange={(e) => set('totalAmount', e.target.value)}
            />
          </Field>
          <Field label={t('invoice.engine.fields.scheduleMode')}>
            <Select value={scheduleMode} onValueChange={(v) => set('scheduleMode', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">{t('invoice.engine.scheduleModes.count')}</SelectItem>
                <SelectItem value="custom">{t('invoice.engine.scheduleModes.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {scheduleMode === 'count' && (
            <>
              <Field label={t('invoice.engine.fields.scheduleStartDate')}>
                <DatePickerField
                  value={state.scheduleStartDate}
                  pickLabel={t('invoice.pickDueDate')}
                  buttonClassName="h-9"
                  onChange={(v) => set('scheduleStartDate', v)}
                />
              </Field>
              <Field label={t('invoice.engine.fields.installmentInterval')}>
                <Select
                  value={state.installmentInterval ?? 'month'}
                  onValueChange={(v) => set('installmentInterval', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t('invoice.engine.intervalUnits.day')}</SelectItem>
                    <SelectItem value="week">{t('invoice.engine.intervalUnits.week')}</SelectItem>
                    <SelectItem value="month">{t('invoice.engine.intervalUnits.month')}</SelectItem>
                    <SelectItem value="year">{t('invoice.engine.intervalUnits.year')}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('invoice.engine.fields.installmentCount')}>
                <Input
                  className="h-9"
                  type="number"
                  value={state.installmentCount ?? '3'}
                  onChange={(e) => set('installmentCount', e.target.value)}
                />
              </Field>
              <Field label={t('invoice.engine.fields.paidAmount')}>
                <Input
                  className="h-9"
                  type="number"
                  value={state.paidAmount ?? '0'}
                  onChange={(e) => set('paidAmount', e.target.value)}
                />
              </Field>
              <Field label={t('invoice.engine.fields.interestOrFees')}>
                <Input
                  className="h-9"
                  type="number"
                  value={state.interestOrFees ?? '0'}
                  onChange={(e) => set('interestOrFees', e.target.value)}
                />
              </Field>
            </>
          )}
          {scheduleMode === 'custom' && (
            <Field label={t('api.form.installmentsJson')} className="sm:col-span-2">
              <Textarea
                className="min-h-25 font-mono text-xs"
                dir="ltr"
                placeholder='[{"amount":1000,"dueDate":"2026-06-01","status":"unpaid"}]'
                value={state.installments ?? ''}
                onChange={(e) => set('installments', e.target.value)}
              />
            </Field>
          )}
        </div>
      </section>
    )
  }

  return null
}
