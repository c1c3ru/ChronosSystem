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

      // Sincronizar os valores dos inputs para os atributos DOM antes de pegar o outerHTML
      const inputs = element.querySelectorAll('input, textarea, select')
      inputs.forEach((input: any) => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          if (input.checked) input.setAttribute('checked', 'checked')
          else input.removeAttribute('checked')
        } else if (input.tagName === 'TEXTAREA') {
          input.innerHTML = input.value
        } else {
          input.setAttribute('value', input.value)
        }
      })

      // Construir um HTML robusto com o CSS injetado para o Puppeteer no servidor
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              /* Estilos essenciais do official-forms.css injetados */
              .official-form-container { width: 100%; max-width: 210mm; min-height: 297mm; padding: 15mm; font-size: 9pt; line-height: 1.3; font-family: Arial, "Times New Roman", sans-serif; box-sizing: border-box; color: #000; background: white; margin: 0 auto; }
              .official-form-table { border-collapse: collapse; border: 1px solid #000; width: 100%; margin-bottom: 4px; }
              .official-form-cell { border: 1px solid #000; padding: 2px 4px; }
              .official-form-header-cell { border: 1px solid #000; padding: 2px 4px; }
              .official-form-field { border: 1px solid #000; padding: 2px 4px; }
              .official-form-input { border: 0; border-bottom: 1px solid #000; border-radius: 0; width: 100%; background: transparent; }
              .official-form-textarea { border: 1px solid #000; border-radius: 0; width: 100%; background: transparent; }
              .official-form-select { border: 1px solid #000; border-radius: 0; width: 100%; background: transparent; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; background: white; color: black; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>\${element.outerHTML}</body>
        </html>
      `

      // Gerar PDF usando a engine unificada (que enviará para o servidor)
      const { generatePDF } = await import('@/lib/pdf-engine')
      await generatePDF(fullHtml, fileName, { preferServer: true })
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
