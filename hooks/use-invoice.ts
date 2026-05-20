'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { Invoice, InvoiceDraft } from '@/types/invoice'
import { useAuth } from './use-auth'
import { buildInvoiceFromDraft } from '@/lib/invoice-engine/normalize'
import {
  loadInvoices,
  getInvoiceById,
  addInvoice,
  deleteInvoiceFromStore,
  newInvoiceId,
} from '@/lib/local-invoices'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'

type BusinessForInvoice = BusinessProfileStored | null

function invoicesKey(uid: string | undefined) {
  return uid ? `user-invoices-local-${uid}` : null
}

export function useInvoice(invoiceId?: string) {
  const { user } = useAuth()
  const key = invoicesKey(user?.uid)

  const { data, error, isLoading, mutate } = useSWR(
    key && invoiceId ? ([key, invoiceId] as const) : null,
    ([, id]) => {
      if (!user?.uid || !id) return null
      return getInvoiceById(user.uid, id)
    },
  )

  return {
    invoice: data === undefined ? undefined : data,
    isLoading: !!invoiceId && !!user?.uid && isLoading,
    isError: error,
    mutate,
  }
}

export function useUserInvoices() {
  const { user } = useAuth()
  const key = invoicesKey(user?.uid)

  const { data, error, mutate } = useSWR(key, () => (user?.uid ? loadInvoices(user.uid) : []), {
    revalidateOnFocus: true,
  })

  return {
    invoices: data || [],
    isLoading: !error && !data && !!user?.uid,
    isError: error,
    mutate,
  }
}

export function useInvoiceActions() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invalidate = useCallback(() => {
    if (user?.uid) globalMutate(invoicesKey(user.uid))
  }, [user?.uid])

  const createInvoice = useCallback(
    async (draft: InvoiceDraft, business: BusinessForInvoice): Promise<string | null> => {
      if (!user) {
        setError('Not authenticated')
        return null
      }

      if (!business) {
        setError('No business profile selected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const id = newInvoiceId()
        const invoice: Invoice = buildInvoiceFromDraft(
          draft,
          {
            userId: user.uid,
            currency: 'MRU',
            business: {
              id: business.id,
              storeName: business.storeName || user.displayName || 'My Business',
              logo: business.logo,
              phone: business.phone,
              address: business.address,
              taxId: business.taxId,
            },
          },
          { id },
        )

        addInvoice(user.uid, invoice)
        invalidate()
        setLoading(false)
        return id
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invoice')
        setLoading(false)
        return null
      }
    },
    [user, invalidate],
  )

  const updateInvoice = useCallback(async (_invoiceId: string, _updates: Partial<Invoice>): Promise<boolean> => {
    setError(null)
    return true
  }, [])

  const deleteInvoice = useCallback(
    async (invoiceId: string): Promise<boolean> => {
      if (!user) {
        setError('Not authenticated')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        deleteInvoiceFromStore(user.uid, invoiceId)
        invalidate()
        setLoading(false)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice')
        setLoading(false)
        return false
      }
    },
    [user, invalidate],
  )

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    loading,
    error,
  }
}
