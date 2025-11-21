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
 * Padrão visual baseado no modelo oficial (imagem de referência)
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
            className="bg-white shadow-lg mx-auto"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '10mm', // Reduzido para aproveitar mais espaço
                fontSize: '9pt', // Fonte base ligeiramente menor
                lineHeight: '1.2',
                fontFamily: 'Arial, Helvetica, sans-serif',
                boxSizing: 'border-box',
                color: '#000'
            }}
        >
            {/* Cabeçalho Oficial IFCE - Estilo Imagem */}
            <div className="mb-4 relative">
                {/* Marcas de corte simuladas (opcional, mas dá um toque oficial) */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-black opacity-50"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-black opacity-50"></div>

                <div className="flex items-start justify-between gap-2 px-4 pt-2">
                    {/* Logo IFCE */}
                    {showLogos && (
                        <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center">
                            {/* Placeholder para Logo IFCE - Idealmente seria uma imagem */}
                            <div className="w-16 h-16 border border-gray-300 flex items-center justify-center text-[8px] text-center font-bold bg-gray-50">
                                LOGO<br />IFCE
                            </div>
                        </div>
                    )}

                    {/* Título Central */}
                    <div className="flex-1 text-center pt-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide">
                            PRÓ-REITORIA DE EXTENSÃO
                        </div>
                        <div className="text-[10px] uppercase tracking-wide mb-1">
                            COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
                        </div>

                        <div className="text-[11px] font-bold text-red-700 uppercase mb-0">
                            IFCE <span className="text-black font-normal">Campus {campus}</span>
                        </div>
                        <div className="text-[10px] uppercase mb-4">
                            {sector}
                        </div>

                        <div className="text-[14px] font-bold uppercase tracking-wider">
                            {title}
                        </div>
                        {subtitle && (
                            <div className="text-[10px] font-bold uppercase mt-0.5">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    {/* Brasão */}
                    {showLogos && (
                        <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center">
                            {/* Placeholder para Brasão - Idealmente seria uma imagem */}
                            <div className="w-16 h-16 border border-gray-300 flex items-center justify-center text-[8px] text-center font-bold bg-gray-50">
                                BRASÃO<br />REPÚBLICA
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="w-full">
                {children}
            </div>

            {/* Rodapé com Observação Padrão */}
            <div className="mt-4 pt-2 border-t-0 border-black text-[9px]">
                <p>
                    <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                </p>
            </div>
        </div>
    )
}

/**
 * Tabela principal do formulário
 * Estilo: Bordas pretas finas, colapso de bordas
 */
export function FormTable({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <table className={`w-full border-collapse border border-black text-[9pt] mb-0 ${className}`}>
            {children}
        </table>
    )
}

/**
 * Célula de cabeçalho (Label apenas)
 * Usada para títulos de seção dentro da tabela
 */
export function FormHeaderCell({ children, colSpan, rowSpan, className = '' }: { children?: ReactNode, colSpan?: number, rowSpan?: number, className?: string }) {
    return (
        <td
            className={`border border-black px-1 py-0.5 font-bold bg-gray-200 text-[8px] uppercase ${className}`}
            colSpan={colSpan}
            rowSpan={rowSpan}
        >
            {children}
        </td>
    )
}

/**
 * Célula de dados simples
 */
export function FormDataCell({ children, colSpan, rowSpan, className = '' }: { children: ReactNode, colSpan?: number, rowSpan?: number, className?: string }) {
    return (
        <td className={`border border-black px-1 py-0.5 align-top ${className}`} colSpan={colSpan} rowSpan={rowSpan}>
            {children}
        </td>
    )
}

/**
 * NOVO: Célula de Campo (Label + Input)
 * Estilo denso conforme imagem de referência
 */
interface FormFieldProps {
    label: string
    children?: ReactNode
    colSpan?: number
    className?: string
}

export function FormField({ label, children, colSpan, className = '' }: FormFieldProps) {
    return (
        <td className={`border border-black px-1 py-0.5 align-top ${className}`} colSpan={colSpan}>
            <div className="text-[7px] font-bold uppercase text-gray-700 leading-tight mb-0.5">
                {label}
            </div>
            <div className="min-h-[18px] flex items-center">
                {children}
            </div>
        </td>
    )
}

/**
 * Input padronizado sem bordas (para usar dentro de FormField ou FormDataCell)
 */
export function FormInput({ fullWidth = true, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
    return (
        <input
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 p-0 m-0 outline-none bg-transparent text-[9pt] leading-tight placeholder-gray-300 focus:ring-0 ${className}`}
        />
    )
}

/**
 * Textarea padronizado
 */
export function FormTextarea({ fullWidth = true, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
    return (
        <textarea
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 p-0 m-0 outline-none bg-transparent text-[9pt] leading-tight resize-none focus:ring-0 ${className}`}
        />
    )
}

/**
 * Select padronizado
 */
export function FormSelect({ fullWidth = true, className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { fullWidth?: boolean }) {
    return (
        <select
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border-0 p-0 m-0 outline-none bg-transparent text-[9pt] appearance-none focus:ring-0 ${className}`}
        >
            {children}
        </select>
    )
}

/**
 * Seção de Assinatura
 */
export function SignatureSection({ label, date = false, className = '' }: { label: string, date?: boolean, className?: string }) {
    return (
        <div className={`mt-4 ${className}`}>
            {date && (
                <div className="flex justify-end mb-4 text-[9pt]">
                    <div>
                        DATA: _____ / _____ / ________
                    </div>
                </div>
            )}
            <div className="border-t border-black pt-1 mt-6">
                <div className="text-center font-bold text-[8px] uppercase">
                    {label}
                </div>
            </div>
        </div>
    )
}
