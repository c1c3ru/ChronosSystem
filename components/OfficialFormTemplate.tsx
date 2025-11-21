'use client'

import React, { ReactNode } from 'react'
import Image from 'next/image'

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
 * Padrão visual baseado no modelo oficial (estilo formulário impresso)
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
                padding: '15mm',
                fontSize: '11pt',
                lineHeight: '1.4',
                fontFamily: 'Arial, Helvetica, sans-serif',
                boxSizing: 'border-box',
                color: '#000'
            }}
        >
            {/* Cabeçalho Oficial IFCE */}
            <div className="mb-6 border-b-2 border-black pb-3">
                <div className="flex items-start justify-between gap-4">
                    {/* Logo IFCE */}
                    {showLogos && (
                        <div className="w-20 flex-shrink-0">
                            <Image
                                src="/assets/logoifce.png"
                                alt="Logo IFCE"
                                width={64}
                                height={64}
                                className="object-contain"
                            />
                        </div>
                    )}

                    {/* Título Central */}
                    <div className="flex-1 text-center">
                        <div className="text-[11px] font-bold uppercase">
                            PRÓ-REITORIA DE EXTENSÃO
                        </div>
                        <div className="text-[10px] uppercase">
                            COORDENAÇÃO DE ESTÁGIOS E ACOMPANHAMENTO DE EGRESSOS
                        </div>
                        <div className="text-[12px] font-bold mt-1">
                            IFCE campus {campus}
                        </div>
                        <div className="text-[10px]">
                            {sector}
                        </div>
                    </div>

                    {/* Brasão */}
                    {showLogos && (
                        <div className="w-20 flex-shrink-0">
                            <Image
                                src="/assets/brasao.png"
                                alt="Brasão da República"
                                width={64}
                                height={64}
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Título do Formulário */}
                <div className="mt-4 text-center">
                    <div className="text-[16px] font-bold uppercase border-y-2 border-black py-2">
                        {title}
                    </div>
                    {subtitle && (
                        <div className="text-[12px] font-bold uppercase mt-1">
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="w-full">
                {children}
            </div>

            {/* Rodapé com Observação Padrão */}
            <div className="mt-6 pt-3 border-t border-gray-400 text-[9pt] italic">
                <p>
                    <strong>Observação:</strong> As atividades de estágio supervisionado só podem ser <strong>iniciadas após o cadastro</strong> do Termo de Compromisso de Estágio no sistema competente.
                </p>
            </div>
        </div>
    )
}

/**
 * Tabela principal do formulário
 * Estilo: Bordas visíveis, sem colapso
 */
export function FormTable({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <table className={`w-full border border-gray-400 text-[10pt] mb-4 ${className}`} style={{ borderCollapse: 'collapse' }}>
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
            className={`border border-gray-400 px-2 py-1.5 font-bold bg-gray-100 text-[9pt] uppercase ${className}`}
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
        <td className={`border border-gray-400 px-2 py-1.5 align-top ${className}`} colSpan={colSpan} rowSpan={rowSpan}>
            {children}
        </td>
    )
}

/**
 * Célula de Campo (Label + Input) - Estilo Documento Oficial
 */
interface FormFieldProps {
    label: string
    children?: ReactNode
    colSpan?: number
    className?: string
}

export function FormField({ label, children, colSpan, className = '' }: FormFieldProps) {
    return (
        <td className={`border border-gray-400 px-2 py-1.5 align-top ${className}`} colSpan={colSpan}>
            <div className="text-[8pt] font-semibold text-gray-700 mb-1">
                {label}
            </div>
            <div className="min-h-[24px]">
                {children}
            </div>
        </td>
    )
}

/**
 * Input padronizado COM BORDAS (estilo formulário oficial)
 */
export function FormInput({ fullWidth = true, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
    return (
        <input
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border border-gray-300 rounded px-2 py-1 text-[10pt] focus:outline-none focus:border-gray-500 bg-white ${className}`}
        />
    )
}

/**
 * Textarea padronizado COM BORDAS
 */
export function FormTextarea({ fullWidth = true, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
    return (
        <textarea
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border border-gray-300 rounded px-2 py-1 text-[10pt] resize-none focus:outline-none focus:border-gray-500 bg-white ${className}`}
        />
    )
}

/**
 * Select padronizado COM BORDAS
 */
export function FormSelect({ fullWidth = true, className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { fullWidth?: boolean }) {
    return (
        <select
            {...props}
            className={`${fullWidth ? 'w-full' : ''} border border-gray-300 rounded px-2 py-1 text-[10pt] focus:outline-none focus:border-gray-500 bg-white ${className}`}
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
        <div className={`mt-6 ${className}`}>
            {date && (
                <div className="flex justify-end mb-4 text-[10pt]">
                    <div>
                        DATA: _____ / _____ / ________
                    </div>
                </div>
            )}
            <div className="border-t-2 border-black pt-2 mt-12">
                <div className="text-center font-bold text-[9pt] uppercase">
                    {label}
                </div>
            </div>
        </div>
    )
}
