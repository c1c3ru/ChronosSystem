'use client'

import { useCallback } from 'react'
import { BadgeCheck } from 'lucide-react'
import {
  DocumentPageShell,
  FormSection,
  RadioField,
  TextAreaField,
  TextField,
} from '@/components/forms/DocumentFields'
import { useDocumentForm } from '@/components/forms/useDocumentForm'
import { validateWorkDeclaration } from '@/lib/internship-validation'
import {
  MAX_ACTIVITIES,
  PROFESSIONAL_TYPES,
  WORK_DECLARATIONS,
  type WorkDeclarationKind,
} from '@/lib/work-declaration'

/**
 * Tela da "Declaração de Proprietário" e da "Declaração de Atividades de Profissional Liberal ou
 * Autônomo" (modelos oficiais da PROEXT), usadas para aproveitar horas como estágio obrigatório.
 */
export function WorkDeclarationForm({ kind }: { kind: WorkDeclarationKind }) {
  const config = WORK_DECLARATIONS[kind]
  const validate = useCallback(
    (data: Record<string, string>) => validateWorkDeclaration(kind, data),
    [kind]
  )
  const buildDoc = useCallback(
    async (data: Record<string, string>) => {
      const { buildWorkDeclarationDoc } = await import('@/lib/pdf-templates/work-declaration.pdf')
      return buildWorkDeclarationDoc(kind, data)
    },
    [kind]
  )
  const form = useDocumentForm({
    formType: config.formType,
    validate,
    buildDoc,
    fileName: config.fileName,
  })
  const field = { values: form.values, errors: form.validation.errors, onChange: form.handleChange }
  const isLiberal = form.values.professional_type === 'liberal'

  return (
    <DocumentPageShell
      title={config.title}
      subtitle="Para aproveitamento de horas como estágio supervisionado obrigatório (modelo oficial da PROEXT)"
      icon={BadgeCheck}
      validation={form.validation}
      isSaving={form.isSaving}
      onSave={form.handleSaveDraft}
      onGenerate={form.handleGeneratePDF}
    >
      <FormSection title="Declarante">
        <TextField name="declarant_name" label="Nome completo" wide {...field} />
        <TextField name="declarant_rg" label="RG" {...field} />
        <TextField name="declarant_cpf" label="CPF" placeholder="000.000.000-00" {...field} />
      </FormSection>

      {kind === 'owner' ? (
        <FormSection title="Empresa">
          <TextField name="company_name" label="Nome da empresa" wide {...field} />
          <TextField name="company_cnpj" label="CNPJ" placeholder="00.000.000/0000-00" {...field} />
          <TextField name="since_date" label="Proprietário desde" type="date" {...field} />
          <TextField name="company_industry" label="Ramo de atividades" wide {...field} />
        </FormSection>
      ) : (
        <FormSection title="Atividade Profissional">
          <RadioField
            name="professional_type"
            label="Você é"
            options={PROFESSIONAL_TYPES}
            {...field}
          />
          <TextField
            name="profession"
            label="Profissão"
            placeholder="Ex.: desenvolvedor de software"
            {...field}
          />
          <TextField name="since_date" label="Exerce a atividade desde" type="date" {...field} />
          {isLiberal && (
            <>
              <TextField
                name="council_name"
                label="Conselho profissional"
                placeholder="Ex.: CREA-CE"
                {...field}
              />
              <TextField name="council_number" label="Número de registro" {...field} />
            </>
          )}
        </FormSection>
      )}

      <FormSection title="Atividades Desempenhadas">
        <TextAreaField
          name="activities"
          label={`Atividades (uma por linha, até ${MAX_ACTIVITIES})`}
          rows={8}
          placeholder={'Desenvolvimento de sistemas web\nSuporte técnico a clientes'}
          hint="O PDF numera as atividades automaticamente."
          {...field}
        />
      </FormSection>

      <FormSection title="Cabeçalho, Local e Data">
        <TextField
          name="header_address"
          label="Endereço (cabeçalho)"
          wide
          hint="O modelo pede os dados da empresa ou do profissional no cabeçalho."
          {...field}
        />
        <TextField name="header_phone" label="Telefone (cabeçalho)" {...field} />
        <TextField name="header_email" label="E-mail (cabeçalho)" type="email" {...field} />
        <TextField name="city" label="Cidade" placeholder="Maracanaú" {...field} />
        <TextField name="declaration_date" label="Data da declaração" type="date" {...field} />
      </FormSection>
    </DocumentPageShell>
  )
}
