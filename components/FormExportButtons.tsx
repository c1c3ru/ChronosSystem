'use client'

import { useState } from 'react'
import { Download, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
    <div className="flex gap-4 pt-8 mt-8 flex-wrap">
      <Button
        variant="primary"
        size="md"
        onClick={handleSaveDraft}
        disabled={isSaving}
        loading={isSaving}
        className="flex-1 min-w-[200px]"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
      </Button>

      <Button
        variant="secondary"
        size="md"
        onClick={handlePrintPDF}
        className="flex-1 min-w-[200px]"
      >
        <Download className="h-4 w-4 mr-2" />
        Gerar PDF
      </Button>

      <Button
        variant="destructive"
        size="md"
        onClick={handleClearDraft}
        className="flex-1 min-w-[200px]"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Limpar Rascunho
      </Button>
    </div>
  )
}
