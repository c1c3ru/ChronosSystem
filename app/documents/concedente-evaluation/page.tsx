'use client'

import { Building2 } from 'lucide-react'
import {
  DocumentPageShell,
  FormSection,
  RadioField,
  TextAreaField,
  TextField,
} from '@/components/forms/DocumentFields'
import { useDocumentForm } from '@/components/forms/useDocumentForm'
import { FACILITIES_OPTIONS, VISIT_PURPOSES, YES_NO } from '@/lib/concedente-evaluation'
import { validateConcedenteEvaluation } from '@/lib/internship-validation'

const buildDoc = async (data: Record<string, string>) => {
  const { buildConcedenteEvaluationDoc } =
    await import('@/lib/pdf-templates/concedente-evaluation.pdf')
  return buildConcedenteEvaluationDoc(data)
}

export default function ConcedenteEvaluationPage() {
  const form = useDocumentForm({
    formType: 'concedente-evaluation',
    validate: validateConcedenteEvaluation,
    buildDoc,
    fileName: 'avaliacao-orientador-concedente.pdf',
  })
  const field = { values: form.values, errors: form.validation.errors, onChange: form.handleChange }

  return (
    <DocumentPageShell
      title="Avaliação do Orientador à Concedente"
      subtitle="Registro da visita do docente orientador à instituição concedente de vaga de estágio (modelo oficial da PROEXT)"
      icon={Building2}
      validation={form.validation}
      isSaving={form.isSaving}
      onSave={form.handleSaveDraft}
      onGenerate={form.handleGeneratePDF}
    >
      <FormSection title="Dados da Concedente">
        <TextField name="campus" label="Campus" placeholder="Maracanaú" {...field} />
        <TextField name="internship_sector" label="Setor de realização do estágio" {...field} />
        <TextField name="company_name" label="Nome da concedente do estágio" wide {...field} />
        <TextField name="company_industry" label="Ramo de atividade" wide {...field} />
        <TextField name="company_cnpj" label="CNPJ" placeholder="00.000.000/0000-00" {...field} />
        <TextField name="company_address" label="Endereço" {...field} />
        <TextField name="company_address_number" label="Nº" {...field} />
        <TextField name="company_neighborhood" label="Bairro" {...field} />
        <TextField name="company_city" label="Cidade" {...field} />
        <TextField name="company_state" label="Estado" placeholder="CE" {...field} />
        <TextField name="company_zip" label="CEP" placeholder="00000-000" {...field} />
        <TextField name="company_phone" label="Telefone" {...field} />
        <TextField name="company_email" label="E-mail" type="email" wide {...field} />
      </FormSection>

      <FormSection title="Responsável e Supervisor">
        <TextField name="company_representative" label="Responsável pela empresa" wide {...field} />
        <TextField name="company_representative_role" label="Cargo/Qualificação" {...field} />
        <TextField name="company_representative_phone" label="Telefone do responsável" {...field} />
        <TextField
          name="company_supervisor"
          label="Supervisor do estágio na empresa"
          wide
          {...field}
        />
        <TextField name="company_supervisor_role" label="Cargo/Qualificação" {...field} />
        <TextField name="company_supervisor_phone" label="Telefone do supervisor" {...field} />
      </FormSection>

      <FormSection title="Avaliação">
        <RadioField
          name="visit_purpose"
          label="01. Qual a finalidade da visita?"
          options={VISIT_PURPOSES}
          {...field}
        />
        <RadioField
          name="area_compatible"
          label="02. A área de atuação da concedente apresenta compatibilidade com a proposta pedagógica do curso e formação profissional do estagiário?"
          options={YES_NO}
          {...field}
        />
        <TextAreaField
          name="area_compatible_reason"
          label="Por quê?"
          rows={3}
          hint="Obrigatório quando a resposta for NÃO."
          {...field}
        />
        <RadioField
          name="company_visited_institution"
          label="03. A parte concedente já visitou a instituição?"
          options={YES_NO}
          {...field}
        />
        <RadioField
          name="facilities_evaluation"
          label="04. Avaliação das instalações da parte concedente do estágio e sua adequação à formação cultural e profissional do estagiário"
          options={FACILITIES_OPTIONS}
          {...field}
        />
        <TextAreaField
          name="facilities_reason"
          label="Por quê?"
          rows={3}
          hint="Obrigatório quando as instalações forem insatisfatórias."
          {...field}
        />
      </FormSection>

      <FormSection title="Local, Data e Assinatura">
        <TextField name="city" label="Cidade" placeholder="Maracanaú" {...field} />
        <TextField name="evaluation_date" label="Data" type="date" {...field} />
        <TextField name="advisor_name" label="Professor orientador" wide {...field} />
      </FormSection>
    </DocumentPageShell>
  )
}
