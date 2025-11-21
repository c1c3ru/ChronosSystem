'use client'

import React, { ReactNode } from 'react'

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
 * Template reutilizável para formulários oficiais do IFCE
 * 
 * Garante:
 * - Formato A4 (210mm x 297mm)
 * - Cabeçalho oficial padronizado
 * - Tipografia profissional
 * - Layout consistente para impressão
 * 
 * @example
 * ```tsx
 * <OfficialFormTemplate
 *   formId="meu-formulario"
 *   title="DECLARAÇÃO DE PARTICIPAÇÃO"
 *   subtitle="EM ATIVIDADES DE EXTENSÃO"
 *   campus="Maracanaú"
 *   sector="Setor de Acompanhamento de Estágio"
 * >
 *   <div>Conteúdo do formulário aqui</div>
 * </OfficialFormTemplate>
 * ```
 */
export function OfficialFormTemplate({
    title,
    subtitle,
    children,
    formId,
    showLogos = true,
    campus = 'Maracanaú',
    sector = 'Setor de Acompanhamento de Estágio'
}: OfficialFormTemplateProps) {
    return (
        <div
            id={formId}
            className="bg-white shadow-lg"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                margin: '0 auto',
                fontSize: '10pt',
                lineHeight: '1.3',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box'
            }}
        >
            {/* Cabeçalho Oficial IFCE */}
            <div className="border-2 border-black p-3 mb-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Logo IFCE */}
                    {showLogos && (
                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 flex items-center justify-center text-xs text-center font-bold">
                            IFCE
                        </div>
                    )}

                    {/* Título Central */}
                    <div className="flex-1 text-center">
                        <div className="text-xs font-bold mb-1">
                            PRÓ-REITORIA DE EXTENSÃO
                        </div>
                        <div className="text-xs mb-1">
                            COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
                        </div>
                        <div className="text-xs font-bold mb-1">
                            IFCE Campus {campus}
                        </div>
                        <div className="text-xs mb-2">
                            {sector}
                        </div>
                        <div className="text-sm font-bold border-t border-black pt-2">
                            {title}
                        </div>
                        {subtitle && (
                            <div className="text-xs mt-1">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    {/* Brasão */}
                    {showLogos && (
                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 flex items-center justify-center text-xs text-center font-bold">
                            BRASIL
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="text-xs">
                {children}
            </div>
        </div>
    )
}

/**
 * Componente de tabela padronizada para formulários oficiais
 */
interface FormTableProps {
    children: ReactNode
    className?: string
}

export function FormTable({ children, className = '' }: FormTableProps) {
    return (
        <table className={`w-full border-collapse border border-black text-xs mb-3 ${className}`}>
            {children}
        </table>
    )
}

/**
 * Componente de célula de cabeçalho (label)
 */
interface FormHeaderCellProps {
    children: ReactNode
    colSpan?: number
    className?: string
}

export function FormHeaderCell({ children, colSpan, className = '' }: FormHeaderCellProps) {
    return (
        <td
            className={`border border-black p-1.5 font-bold bg-neutral-100 ${className}`}
            colSpan={colSpan}
        >
            {children}
        </td>
    )
}

/**
 * Componente de célula de dados (input)
 */
interface FormDataCellProps {
    children: ReactNode
    colSpan?: number
    className?: string
}

export function FormDataCell({ children, colSpan, className = '' }: FormDataCellProps) {
    return (
        <td className={`border border-black p-1.5 ${className}`} colSpan={colSpan}>
            {children}
        </td>
    )
}

/**
 * Componente de input padronizado
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean
}

export function FormInput({ fullWidth = true, className = '', ...props }: FormInputProps) {
    return (
        <input
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 outline-none bg-transparent text-xs ${className}`}
        />
    )
}

/**
 * Componente de textarea padronizado
 */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    fullWidth?: boolean
}

export function FormTextarea({ fullWidth = true, className = '', ...props }: FormTextareaProps) {
    return (
        <textarea
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 outline-none bg-transparent text-xs resize-none ${className}`}
        />
    )
}

/**
 * Componente de select padronizado
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    fullWidth?: boolean
}

export function FormSelect({ fullWidth = true, className = '', children, ...props }: FormSelectProps) {
    return (
        <select
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 outline-none bg-transparent text-xs ${className}`}
        >
            {children}
        </select>
    )
}

/**
 * Componente de seção de assinatura
 */
interface SignatureSectionProps {
    label: string
    date?: boolean
    className?: string
}

export function SignatureSection({ label, date = false, className = '' }: SignatureSectionProps) {
    return (
        <div className={`mt-6 ${className}`}>
            {date && (
                <div className="text-xs mb-4">
                    Fortaleza-CE, _____ de _________________ de 20_____
                </div>
            )}
            <div className="border-t-2 border-black pt-8">
                <div className="text-center font-bold text-xs">
                    {label}
                </div>
            </div>
        </div>
    )
}
