'use client'

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { CreditCard, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useAppFontPreference } from '@/components/font-provider'
import { useLanguage } from '@/hooks/use-language'
import { resolvedBodyFontFamily } from '@/lib/fonts/body-font-family'
import { formatCurrency, formatDate } from '@/lib/invoice-utils'
import {
  computeAutoFitScale,
  computeInvoicePreviewMetrics,
  getInvoiceFormat,
  type InvoiceTemplateSize,
} from '@/lib/invoice-preview-scale'
import { cn } from '@/lib/utils'
import paymentMethodsConfig from '@/config/payment-methods.json'
import type { Invoice } from '@/types/invoice'
import Logo from '../logo'
import '@/styles/invoice-preview.css'

interface InvoicePreviewProps {
  invoice: Partial<Invoice>
  className?: string
  templateSize?: InvoiceTemplateSize
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice, className, templateSize = 'medium' }, ref) {
    const { language, direction, t } = useLanguage()
    const { fontKey } = useAppFontPreference()
    const sheetRef = useRef<HTMLDivElement>(null)
    const [autoFitScale, setAutoFitScale] = useState(1)

    const format = getInvoiceFormat(templateSize)
    const fontFamily = resolvedBodyFontFamily(fontKey)

    const paymentMethod = paymentMethodsConfig.methods.find(
      (m) => m.id === invoice.paymentMethod,
    )

    const getPaymentMethodName = () => {
      if (!paymentMethod) return invoice.paymentMethod
      if (language === 'ar') return paymentMethod.nameAr
      if (language === 'fr') return paymentMethod.nameFr
      return paymentMethod.name
    }

    const metrics = useMemo(
      () => computeInvoicePreviewMetrics(invoice, templateSize, autoFitScale),
      [invoice, templateSize, autoFitScale],
    )

    const rootStyle = useMemo(
      (): CSSProperties => ({
        ...metrics.style,
        fontFamily,
        ['--inv-font-family' as string]: fontFamily,
      }),
      [metrics.style, fontFamily],
    )

    const hasTax = Boolean(invoice.taxAmount && invoice.taxAmount > 0)
    const hasDiscount = Boolean(invoice.discount && invoice.discount > 0)
    const hasPayment = Boolean(invoice.paymentMethod)
    const hasNotes = Boolean(invoice.notes)
    const hasSideContent = hasPayment || hasNotes
    const itemCount = invoice.items?.length ?? 0

    useEffect(() => {
      setAutoFitScale(1)
    }, [templateSize])

    useLayoutEffect(() => {
      const sheet = sheetRef.current
      if (!sheet) return

      const measure = () => {
        const contentHeight = sheet.scrollHeight
        const next = computeAutoFitScale(contentHeight, format.maxPageHeightPx)
        setAutoFitScale((prev) => (Math.abs(prev - next) < 0.005 ? prev : next))
      }

      measure()
      const observer = new ResizeObserver(measure)
      observer.observe(sheet)
      return () => observer.disconnect()
    }, [
      invoice,
      templateSize,
      format.maxPageHeightPx,
      itemCount,
      hasTax,
      hasDiscount,
      hasPayment,
      hasNotes,
      language,
      fontKey,
    ])

    return (
      <div
        ref={ref}
        dir={direction}
        className={cn(
          'invoice-doc',
          metrics.className,
          language === 'ar' && 'invoice-doc--ar',
          className,
        )}
        style={rootStyle}
      >
        <div ref={sheetRef} className="invoice-doc__sheet">
          <header className="invoice-header">
            <div className="invoice-header__brand">
              {invoice.businessLogo ? (
                // eslint-disable-next-line @next/next/no-img-element -- html2canvas-friendly capture
                <img
                  src={invoice.businessLogo}
                  alt={invoice.businessName || ''}
                  width={80}
                  height={80}
                  className="invoice-header__logo"
                  draggable={false}
                />
              ) : (
                <div className="invoice-header__logo-fallback" aria-hidden>
                  {invoice.businessName?.charAt(0) || 'B'}
                </div>
              )}
              <div className="invoice-header__company">
                <h1 className="invoice-header__company-name">{invoice.businessName}</h1>
                {invoice.businessTaxId && (
                  <p className="invoice-header__meta-line" dir="ltr">
                    <strong>{t('profile.taxId')}:</strong> {invoice.businessTaxId}
                  </p>
                )}
                {invoice.businessPhone && (
                  <p className="invoice-header__meta-line text-center" dir="ltr">
                    {invoice.businessPhone}
                  </p>
                )}
                {invoice.businessAddress && (
                  <p className="invoice-header__meta-line text-center">{invoice.businessAddress}</p>
                )}
              </div>
            </div>

            <div className="invoice-header__title-block">
              <h2 className="invoice-header__title text-center">{t('invoice.title')}</h2>
              <p className="invoice-header__detail text-center">
                <span className="invoice-header__detail-label">
                  {t('invoice.invoiceNumber')}:
                </span>{' '}
                <span className="invoice-header__detail-value">
                  {invoice.invoiceNumber}
                </span>
              </p>
              <p className="invoice-header__detail text-center">
                <span className="invoice-header__detail-label">{t('invoice.date')}:</span>{' '}
                <span className="invoice-header__detail-value">
                  {invoice.createdAt && formatDate(invoice.createdAt)}
                </span>
              </p>
              {invoice.dueDate && (
                <p className="invoice-header__detail text-center">
                  <span className="invoice-header__detail-label">{t('invoice.dueDate')}:</span>{' '}
                  <span className="invoice-header__detail-value">
                    {formatDate(invoice.dueDate)}
                  </span>
                </p>
              )}
            </div>
          </header>

          <hr className="invoice-separator" />

          <section className="invoice-card invoice-customer">
            <div className="invoice-customer__avatar" aria-hidden>
              <UserRound />
            </div>
            <div>
              <p className="invoice-card__label">{t('invoice.billTo')}</p>
              <p className="invoice-customer__name">{invoice.clientName}</p>
              {invoice.clientPhone && (
                <p className="invoice-customer__line" dir="ltr">
                  {invoice.clientPhone}
                </p>
              )}
              {invoice.clientAddress && (
                <p className="invoice-customer__line">{invoice.clientAddress}</p>
              )}
            </div>
          </section>

          <div className="invoice-doc__main">
            <div className="invoice-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>{t('invoice.description')}</th>
                    <th className="invoice-table__col-qty">{t('invoice.quantity')}</th>
                    <th className="invoice-table__col-money">{t('invoice.unitPrice')}</th>
                    <th className="invoice-table__col-total">{t('invoice.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="invoice-table__desc">{item.description}</td>
                      <td className="invoice-table__qty" dir="ltr">
                        {item.quantity}
                      </td>
                      <td className="invoice-table__money" dir="ltr">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="invoice-table__total" dir="ltr">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={cn(
                'invoice-bottom',
                !hasSideContent && 'invoice-bottom--totals-only',
              )}
            >
              {hasSideContent && (
                <div className="invoice-bottom__side">
                  {hasPayment && (
                    <section className="invoice-card invoice-payment">
                      <p className="invoice-card__label">{t('invoice.paymentMethod')}</p>
                      <div className="invoice-payment">
                        {paymentMethod?.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={paymentMethod.logo}
                            alt=""
                            width={32}
                            height={32}
                            className="invoice-payment__logo"
                            draggable={false}
                          />
                        ) : (
                          <div className="invoice-payment__icon" aria-hidden>
                            <CreditCard />
                          </div>
                        )}
                        <div>
                          <p className="invoice-payment__name">{getPaymentMethodName()}</p>
                          {invoice.paymentDetails && (
                            <p className="invoice-payment__details" dir="ltr">
                              {invoice.paymentDetails}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  {hasNotes && (
                    <section className="invoice-card">
                      <p className="invoice-card__label">{t('invoice.notes')}</p>
                      <p className="invoice-notes">{invoice.notes}</p>
                    </section>
                  )}
                </div>
              )}

              <aside className="invoice-totals">
                <div className="invoice-totals__row">
                  <span>{t('invoice.subtotal')}</span>
                  <span dir="ltr">
                    {formatCurrency(invoice.subtotal || 0, invoice.currency)}
                  </span>
                </div>
                {hasTax && (
                  <div className="invoice-totals__row">
                    <span>
                      {t('invoice.tax')} ({invoice.taxRate}%)
                    </span>
                    <span dir="ltr">
                      {formatCurrency(invoice.taxAmount!, invoice.currency)}
                    </span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="invoice-totals__row invoice-totals__row--discount">
                    <span>{t('invoice.discount')}</span>
                    <span dir="ltr">
                      -{formatCurrency(invoice.discount!, invoice.currency)}
                    </span>
                  </div>
                )}
                <hr className="invoice-totals__divider" />
                <div className="invoice-totals__grand">
                  <span className="invoice-totals__grand-label">{t('invoice.total')}</span>
                  <span className="invoice-totals__grand-value" dir="ltr">
                    {formatCurrency(invoice.total || 0, invoice.currency)}
                  </span>
                </div>
              </aside>
            </div>
          </div>

          <footer className="invoice-footer">
            <p className="invoice-footer__thanks">{t('invoice.thankYou')}</p>
            <div className="invoice-footer__brand">
              <Link href="https://fatoore.vercel.app" draggable={false}>
                <Logo size="small" />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    )
  },
)
