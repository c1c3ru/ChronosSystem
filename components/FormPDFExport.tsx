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
  onExport
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

      // Criar uma cópia do elemento para impressão
      const printWindow = window.open('', '', 'height=600,width=800')
      if (!printWindow) {
        alert('Erro: Não foi possível abrir a janela de impressão')
        return
      }

      // Obter estilos CSS
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n')
          } catch (e) {
            return ''
          }
        })
        .join('\n')

      // Escrever conteúdo na janela de impressão
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${fileName}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: white;
                color: #000;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none !important;
                }
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
              }
              
              table, th, td {
                border: 1px solid #000;
              }
              
              th, td {
                padding: 8px;
                text-align: left;
              }
              
              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              
              .form-header {
                text-align: center;
                margin-bottom: 20px;
              }
              
              .form-title {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
              }
              
              .form-subtitle {
                font-size: 12px;
                margin: 5px 0;
              }
              
              img {
                max-width: 100%;
                height: auto;
              }
              
              ${styles}
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()

      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
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
