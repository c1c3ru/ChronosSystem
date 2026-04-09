'use client'

import React, { ReactNode } from 'react'
import './official-forms.css'

interface OfficialFormTemplateProps {
  /** Título principal do formulário */
  title: string
  /** Subtítulo opcional */
  subtitle?: string
  /** Conteúdo do formulário */
  children: ReactNode
  /** ID para geração de PDF */
  formId: string
  /** Mostrar logos no cabeçalho */
  showLogos?: boolean
  /** Campus do IFCE */
  campus?: string
  /** Setor responsável */
  sector?: string
}

/**
 * Cabeçalho Oficial do IFCE - Padrão Compacto Institucional
 * Layout mais denso e fiel ao modelo impresso do IFCE
 */
export function OfficialHeader({
  showLogos = true,
  campus = 'Maracanaú',
  sector = 'Setor de Acompanhamento de Estágio',
  title,
  subtitle,
}: {
  showLogos?: boolean
  campus?: string
  sector?: string
  title?: string
  subtitle?: string
}) {
  return (
    <div className="mb-4 border-b border-black pb-2">
      {/* Linha superior com logos e informações institucionais */}
      <div className="flex items-center justify-between gap-2">
        {/* Logo IFCE - menor e mais compacto */}
        {showLogos && (
          <div className="w-16 flex-shrink-0">
            <img
              src="/assets/logoifce.png"
              alt="Logo IFCE"
              width="56"
              height="56"
              className="object-contain"
            />
          </div>
        )}

        {/* Informações institucionais - mais compacto */}
        <div className="flex-1 text-center">
          <div className="text-[9px] font-bold uppercase leading-tight">MINISTÉRIO DA EDUCAÇÃO</div>
          <div className="text-[9px] font-bold uppercase leading-tight">
            SECRETARIA DE EDUCAÇÃO PROFISSIONAL E TECNOLÓGICA
          </div>
          <div className="text-[9px] font-bold uppercase leading-tight">
            INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA
          </div>
          <div className="text-[9px] uppercase leading-tight mt-0.5">PRÓ-REITORIA DE EXTENSÃO</div>
          <div className="text-[9px] uppercase leading-tight">
            COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
          </div>
          <div className="text-[10px] font-bold mt-1">IFCE – Campus {campus}</div>
          <div className="text-[9px]">{sector}</div>
        </div>

        {/* Brasão - menor e mais compacto */}
        {showLogos && (
          <div className="w-16 flex-shrink-0">
            <img
              src="/assets/brasao.png"
              alt="Brasão da República"
              width="56"
              height="56"
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Título do Formulário - Caixa com fundo */}
      {(title || subtitle) && (
        <div className="mt-3">
          {title && (
            <div className="text-[13px] font-bold uppercase text-center bg-gray-200 border border-black py-1.5">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-[10px] font-bold uppercase text-center bg-gray-100 border-x border-b border-black py-1">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Template reutilizável para formulários oficiais do IFCE
 * Padrão visual baseado no modelo oficial (estilo formulário impresso)
 * Layout compacto e denso com bordas finas
 */
export function OfficialFormTemplate({
  title,
  subtitle,
  children,
  formId,
  showLogos = true,
  campus = 'Maracanaú',
  sector = 'Setor de Acompanhamento de Estágio',
}: OfficialFormTemplateProps) {
  return (
    <div id={formId} className="bg-white shadow-lg mx-auto official-form-container">
      <OfficialHeader
        title={title}
        subtitle={subtitle}
        showLogos={showLogos}
        campus={campus}
        sector={sector}
      />

      {/* Conteúdo do Formulário */}
      <div className="w-full">{children}</div>

      {/* Rodapé com Observação Padrão */}
      <div className="mt-3 pt-2 border-t border-gray-400 text-[8pt] italic">
        <p>
          <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser{' '}
          <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema
          competente.
        </p>
      </div>
    </div>
  )
}

/**
 * Tabela principal do formulário
 * Estilo IFCE: Bordas finas (1px), sem espaçamento, layout denso
 */
export function FormTable({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <table className={`w-full official-form-table text-[9pt] mb-2 ${className}`}>{children}</table>
  )
}

/**
 * Célula de cabeçalho de seção
 * Estilo IFCE: Fundo cinza, borda fina, texto uppercase compacto
 */
export function FormHeaderCell({
  children,
  colSpan,
  rowSpan,
  className = '',
}: {
  children?: ReactNode
  colSpan?: number
  rowSpan?: number
  className?: string
}) {
  return (
    <td
      className={`official-form-header-cell px-1 py-1 font-bold bg-gray-200 text-[8pt] uppercase ${className}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}

/**
 * Célula de dados simples
 * Estilo IFCE: Borda fina, padding mínimo
 */
export function FormDataCell({
  children,
  colSpan,
  rowSpan,
  className = '',
}: {
  children: ReactNode
  colSpan?: number
  rowSpan?: number
  className?: string
}) {
  return (
    <td
      className={`official-form-cell px-1 py-1 align-top ${className}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}

/**
 * Célula de Campo (Label + Input) - Estilo Documento Oficial IFCE
 * Layout denso com label compacto e input integrado
 */
interface FormFieldProps {
  label: string
  children?: ReactNode
  colSpan?: number
  className?: string
}

export function FormField({ label, children, colSpan, className = '' }: FormFieldProps) {
  return (
    <td className={`official-form-field px-1 py-0.5 align-top ${className}`} colSpan={colSpan}>
      <label className="block text-[7pt] font-bold text-black mb-0.5 uppercase">{label}</label>
      <div className="min-h-[20px]">{children}</div>
    </td>
  )
}

/**
 * Input padronizado COM BORDAS (estilo formulário oficial IFCE)
 * Bordas finas, sem arredondamento, altura compacta
 */
export function FormInput({
  fullWidth = true,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
  return (
    <input
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-input px-1.5 py-0.5 text-[9pt] focus:outline-none focus:border-gray-600 bg-white h-6 ${className}`}
    />
  )
}

/**
 * Textarea padronizado COM BORDAS - Estilo IFCE
 */
export function FormTextarea({
  fullWidth = true,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
  return (
    <textarea
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-textarea px-1.5 py-0.5 text-[9pt] resize-none focus:outline-none focus:border-gray-600 bg-white ${className}`}
    />
  )
}

/**
 * Select padronizado COM BORDAS - Estilo IFCE
 */
export function FormSelect({
  fullWidth = true,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { fullWidth?: boolean }) {
  return (
    <select
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-select px-1.5 py-0.5 text-[9pt] focus:outline-none focus:border-gray-600 bg-white h-6 ${className}`}
    >
      {children}
    </select>
  )
}

/**
 * Seção de Assinatura - Padrão IFCE
 */
export function SignatureSection({
  label,
  date = false,
  className = '',
}: {
  label: string
  date?: boolean
  className?: string
}) {
  return (
    <div className={`mt-4 ${className}`}>
      {date && (
        <div className="flex justify-end mb-3 text-[9pt]">
          <div>DATA: _____ / _____ / ________</div>
        </div>
      )}
      <div className="border-t border-black pt-1 mt-10">
        <div className="text-center font-bold text-[8pt] uppercase">{label}</div>
      </div>
    </div>
  )
}
