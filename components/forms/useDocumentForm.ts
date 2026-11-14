'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { toast } from 'sonner'
import { getDraft, saveDraft, notifyDraftSaved } from '@/lib/form-drafts'
import type { FormType } from '@/lib/form-types'
import type { ValidationResult } from '@/lib/internship-validation'
import { maskCEP, maskCNPJ, maskCPF, maskPhone, maskRG } from '@/lib/input-masks'
import { focusFirstError } from '@/components/forms/FormErrorSummary'

type FormValues = Record<string, string>

interface UseDocumentFormOptions {
  formType: FormType
  validate: (data: FormValues) => ValidationResult
  buildDoc: (data: FormValues) => Promise<TDocumentDefinitions>
  fileName: string
}

/** Máscara pelo nome do campo, na mesma convenção das outras telas de documentos. */
function applyMask(name: string, value: string): string {
  if (name.includes('cpf')) return maskCPF(value)
  if (name.endsWith('_rg')) return maskRG(value)
  if (name.includes('cnpj')) return maskCNPJ(value)
  if (name.includes('zip') || name.includes('cep')) return maskCEP(value)
  if (name.includes('phone')) return maskPhone(value)
  return value
}

/**
 * Estado, rascunho, validação e geração de PDF de um formulário de documento com campos
 * controlados. Usado pelas telas novas para não repetir o mesmo bloco em cada página.
 */
export function useDocumentForm({
  formType,
  validate,
  buildDoc,
  fileName,
}: UseDocumentFormOptions) {
  const [values, setValues] = useState<FormValues>({})
  const [isSaving, setIsSaving] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ errors: {}, warnings: [] })

  useEffect(() => {
    let active = true
    getDraft(formType).then((draft) => {
      if (!active || !draft) return
      setValues(draft as FormValues)
      toast.success('Rascunho carregado!')
    })
    return () => {
      active = false
    }
  }, [formType])

  // Depois da primeira tentativa de gerar o PDF, a lista se atualiza enquanto a pessoa corrige
  useEffect(() => {
    setValidation((prev) =>
      Object.keys(prev.errors).length || prev.warnings.length ? validate(values) : prev
    )
  }, [values, validate])

  const setField = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: applyMask(name, value) }))
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setField(e.target.name, e.target.value),
    [setField]
  )

  const handleSaveDraft = async () => {
    setIsSaving(true)
    notifyDraftSaved(await saveDraft(formType, { ...values }))
    setIsSaving(false)
  }

  const handleGeneratePDF = async () => {
    const result = validate(values)
    setValidation(result)
    const errorCount = Object.keys(result.errors).length
    if (errorCount > 0) {
      toast.error(
        errorCount === 1
          ? 'Falta corrigir 1 item antes de gerar o PDF.'
          : `Faltam corrigir ${errorCount} itens antes de gerar o PDF.`
      )
      focusFirstError(result.errors)
      return
    }
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-generation' })
      const { generatePDF } = await import('@/lib/pdfmake-base-service')
      await generatePDF(await buildDoc({ ...values }), { filename: fileName })
      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

  return {
    values,
    validation,
    isSaving,
    setField,
    handleChange,
    handleSaveDraft,
    handleGeneratePDF,
  }
}
