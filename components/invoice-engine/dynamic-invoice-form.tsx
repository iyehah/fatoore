'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useFieldArray, useForm, useWatch, Controller, type FieldValues } from 'react-hook-form'
import { format, isValid, parseISO } from 'date-fns'
import { Plus, Trash2, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { PaymentMethodSelect } from '@/components/payment/payment-method-select'
import { useLanguage } from '@/hooks/use-language'
import { getPlugin } from '@/lib/invoice-engine/registry'
import { getZodResolver } from '@/lib/invoice-engine/validation'
import type { FieldSchema } from '@/lib/invoice-engine/types'
import type { InvoiceType } from '@/types/invoice'
import { filterVisibleFields } from './field-visibility'
import { CustomerSectionFields } from './customer-section-fields'
import { cn } from '@/lib/utils'

interface DynamicInvoiceFormProps {
  invoiceType: InvoiceType
  onValuesChange: (values: Record<string, unknown>) => void
  onSubmit: () => void
  loading?: boolean
  submitLabel?: string
}

export function DynamicInvoiceForm({
  invoiceType,
  onValuesChange,
  onSubmit,
  loading,
  submitLabel,
}: DynamicInvoiceFormProps) {
  const { t, language } = useLanguage()
  const plugin = getPlugin(invoiceType)

  const form = useForm<FieldValues>({
    defaultValues: plugin.defaultValues,
    resolver: getZodResolver(invoiceType),
    mode: 'onChange',
  })

  const { control, register, watch, handleSubmit, formState } = form
  const watched = useWatch({ control })
  const onValuesChangeRef = useRef(onValuesChange)
  onValuesChangeRef.current = onValuesChange

  useEffect(() => {
    const subscription = watch((data) => {
      onValuesChangeRef.current(data as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <form
      onSubmit={handleSubmit(() => onSubmit())}
      className="space-y-6"
      noValidate
    >
      {plugin.sections.map((section) => {
        const fields = filterVisibleFields(
          section.fields,
          (watched ?? {}) as Record<string, unknown>,
        )
        if (!fields.length) return null

        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{t(section.titleKey)}</CardTitle>
              {section.descriptionKey && (
                <CardDescription>{t(section.descriptionKey)}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {section.id === 'customer' ? (
                <CustomerSectionFields
                  fields={fields}
                  renderField={(field) => (
                    <FieldRenderer
                      field={field}
                      control={control}
                      register={register}
                      watch={watch}
                      values={watched as Record<string, unknown>}
                      t={t}
                      language={language}
                    />
                  )}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      control={control}
                      register={register}
                      watch={watch}
                      values={watched as Record<string, unknown>}
                      t={t}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex flex-wrap gap-3 justify-end">
        <Button type="submit" disabled={loading || !formState.isValid}>
          {submitLabel ?? t('invoice.createInvoice')}
        </Button>
      </div>
    </form>
  )
}

function FieldRenderer({
  field,
  control,
  register,
  watch,
  values,
  t,
  language,
}: {
  field: FieldSchema
  control: ReturnType<typeof useForm>['control']
  register: ReturnType<typeof useForm>['register']
  watch: ReturnType<typeof useForm>['watch']
  values: Record<string, unknown>
  t: (key: string, params?: Record<string, string | number>) => string
  language: string
}) {
  const colClass = field.colSpan === 2 ? 'sm:col-span-2' : ''

  if (field.type === 'array' && field.itemFields) {
    return (
      <div className={cn('sm:col-span-2 space-y-3', colClass)}>
        <ArrayField field={field} control={control} register={register} t={t} language={language} />
      </div>
    )
  }

  if (field.id === 'paymentMethod') {
    return (
      <div className={cn('sm:col-span-2', colClass)}>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field: f }) => (
            <PaymentMethodSelect value={f.value as string} onChange={f.onChange} />
          )}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', colClass)}>
      {field.type !== 'switch' && (
        <Label htmlFor={field.id}>
          {t(field.labelKey)}
          {field.required ? ' *' : ''}
        </Label>
      )}
      <ScalarField
        field={field}
        control={control}
        register={register}
        t={t}
        language={language}
        values={values}
      />
    </div>
  )
}

function ScalarField({
  field,
  control,
  register,
  t,
  language,
  values,
}: {
  field: FieldSchema
  control: ReturnType<typeof useForm>['control']
  register: ReturnType<typeof useForm>['register']
  t: (key: string) => string
  language: string
  values: Record<string, unknown>
}) {
  const id = field.id
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          id={id}
          placeholder={placeholder}
          className={id === 'clientAddress' ? 'min-h-[80px] resize-y' : undefined}
          {...register(id)}
        />
      )
    case 'number':
    case 'currency':
    case 'percent':
      return (
        <Input
          id={id}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? (field.type === 'currency' ? 0.01 : 1)}
          placeholder={placeholder}
          dir="ltr"
          {...register(id, { valueAsNumber: true })}
        />
      )
    case 'date':
      return <DateField id={id} control={control} language={language} pickLabel={t('invoice.pickDueDate')} />
    case 'time':
      return <Input id={id} type="time" dir="ltr" {...register(id)} />
    case 'select':
      if (field.id === 'clientGender' && field.options?.length) {
        return (
          <Controller
            name={id}
            control={control}
            render={({ field: f }) => (
              <div className="flex gap-1.5">
                {field.options!.map((opt) => {
                  const selected = f.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => f.onChange(opt.value)}
                      className={cn(
                        'flex-1 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/80 bg-muted/40 hover:border-primary/40',
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  )
                })}
              </div>
            )}
          />
        )
      }
      return (
        <Controller
          name={id}
          control={control}
          render={({ field: f }) => (
            <Select
              value={
                f.value != null && String(f.value) !== '' ? String(f.value) : undefined
              }
              onValueChange={f.onChange}
            >
              <SelectTrigger id={id} className="h-9">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )
    case 'switch':
      return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3">
          <Label htmlFor={id} className="cursor-pointer">
            {t(field.labelKey)}
          </Label>
          <Controller
            name={id}
            control={control}
            render={({ field: f }) => (
              <Switch id={id} checked={Boolean(f.value)} onCheckedChange={f.onChange} />
            )}
          />
        </div>
      )
    default:
      return <Input id={id} placeholder={placeholder} className="h-9" {...register(id)} />
  }
}

function DateField({
  id,
  control,
  language,
  pickLabel,
}: {
  id: string
  control: ReturnType<typeof useForm>['control']
  language: string
  pickLabel: string
}) {
  const locale =
    language === 'ar'
      ? 'ar-SA'
      : language === 'fr'
        ? 'fr-FR'
        : language === 'es'
          ? 'es-ES'
          : language === 'pt'
            ? 'pt-PT'
            : language === 'de'
              ? 'de-DE'
              : 'en-US'

  return (
    <Controller
      name={id}
      control={control}
      render={({ field }) => {
        const raw = field.value as string
        const d = raw ? parseISO(raw) : undefined
        const label =
          d && isValid(d)
            ? d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
            : pickLabel

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="me-2 h-4 w-4 opacity-60" />
                {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={d && isValid(d) ? d : undefined}
                onSelect={(day) => field.onChange(day ? format(day, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        )
      }}
    />
  )
}

function ArrayField({
  field,
  control,
  register,
  t,
  language,
}: {
  field: FieldSchema
  control: ReturnType<typeof useForm>['control']
  register: ReturnType<typeof useForm>['register']
  t: (key: string) => string
  language: string
}) {
  const { fields, append, remove } = useFieldArray({ control, name: field.id })
  const itemFields = field.itemFields ?? []
  const itemLabel = field.itemLabelKey ? t(field.itemLabelKey) : t('invoice.item')
  const isInstallment = field.id === 'installments'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t(field.labelKey)}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const empty: Record<string, unknown> = {}
            for (const f of itemFields) {
              if (f.type === 'select' && f.options?.[0]) {
                empty[f.id] = f.defaultValue ?? f.options[0].value
              } else if (f.type === 'date') {
                empty[f.id] = new Date().toISOString().slice(0, 10)
              } else {
                empty[f.id] = f.defaultValue ?? (f.type === 'number' || f.type === 'currency' ? 0 : '')
              }
            }
            append(empty)
          }}
        >
          <Plus className="h-4 w-4 me-1" />
          {t('invoice.addItem')}
        </Button>
      </div>
      {fields.map((row, index) => (
        <div
          key={row.id}
          className={cn(
            'grid gap-3 rounded-xl border border-dashed border-border/80 p-3',
            isInstallment ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-12',
          )}
        >
          <p
            className={cn(
              'text-xs font-medium text-muted-foreground',
              isInstallment ? 'col-span-full' : 'sm:col-span-12',
            )}
          >
            {itemLabel} {index + 1}
          </p>
          {itemFields.map((sub) => {
            const name = `${field.id}.${index}.${sub.id}`
            return (
              <ArraySubCell key={sub.id} sub={sub} isInstallment={isInstallment}>
                <Label className="text-xs">{t(sub.labelKey)}</Label>
                {sub.type === 'select' ? (
                  <Controller
                    name={name}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        value={
                          f.value != null && String(f.value) !== '' ? String(f.value) : undefined
                        }
                        onValueChange={f.onChange}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sub.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : sub.type === 'date' ? (
                  <DateField
                    id={name}
                    control={control}
                    language={language}
                    pickLabel={t('invoice.pickDueDate')}
                  />
                ) : sub.type === 'textarea' ? (
                  <Textarea className="min-h-[72px]" {...register(name)} />
                ) : sub.type === 'number' || sub.type === 'currency' ? (
                  <Input
                    type="number"
                    min={sub.min}
                    step={sub.type === 'currency' ? 0.01 : 1}
                    dir="ltr"
                    className="h-9"
                    {...register(name, { valueAsNumber: true })}
                  />
                ) : (
                  <Input className="h-9" {...register(name)} />
                )}
              </ArraySubCell>
            )
          })}
          <div
            className={cn('flex items-end justify-end', isInstallment ? 'col-span-full' : 'sm:col-span-1')}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length <= 1}
              onClick={() => remove(index)}
              aria-label={t('invoice.removeItem')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ArraySubCell({
  children,
  sub,
  isInstallment,
}: {
  children: ReactNode
  sub: FieldSchema
  isInstallment: boolean
}) {
  return (
    <div
      className={cn(
        !isInstallment && sub.id === 'description' && 'sm:col-span-5',
        !isInstallment && sub.type !== 'textarea' && sub.id !== 'description' && 'sm:col-span-2',
        !isInstallment && sub.type === 'textarea' && 'sm:col-span-12',
      )}
    >
      {children}
    </div>
  )
}
