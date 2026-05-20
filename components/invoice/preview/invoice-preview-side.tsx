'use client'

import { CreditCard } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import paymentMethodsConfig from '@/config/payment-methods.json'
import type { Invoice } from '@/types/invoice'

interface InvoicePreviewSideProps {
  invoice: Partial<Invoice>
}

export function InvoicePreviewSide({ invoice }: InvoicePreviewSideProps) {
  const { language, t } = useLanguage()
  const hasPayment = Boolean(invoice.paymentMethod)
  const hasNotes = Boolean(invoice.notes)

  if (!hasPayment && !hasNotes) return null

  const paymentMethod = paymentMethodsConfig.methods.find((m) => m.id === invoice.paymentMethod)

  const getPaymentMethodName = () => {
    if (!paymentMethod) return invoice.paymentMethod
    if (language === 'ar') return paymentMethod.nameAr
    if (language === 'fr') return paymentMethod.nameFr
    return paymentMethod.name
  }

  return (
    <div className="invoice-bottom__side">
      {hasPayment && (
        <section className="invoice-card invoice-payment">
          <p className="invoice-card__label">{t('invoice.paymentMethod')}</p>
          <PaymentBlock
            logo={paymentMethod?.logo}
            name={getPaymentMethodName() ?? ''}
            details={invoice.paymentDetails}
          />
        </section>
      )}
      {hasNotes && (
        <section className="invoice-card">
          <p className="invoice-card__label">{t('invoice.notes')}</p>
          <p className="invoice-notes">{invoice.notes}</p>
        </section>
      )}
    </div>
  )
}

function PaymentBlock({
  logo,
  name,
  details,
}: {
  logo?: string
  name: string
  details?: string
}) {
  return (
    <div className="invoice-payment">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={32} height={32} className="invoice-payment__logo" draggable={false} />
      ) : (
        <div className="invoice-payment__icon" aria-hidden>
          <CreditCard />
        </div>
      )}
      <div>
        <p className="invoice-payment__name">{name}</p>
        {details && (
          <p className="invoice-payment__details" dir="ltr">
            {details}
          </p>
        )}
      </div>
    </div>
  )
}
