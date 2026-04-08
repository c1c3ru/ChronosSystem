'use client'

/* eslint-disable jsx-a11y/label-has-associated-control */

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { StudentEvaluationDocument } from '@/components/templates/StudentEvaluationDocument'
import { maskCPF, maskRG, maskCTPS, maskCNPJ, maskCEP, maskPhone, maskCurrency } from '@/lib/input-masks'

export default function StudentEvaluationPage() {
    const formRef = useRef<HTMLFormElement>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        const loadDraft = async () => {
            const draft = await getDraft('student-evaluation')
            if (draft) {
                if (formRef.current) {
                    populateFormWithData(formRef.current, draft)
                }
                setFormData(draft)
                toast.success('Rascunho carregado!')
            }
        }
        loadDraft()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        let maskedValue = value

        // Aplicar máscaras baseado no nome do campo
        if (name.includes('cpf')) {
            maskedValue = maskCPF(value)
        } else if (name.includes('rg')) {
      maskedValue = maskRG(value)
    } else if (name.includes('ctps') || name.includes('carteira')) {
      maskedValue = maskCTPS(value)
    } else if (name.includes('cnpj')) {
            maskedValue = maskCNPJ(value)
        } else if (name.includes('zip') || name.includes('cep')) {
            maskedValue = maskCEP(value)
        } else if (name.includes('phone') || name.includes('telefone')) {
            maskedValue = maskPhone(value)
        } else if (name.includes('value') || name.includes('valor')) {
            maskedValue = maskCurrency(value)
        }

        // Atualizar o valor do input com a máscara
        if (maskedValue !== value && e.target instanceof HTMLInputElement) {
            e.target.value = maskedValue
        }

        // Tratamento especial para checkboxes e radio buttons
        const { type } = e.target
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData((prev: any) => ({ ...prev, [name]: checked ? value : '' }))
        } else if (type === 'radio') {
            // Radio buttons: sempre salvar o value quando selecionado
            setFormData((prev: any) => ({ ...prev, [name]: value }))
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: maskedValue }))
        }
    }

    const handleSaveDraft = async () => {
        if (!formRef.current) return

        setIsSaving(true)
        // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
        const data: any = { ...formData }

        await saveDraft('student-evaluation', data)
        toast.success('Rascunho salvo com sucesso!')
        setIsSaving(false)
    }

    const handleGeneratePDF = async () => {
        try {
            toast.loading('Gerando PDF...', { id: 'pdf-generation' })

            const raw: any = { ...formData }
            const { generateHTMLPDF, buildStudentEvaluationHTML } = await import('@/lib/pdf-generator-html')

            // Mapear campos para o gerador HTML seguindo as chaves do estado formData
            const htmlData = {
                nome_estudante: raw.student_name || '',
                curso_estudante: raw.student_course || '',
                matricula_estudante: raw.student_enrollment || '',
                empresa_nome: raw.company_name || '',
                nome_supervisor: raw.company_supervisor || '',
                data_inicio: raw.period_start || '',
                data_fim: raw.period_end || '',
                notas: {
                    assiduidade: raw.eval_assiduity || '',
                    pontualidade: raw.eval_punctuality || '',
                    responsabilidade: raw.eval_responsibility || '',
                    disciplina: raw.eval_discipline || '',
                    cooperacao: raw.eval_cooperation || '',
                    iniciativa: raw.eval_initiative || '',
                    proatividade: raw.eval_proactivity || '',
                    comunicacao: raw.eval_communication || '',
                    relacionamento: raw.eval_relationship || '',
                    conhecimento: raw.eval_technical_knowledge || '',
                    aprendizagem: raw.eval_learning_capacity || '',
                    produtividade: raw.eval_productivity || '',
                    qualidade: raw.eval_quality || '',
                    organizacao: raw.eval_organization || '',
                    criatividade: raw.eval_creativity || ''
                },
                observacoes: raw.observations || '',
                recomendacao: raw.recommendation === 'sim' ? 'SIM' : raw.recommendation === 'nao' ? 'NÃO' : ''
            }

            const html = buildStudentEvaluationHTML(htmlData)
            await generateHTMLPDF(html, 'avaliacao-estudante.pdf')

            toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
        } catch (error) {
            console.error('❌ Erro detalhado ao gerar PDF:', error)
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error(`Erro: ${errorMessage}`, { id: 'pdf-generation', duration: 10000 })
        }
    }

    const evaluationCriteria = [
        { key: 'eval_assiduity', label: 'Assiduidade' },
        { key: 'eval_punctuality', label: 'Pontualidade' },
        { key: 'eval_responsibility', label: 'Responsabilidade' },
        { key: 'eval_discipline', label: 'Disciplina' },
        { key: 'eval_cooperation', label: 'Cooperação' },
        { key: 'eval_initiative', label: 'Iniciativa' },
        { key: 'eval_proactivity', label: 'Proatividade' },
        { key: 'eval_communication', label: 'Comunicação' },
        { key: 'eval_relationship', label: 'Relacionamento Interpessoal' },
        { key: 'eval_technical_knowledge', label: 'Conhecimento Técnico' },
        { key: 'eval_learning_capacity', label: 'Capacidade de Aprendizagem' },
        { key: 'eval_productivity', label: 'Produtividade' },
        { key: 'eval_quality', label: 'Qualidade do Trabalho' },
        { key: 'eval_organization', label: 'Organização' },
        { key: 'eval_creativity', label: 'Criatividade' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/employee"
                        className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </Link>

                    <div className="flex gap-3">
                        <Button onClick={handleSaveDraft} variant="secondary" size="sm" disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </Button>
                        <Button onClick={handleGeneratePDF} variant="primary" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Gerar PDF
                        </Button>
                    </div>
                </div>

                <Card variant="glass" className="border-t-4 border-primary">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Ficha de Avaliação do Discente Estagiário</CardTitle>
                                <p className="text-neutral-400 text-sm mt-1">
                                    Avaliação de desempenho do estagiário pela empresa concedente
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <form ref={formRef} className="space-y-6" onChange={() => {
                    if (formRef.current) {
                        const data = new FormData(formRef.current)
                        setFormData(Object.fromEntries(data.entries()))
                    }
                }}>
                    {/* Dados do Estagiário */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Dados do Estagiário</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Estagiário</label>
                                    <input type="text" name="student_name" className="input w-full" onChange={handleInputChange} title="Nome do Estagiário" placeholder="Nome Completo" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                                    <input type="text" name="student_course" className="input w-full" onChange={handleInputChange} title="Curso" placeholder="Nome do Curso" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Matrícula</label>
                                    <input type="text" name="student_enrollment" className="input w-full" onChange={handleInputChange} title="Matrícula" placeholder="Número da Matrícula" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados da Empresa */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Dados da Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Empresa Concedente</label>
                                    <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} title="Empresa Concedente" placeholder="Razão Social da Empresa" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Supervisor do Estágio</label>
                                    <input type="text" name="company_supervisor" className="input w-full" onChange={handleInputChange} title="Supervisor do Estágio" placeholder="Nome do Supervisor" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Período */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Período Avaliado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Data Inicial</label>
                                    <input type="date" name="period_start" className="input w-full" onChange={handleInputChange} title="Data Inicial" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Data Final</label>
                                    <input type="date" name="period_end" className="input w-full" onChange={handleInputChange} title="Data Final" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Data da Avaliação</label>
                                    <input type="date" name="evaluation_date" className="input w-full" onChange={handleInputChange} title="Data da Avaliação" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Critérios de Avaliação */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Critérios de Avaliação</CardTitle>
                            <p className="text-sm text-neutral-400">Atribua uma nota de 1 a 5 para cada critério</p>
                            <div className="text-xs text-neutral-500 mt-2">
                                <strong>1</strong> - Insuficiente | <strong>2</strong> - Regular | <strong>3</strong> - Bom | <strong>4</strong> - Muito Bom | <strong>5</strong> - Excelente
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-neutral-300">
                                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-800">
                                        <tr>
                                            <th className="px-4 py-3">Critério</th>
                                            <th className="px-4 py-3 text-center">Nota (1-5)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {evaluationCriteria.map((criteria) => (
                                            <tr key={criteria.key} className="border-b border-neutral-700">
                                                <td className="px-4 py-3 font-medium">{criteria.label}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <select
                                                        name={criteria.key}
                                                        className="bg-neutral-800 border-none rounded px-2 py-1 text-sm w-20 text-center"
                                                        onChange={handleInputChange}
                                                        title={`Nota para: ${criteria.label}`}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="1">1</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="4">4</option>
                                                        <option value="5">5</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações e Recomendação */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Observações e Recomendação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Observações e Comentários</label>
                                <textarea name="observations" rows={5} className="input w-full" onChange={handleInputChange} title="Observações e Comentários" placeholder="Descreva observações adicionais sobre o desempenho do estagiário"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Recomendaria este estagiário para futuras oportunidades?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recommendation"
                                            value="sim"
                                            className="radio"
                                            onChange={handleInputChange}
                                            checked={formData.recommendation === 'sim'}
                                            title="Recomendaria para futuras oportunidades: Sim"
                                        />
                                        <span className="text-neutral-300">Sim</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recommendation"
                                            value="nao"
                                            className="radio"
                                            onChange={handleInputChange}
                                            checked={formData.recommendation === 'nao'}
                                            title="Recomendaria para futuras oportunidades: Não"
                                        />
                                        <span className="text-neutral-300">Não</span>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}
