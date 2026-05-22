'use client'

import React from 'react'
import Image from 'next/image'

interface FormHeaderProps {
  title: string
  subtitle?: string
  showImages?: boolean
}

export function FormHeader({ title, subtitle, showImages = true }: FormHeaderProps) {
  return (
    <div className="w-full border-b-2 border-neutral-800 pb-6 mb-6">
      {/* Header com Logos */}
      {showImages && (
        <div className="flex items-center justify-between mb-4">
          {/* Logo IFCE */}
          <div className="w-24 h-24 relative">
            <Image
              src="/assets/logoifce.png"
              alt="Logo IFCE"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Título Central */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-sm font-bold text-neutral-900 mb-1">PRÓ-REITORIA DE EXTENSÃO</h1>
            <p className="text-xs text-neutral-700 mb-2">
              COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
            </p>
            <p className="text-xs font-semibold text-neutral-800">IFCE campus Maracanaú</p>
            <p className="text-xs text-neutral-700">Setor de Acompanhamento de Estágio</p>
          </div>

          {/* Brasão */}
          <div className="w-24 h-24 relative">
            <Image
              src="/assets/brasao.png"
              alt="Brasão IFCE"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Título do Formulário */}
      <div className="text-center border-t-2 border-b-2 border-neutral-800 py-4">
        <h2 className="text-base font-bold text-neutral-900 mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-700">{subtitle}</p>}
      </div>
    </div>
  )
}
