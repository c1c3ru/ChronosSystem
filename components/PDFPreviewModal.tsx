'use client'

import React from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { downloadPDFBlob } from '@/lib/pdf-generator'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pdfBlob: Blob | null
  filename: string
}

export function PDFPreviewModal({ isOpen, onClose, pdfBlob, filename }: PDFPreviewModalProps) {
  if (!isOpen || !pdfBlob) return null

  const pdfUrl = URL.createObjectURL(pdfBlob)

  const handleDownload = () => {
    downloadPDFBlob(pdfBlob, filename)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Visualizar PDF</h3>
            <p className="text-sm text-neutral-500">{filename}.pdf</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Iframe Preview */}
        <div className="flex-1 bg-neutral-100 p-4 overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-lg border border-neutral-300 shadow-inner bg-white"
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
