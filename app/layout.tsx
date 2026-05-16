import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { notoSansArabic, resolvedBodyFontFamily } from '@/lib/fonts/body-font-family'
import { fontVars } from '@/lib/fonts/registry'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Fatoora - Invoice Management for Mauritania',
  description: 'Create and manage professional invoices with support for local payment methods like Bankily, Seddad, Masrvi, and BimBank.',
  keywords: ['invoice', 'Mauritania', "Fatoora", "Bankily", "Seddad", "billing", "فاتورة", "موريتانيا"],
  authors: [{ name: 'Iyehah Hacen' }],
  icons: {
    icon: [
      {
        url: '/logo-light.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-dark.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning >
      <body
        className={`${fontVars} ${notoSansArabic.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: resolvedBodyFontFamily('geist') }}
      >
        <Providers>
          {children}
        </Providers>
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
      </body>
    </html>
  )
}
