'use client'

import { useMemo } from 'react'
import QRCode from 'react-qr-code'
import { useInvoiceAccentColor } from '@/hooks/use-invoice-accent-color'
import { resolveAccentHex } from '@/lib/invoice-accent-color'
import { buildInvoiceQrPayload } from '@/lib/invoice-qr'
import type { Invoice } from '@/types/invoice'

interface InvoiceFooterQrProps {
  invoice: Partial<Invoice>
}

export function InvoiceFooterQr({ invoice }: InvoiceFooterQrProps) {
  const { preset, customHex, applyToBorders } = useInvoiceAccentColor()
  const value = useMemo(() => buildInvoiceQrPayload(invoice), [invoice])
  const fgColor = resolveAccentHex({ preset, customHex, applyToBorders })

  return (
    <div className="invoice-footer__qr" aria-hidden>
      <div className="invoice-footer__qr-frame">
        <QRCode
          value={value}
          size={256}
          level="M"
          fgColor={fgColor}
          bgColor="#ffffff"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  )
}
