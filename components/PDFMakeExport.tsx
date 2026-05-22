'use client'

import React, { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { generatePDFMakeClient } from '@/lib/pdfmake-engine'

interface PDFMakeExportProps {
  fileName: string
  isLoading?: boolean
  /**
   * Função que deve retornar o objeto de definição do PDFMake.
   * É chamada apenas quando o usuário clica no botão, evitando peso no carregamento inicial.
   */
  documentDefinitionGenerator: () => Promise<TDocumentDefinitions> | TDocumentDefinitions
  buttonText?: string
}

export function PDFMakeExport({
  fileName,
  isLoading = false,
  documentDefinitionGenerator,
  buttonText = 'Exportar PDF',
}: PDFMakeExportProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)

      // Gera as definições usando a função fornecida (ex: extrair os valores do React Hook Form)
      const docDefinition = await documentDefinitionGenerator()

      // Gera e baixa o PDF
      await generatePDFMakeClient(docDefinition, { filename: fileName })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.')
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
          <span>Gerando Documento...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  )
}
