'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Save, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormErrorSummary } from '@/components/forms/FormErrorSummary'
import type { ValidationResult } from '@/lib/internship-validation'

type ChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void

interface ShellProps {
  title: string
  subtitle: string
  icon: LucideIcon
  validation: ValidationResult
  isSaving: boolean
  onSave: () => void
  onGenerate: () => void
  children: ReactNode
}

/** Moldura padrão das telas de documento: voltar, salvar rascunho, gerar PDF e lista de erros. */
export function DocumentPageShell({
  title,
  subtitle,
  icon: Icon,
  validation,
  isSaving,
  onSave,
  onGenerate,
  children,
}: ShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/employee"
            className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>
          <div className="flex gap-3">
            <Button onClick={onSave} variant="secondary" size="sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button onClick={onGenerate} variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <Card variant="glass" className="border-t-4 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <FormErrorSummary errors={validation.errors} warnings={validation.warnings} />

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
      </div>
    </div>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
      </CardContent>
    </Card>
  )
}

interface FieldProps {
  name: string
  label: string
  values: Record<string, string>
  errors: Record<string, string>
  onChange: ChangeHandler
  type?: 'text' | 'date' | 'email'
  placeholder?: string
  wide?: boolean
  hint?: string
}

function FieldError({ name, errors }: { name: string; errors: Record<string, string> }) {
  return errors[name] ? (
    <p id={`${name}-error`} className="mt-1 text-xs text-error">
      {errors[name]}
    </p>
  ) : null
}

export function TextField({
  name,
  label,
  values,
  errors,
  onChange,
  type = 'text',
  placeholder,
  wide,
  hint,
}: FieldProps) {
  const id = `field-${name}`
  return (
    <div className={wide ? 'md:col-span-2' : undefined}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name] ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="input w-full"
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      <FieldError name={name} errors={errors} />
    </div>
  )
}

export function TextAreaField({
  name,
  label,
  values,
  errors,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: Omit<FieldProps, 'type' | 'wide'> & { rows?: number }) {
  const id = `field-${name}`
  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={values[name] ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="input w-full"
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      <FieldError name={name} errors={errors} />
    </div>
  )
}

export function RadioField({
  name,
  label,
  options,
  values,
  errors,
  onChange,
}: Omit<FieldProps, 'type' | 'placeholder' | 'wide' | 'hint'> & {
  options: readonly { readonly value: string; readonly label: string }[]
}) {
  return (
    <fieldset className="md:col-span-2">
      <legend className="block text-sm font-medium text-neutral-300 mb-2">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-neutral-200">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={values[name] === option.value}
              onChange={onChange}
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError name={name} errors={errors} />
    </fieldset>
  )
}
