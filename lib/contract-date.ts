/**
 * Valida datas de contrato antes de persisti-las.
 * Um input type=date aceita anos como "0027"; por isso exigimos século explícito.
 */
export const MIN_CONTRACT_YEAR = 2000
export const MAX_CONTRACT_YEAR = 2100

export function toDateOnly(value: string | Date | null | undefined): string {
  if (!value) return ''
  const formatted = value instanceof Date ? value.toISOString() : value
  return formatted.slice(0, 10)
}

export function isValidContractDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const year = Number(value.slice(0, 4))
  if (year < MIN_CONTRACT_YEAR || year > MAX_CONTRACT_YEAR) return false
  const date = new Date(value + 'T00:00:00.000Z')
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
