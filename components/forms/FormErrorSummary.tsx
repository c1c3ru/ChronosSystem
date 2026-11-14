'use client'

import { AlertTriangle, Info } from 'lucide-react'

interface FormErrorSummaryProps {
  errors: Record<string, string>
  warnings?: string[]
}

/** Elemento do campo pelo `name` ou `id` (os erros usam o nome do campo como chave). */
export function findFieldElement(field: string): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return (
    document.querySelector<HTMLElement>(`[name="${CSS.escape(field)}"]`) ??
    document.getElementById(field)
  )
}

/** Leva o foco ao primeiro campo com erro que exista na página. */
export function focusFirstError(errors: Record<string, string>): void {
  for (const field of Object.keys(errors)) {
    const el = findFieldElement(field)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.focus()
      return
    }
  }
}

/**
 * Lista do que falta corrigir antes de gerar o PDF. Cada item com campo na página vira um
 * botão que leva até ele. Avisos aparecem abaixo e não bloqueiam.
 */
export function FormErrorSummary({ errors, warnings = [] }: FormErrorSummaryProps) {
  const entries = Object.entries(errors)
  if (entries.length === 0 && warnings.length === 0) return null

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-error/50 bg-error/10 p-4 text-sm text-foreground"
        >
          <p className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-error" aria-hidden="true" />
            Corrija {entries.length === 1
              ? 'o item abaixo'
              : `os ${entries.length} itens abaixo`}{' '}
            para gerar o PDF:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {entries.map(([field, message]) => (
              <li key={field}>
                <button
                  type="button"
                  className="text-left underline-offset-2 hover:underline"
                  onClick={() => {
                    const el = findFieldElement(field)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    el?.focus()
                  }}
                >
                  {message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
          {warnings.map((w) => (
            <p key={w} className="flex items-start gap-2">
              <Info className="mt-[2px] h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              {w}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
