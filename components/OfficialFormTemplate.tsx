'use client'

import React, { ReactNode } from 'react'
import './official-forms.css'

interface OfficialFormTemplateProps {
  title: string
  subtitle?: string
  children: ReactNode
  formId: string
  showLogos?: boolean
  campus?: string
  sector?: string
}

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
    <div className="official-header mb-3">
      <div className="official-header-row">
        {showLogos && (
          <div className="official-header-logo left">
            <img
              src="/assets/logoifce.png"
              alt="Logo IFCE"
              width="58"
              height="58"
              className="object-contain"
            />
          </div>
        )}

        <div className="official-header-center">
          <div className="official-header-line strong">PRÓ-REITORIA DE EXTENSÃO</div>
          <div className="official-header-line">
            COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
          </div>
          <div className="official-header-line campus">IFCE Campus {campus}</div>
          <div className="official-header-line">{sector}</div>
          {title && <div className="official-header-title">{title}</div>}
          {subtitle && <div className="official-header-subtitle">{subtitle}</div>}
        </div>

        {showLogos && (
          <div className="official-header-logo right">
            <img
              src="/assets/brasao.png"
              alt="Brasão da República"
              width="58"
              height="58"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div id={formId} className="bg-white mx-auto official-form-container">
      <OfficialHeader
        title={title}
        subtitle={subtitle}
        showLogos={showLogos}
        campus={campus}
        sector={sector}
      />

      <div className="w-full">{children}</div>

      <div className="mt-2 pt-1 text-[7pt] leading-tight">
        <p>
          <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser
          iniciadas após o cadastro do Termo de Compromisso de Estágio no sistema competente.
        </p>
      </div>
    </div>
  )
}

export function FormTable({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <table className={`w-full official-form-table text-[8pt] mb-1 ${className}`}>{children}</table>
  )
}

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
      className={`official-form-header-cell px-1 py-0.5 font-bold text-[7pt] uppercase ${className}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}

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
      className={`official-form-cell px-1 py-0.5 align-top ${className}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}

interface FormFieldProps {
  label: string
  children?: ReactNode
  colSpan?: number
  className?: string
}

export function FormField({ label, children, colSpan, className = '' }: FormFieldProps) {
  return (
    <td className={`official-form-field px-1 py-0.5 align-top ${className}`} colSpan={colSpan}>
      <label className="block text-[6.5pt] leading-none text-black mb-0.5 uppercase">{label}</label>
      <div className="min-h-[18px] flex items-center">{children}</div>
    </td>
  )
}

export function FormInput({
  fullWidth = true,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
  return (
    <input
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-input px-0 py-0 text-[8pt] focus:outline-none bg-white h-4 ${className}`}
    />
  )
}

export function FormTextarea({
  fullWidth = true,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
  return (
    <textarea
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-textarea px-0 py-0 text-[8pt] resize-none focus:outline-none bg-white ${className}`}
    />
  )
}

export function FormSelect({
  fullWidth = true,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { fullWidth?: boolean }) {
  return (
    <select
      {...props}
      className={`${fullWidth ? 'w-full' : ''} official-form-select px-0 py-0 text-[8pt] focus:outline-none bg-white h-4 ${className}`}
    >
      {children}
    </select>
  )
}

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
        <div className="flex justify-end mb-3 text-[8pt]">
          <div>DATA: _____ / _____ / ________</div>
        </div>
      )}
      <div className="border-t border-black pt-1 mt-10">
        <div className="text-center font-bold text-[7pt] uppercase">{label}</div>
      </div>
    </div>
  )
}
