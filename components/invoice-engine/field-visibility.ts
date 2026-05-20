import type { FieldSchema, VisibleWhen } from '@/lib/invoice-engine/types'

export function isFieldVisible(
  visibleWhen: VisibleWhen | undefined,
  values: Record<string, unknown>,
  rowValues?: Record<string, unknown>,
): boolean {
  if (!visibleWhen) return true
  const current = rowValues ? rowValues[visibleWhen.field] : values[visibleWhen.field]
  if (visibleWhen.equals !== undefined) return current === visibleWhen.equals
  if (visibleWhen.notEquals !== undefined) return current !== visibleWhen.notEquals
  return true
}

export function filterVisibleFields(
  fields: FieldSchema[],
  values: Record<string, unknown>,
): FieldSchema[] {
  return fields.filter((f) => isFieldVisible(f.visibleWhen, values))
}
