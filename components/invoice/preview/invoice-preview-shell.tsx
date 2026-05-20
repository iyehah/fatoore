'use client'

import { UserRound } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/hooks/use-language'
import { formatDate } from '@/lib/invoice-utils'
import type { Invoice } from '@/types/invoice'
import Logo from '@/components/logo'
import { InvoiceBadge } from './invoice-badge'
interface InvoicePreviewShellProps {
  invoice: Partial<Invoice>
  children: React.ReactNode
}

export function InvoicePreviewShell({ invoice, children }: InvoicePreviewShellProps) {
  const { t } = useLanguage()

  return (
    <>
      <header className="invoice-header">
        <div className="invoice-header__brand">
          {invoice.businessLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
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
            <span className="invoice-header__detail-label">{t('invoice.invoiceNumber')}:</span>{' '}
            <span className="invoice-header__detail-value">{invoice.invoiceNumber}</span>
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
              <span className="invoice-header__detail-value">{formatDate(invoice.dueDate)}</span>
            </p>
          )}
        </div>
      </header>

      <hr className="invoice-separator" />

      <section className="invoice-card invoice-customer">
        <div className="invoice-customer__avatar" aria-hidden>
          <UserRound />
        </div>
        <CustomerDetails invoice={invoice} t={t} />
      </section>

      {children}

      <footer className="invoice-footer">
        <p className="invoice-footer__thanks">{t('invoice.thankYou')}</p>
        <div className="invoice-footer__brand">
          <Link href="https://fatoore.vercel.app" draggable={false}>
            <Logo size="small" />
          </Link>
        </div>
      </footer>
    </>
  )
}

function CustomerDetails({
  invoice,
  t,
}: {
  invoice: Partial<Invoice>
  t: (key: string) => string
}) {
  const genderLabel =
    invoice.clientGender === 'M'
      ? t('invoice.engine.gender.M')
      : invoice.clientGender === 'F'
        ? t('invoice.engine.gender.F')
        : null

  return (
    <div>
      <p className="invoice-card__label">{t('invoice.billTo')}</p>
      <div className="invoice-customer__head">
        <p className="invoice-customer__name">{invoice.clientName}</p>
        {genderLabel ? <InvoiceBadge>{genderLabel}</InvoiceBadge> : null}
      </div>
      {invoice.clientPhone && (
        <p className="invoice-customer__line" dir="ltr">
          {invoice.clientPhone}
        </p>
      )}
      {invoice.clientAddress && <p className="invoice-customer__line">{invoice.clientAddress}</p>}
    </div>
  )
}
