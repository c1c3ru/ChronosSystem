'use client'

import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Save, FileText, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft, populateFormWithData } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { RealizationTermDocument } from '@/components/templates/RealizationTermDocument'

export default function RealizationTermPage() {
    const formRef = useRef<HTMLFormElement>(null)
    const templateRef = useRef<HTMLDivElement>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        const loadDraft = async () => {
            const draft = await getDraft('realization-term')
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSaveDraft = async () => {
        if (!formRef.current) return

        setIsSaving(true)
        const currentFormData = new FormData(formRef.current)
        const data = Object.fromEntries(currentFormData.entries())

        await saveDraft('realization-term', data)
        toast.success('Rascunho salvo com sucesso!')
        setIsSaving(false)
    }

    const handleGeneratePDF = async () => {
        try {
            if (!formRef.current || !templateRef.current) return

            const currentFormData = new FormData(formRef.current)
            const data = Object.fromEntries(currentFormData.entries())

            // Adicionar data atual se não estiver presente
            const now = new Date()
            if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
            if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
            if (!data.date_year) data.date_year = String(now.getFullYear())

            // Atualizar estado para garantir que o template renderize com os dados mais recentes
            setFormData(data)

            // Pequeno delay para garantir renderização
            await new Promise(resolve => setTimeout(resolve, 100))

            toast.loading('Gerando PDF...', { id: 'pdf-generation' })

            const { generatePDFWithPuppeteer } = await import('@/lib/pdf-generator')

            await generatePDFWithPuppeteer(templateRef.current, 'termo-realizacao-estagio.pdf')

            toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
        } catch (error) {
            console.error('Erro ao gerar PDF:', error)
            toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
        }
    }

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
                                <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Termo de Realização de Estágio</CardTitle>
                                <p className="text-neutral-400 text-sm mt-1">
                                    Documento que atesta a conclusão do estágio
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
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Nome Completo</label>
                                    <input type="text" name="student_name" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">CPF</label>
                                    <input type="text" name="student_cpf" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">RG</label>
                                    <input type="text" name="student_rg" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Curso</label>
                                    <input type="text" name="student_course" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Matrícula</label>
                                    <input type="text" name="student_enrollment" className="input w-full" onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados da Empresa */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Dados da Empresa Concedente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Razão Social</label>
                                    <input type="text" name="company_name" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">CNPJ</label>
                                    <input type="text" name="company_cnpj" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Supervisor do Estágio</label>
                                    <input type="text" name="company_supervisor" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Endereço</label>
                                    <input type="text" name="company_address" className="input w-full" onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados do Estágio */}
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle className="text-lg">Dados do Estágio Realizado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Data de Início</label>
                                    <input type="date" name="internship_start_date" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Data de Término</label>
                                    <input type="date" name="internship_end_date" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Carga Horária Total (horas)</label>
                                    <input type="number" name="total_hours" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Carga Horária Semanal (horas)</label>
                                    <input type="number" name="weekly_hours" className="input w-full" onChange={handleInputChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Atividades Desenvolvidas</label>
                                    <textarea name="activities" rows={8} className="input w-full" onChange={handleInputChange}></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Avaliação do Desempenho</label>
                                    <textarea name="performance_evaluation" rows={5} className="input w-full" onChange={handleInputChange}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Cidade</label>
                                    <input type="text" name="city" className="input w-full" defaultValue="Fortaleza" onChange={handleInputChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {/* Template Oculto para PDF */}
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <RealizationTermDocument ref={templateRef} data={formData} />
                </div>
            </div>
        </div>
    )
}
