import { z } from 'zod'

export const customerFieldDefaults: Record<string, unknown> = {
  clientGender: '',
}

export const customerFieldsZod = {
  clientGender: z.enum(['M', 'F', '']).optional(),
}

export function coerceCustomerFields(merged: Record<string, unknown>) {
  const gender = merged.clientGender === 'M' || merged.clientGender === 'F' ? merged.clientGender : undefined
  return {
    clientGender: gender,
  }
}
