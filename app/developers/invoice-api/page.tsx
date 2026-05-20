import { InvoiceApiPlayground } from '@/components/api-playground/invoice-api-playground'

export const metadata = {
  title: 'Invoice API Playground — Fatoore',
  description: 'Test and integrate the public invoice generation API',
}

export default function InvoiceApiPlaygroundPage() {
  return (
    <main className="min-h-screen  px-4 py-8 md:px-6">
      <InvoiceApiPlayground />
    </main>
  )
}
