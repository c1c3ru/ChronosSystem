'use client'

import { useState } from 'react'
import { Download, Save, Trash2 } from 'lucide-react'
import { printElementAsPDF } from '@/lib/pdf-generator'
import { saveDraft, removeDraftLocally } from '@/lib/form-drafts'
import { toast } from 'sonner'
import type { FormType } from '@/lib/form-drafts'

interface FormExportButtonsProps {
  formType: FormType
  formRef: React.RefObject<HTMLDivElement>
  onSaveDraft?: (data: Record<string, any>) => void
}

export function FormExportButtons({
  formType,
  formRef,
  onSaveDraft,
}: FormExportButtonsProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)

      // Extrai dados do formulário
      const form = formRef.current?.querySelector('form') as HTMLFormElement
      if (!form) {
        toast.error('Formulário não encontrado')
        return
      }

      const formData = new FormData(form)
      const data: Record<string, any> = {}

      formData.forEach((value, key) => {
        if (data[key]) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]]
          }
          data[key].push(value)
        } else {
          data[key] = value
        }
      })

      // Salva o rascunho
      await saveDraft(formType, data)
      toast.success('Rascunho salvo com sucesso!')

      if (onSaveDraft) {
        onSaveDraft(data)
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      toast.error('Erro ao salvar rascunho')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrintPDF = () => {
    try {
      if (!formRef.current) {
        toast.error('Formulário não encontrado')
        return
      }

      const filename = `${formType}-${new Date().toISOString().split('T')[0]}`
      printElementAsPDF(formRef.current, { filename })
      toast.success('Abrindo impressora...')
    } catch (error) {
      console.error('Erro ao imprimir PDF:', error)
      toast.error('Erro ao gerar PDF')
    }
  }

  const handleClearDraft = () => {
    try {
      removeDraftLocally(formType)
      toast.success('Rascunho removido')
      window.location.reload()
    } catch (error) {
      console.error('Erro ao remover rascunho:', error)
      toast.error('Erro ao remover rascunho')
    }
  }

  return (
    <div className="flex gap-3 pt-6 mt-6 flex-wrap">
      <button
        onClick={handleSaveDraft}
        disabled={isSaving}
        className="flex items-center gap-2 flex-1 min-w-[200px] bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
      </button>

      <button
        onClick={handlePrintPDF}
        className="flex items-center gap-2 flex-1 min-w-[200px] bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
      >
        <Download className="h-4 w-4" />
        Gerar PDF
      </button>

      <button
        onClick={handleClearDraft}
        className="flex items-center gap-2 flex-1 min-w-[200px] bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Limpar Rascunho
      </button>
    </div>
  )
}
