'use client'

import React, { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FormPDFExportProps {
  formId: string
  fileName: string
  isLoading?: boolean
  onExport?: () => Promise<void>
}

export function FormPDFExport({
  formId,
  fileName,
  isLoading = false,
  onExport,
}: FormPDFExportProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)

      if (onExport) {
        await onExport()
        return
      }

      // Obter elemento do formulário
      const element = document.getElementById(formId)
      if (!element) {
        console.error('Elemento do formulário não encontrado')
        alert('Erro: Formulário não encontrado')
        return
      }

      // Gerar PDF usando o client-side unificado que agora preserva os dados
      const { printElementAsPDF } = await import('@/lib/pdf-generator')
      await printElementAsPDF(element, { filename: fileName })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading || isLoading}
      className="flex items-center space-x-2"
      variant="primary"
    >
      {loading || isLoading ? (
        <>
          <Printer className="h-4 w-4 animate-spin" />
          <span>Preparando...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Exportar PDF</span>
        </>
      )}
    </Button>
  )
}
