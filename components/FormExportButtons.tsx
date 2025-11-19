'use client'

import { useState } from 'react'
import { Eye, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { generatePDFBlob } from '@/lib/pdf-generator'
import { saveDraft, removeDraftLocally } from '@/lib/form-drafts'
import { toast } from 'sonner'
import type { FormType } from '@/lib/form-drafts'
import { PDFPreviewModal } from '@/components/PDFPreviewModal'

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)

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

  const handlePreviewPDF = async () => {
    try {
      if (!formRef.current) {
        toast.error('Formulário não encontrado')
        return
      }

      setIsGenerating(true)
      toast.info('Gerando visualização...')

      const blob = await generatePDFBlob(formRef.current, {
        filename: formType
      })

      setPdfBlob(blob)
      setShowPreview(true)
      toast.dismiss()
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      toast.error('Erro ao gerar visualização do PDF')
    } finally {
      setIsGenerating(false)
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

  const getFilename = () => {
    const date = new Date().toISOString().split('T')[0]
    // Mapeia tipos de formulário para nomes amigáveis (conforme links do dashboard)
    const names: Record<string, string> = {
      'final-report': 'relatorio-final',
      'monthly-report': 'relatorio-mensal',
      'semester-report': 'relatorio-semestral',
      'internship-registration': 'solicitacao-cadastro',
      'commitment-term': 'termo-compromisso',
      'additive-term': 'termo-aditivo',
      'equivalence-request': 'solicitacao-equiparacao',
      'extension-declaration': 'declaracao-extensao',
      'professional-declaration': 'declaracao-profissional'
    }

    const friendlyName = names[formType] || formType
    return `${friendlyName}-${date}`
  }

  return (
    <>
      <div className="flex gap-4 pt-8 mt-8 flex-wrap">
        <Button
          variant="primary"
          size="md"
          onClick={handleSaveDraft}
          disabled={isSaving || isGenerating}
          loading={isSaving}
          className="flex-1 min-w-[200px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={handlePreviewPDF}
          disabled={isGenerating}
          loading={isGenerating}
          className="flex-1 min-w-[200px]"
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar PDF
        </Button>

        <Button
          variant="destructive"
          size="md"
          onClick={handleClearDraft}
          disabled={isSaving || isGenerating}
          className="flex-1 min-w-[200px]"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Rascunho
        </Button>
      </div>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        pdfBlob={pdfBlob}
        filename={getFilename()}
      />
    </>
  )
}
