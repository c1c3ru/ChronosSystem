'use client'

import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDraft, saveDraft } from '@/lib/form-drafts'
import { toast } from 'sonner'
import { InternshipRegistrationRequestDocument } from '@/components/templates/InternshipRegistrationRequestDocument'
import { maskCPF, maskCNPJ, maskCEP, maskPhone } from '@/lib/input-masks'

/**
 * Página de Solicitação de Cadastro no Estágio
 * Baseado no modelo oficial do IFCE Campus Maracanaú
 */
export default function InternshipRegistrationRequestPage() {
    const formRef = useRef<HTMLFormElement>(null)
    const documentRef = useRef<HTMLDivElement>(null)
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        // Dados Pessoais
        nome: '',
        cpf: '',
        nome_social: '',
        curso: '',
        matricula: '',
        endereco: '',
        bairro: '',
        municipio_uf: '',
        cep: '',
        telefone: '',
        email_institucional: '',
        email_pessoal: '',

        // Cor/Raça
        cor_raca: 'prefiro_nao_declarar' as 'amarelo' | 'branco' | 'indigena' | 'pardo' | 'preto' | 'prefiro_nao_declarar',

        // Etnia
        etnia: 'prefiro_nao_declarar' as 'indigena' | 'quilombola' | 'outra' | 'prefiro_nao_declarar',
        etnia_outra: '',
        comunidade_etnia: '',

        // Deficiências
        deficiencia: [] as string[],

        // Dados PF (opcional)
        nome_fantasia_pf: '',
        cnpj_registro_conselho: '',
        endereco_pf: '',
        bairro_pf: '',
        municipio_uf_pf: '',
        cep_pf: '',
        telefone_pf: '',
        email_pf: '',

        // Responsável Legal
        responsavel_legal: '',
        cargo_qualificacao: '',
        cpf_responsavel: '',
        telefone_responsavel: '',

        // Supervisor
        supervisor_nome: '',
        supervisor_cargo: '',
        setor_realizacao: '',

        // Tipo de Estágio
        tipo_estagio: 'obrigatorio' as 'obrigatorio' | 'nao_obrigatorio',
        forma_estagio: 'presencial' as 'presencial' | 'remoto',

        // Datas
        data_inicial: '',
        carga_horaria_semanal: '',
        data_final_prevista: '',

        // Horários
        horarios: {
            segunda_feira: { inicio: '', final: '' },
            terca_feira: { inicio: '', final: '' },
            quarta_feira: { inicio: '', final: '' },
            quinta_feira: { inicio: '', final: '' },
            sexta_feira: { inicio: '', final: '' },
            sabado: { inicio: '', final: '' },
            domingo: { inicio: '', final: '' },
        },

        // Turnos
        turnos: {
            primeira: { segunda: '', terca: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' },
            segunda: { segunda: '', terca: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' },
            terceira: { segunda: '', terca: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' },
        },

        // Datas finais
        data_solicitacao: '',
        data_autorizacao: '',
    })

    useEffect(() => {
        const loadDraft = async () => {
            const draft = await getDraft('internship-registration-request')
            if (draft) {
                setFormData(prev => ({ ...prev, ...draft }))
                toast.success('Rascunho carregado!')
            }
        }
        loadDraft()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
    let maskedValue = value

    // Aplicar máscaras baseado no nome do campo
    if (name.includes('cpf')) {
      maskedValue = maskCPF(value)
    } else if (name.includes('cnpj')) {
      maskedValue = maskCNPJ(value)
    } else if (name.includes('zip') || name.includes('cep')) {
      maskedValue = maskCEP(value)
    } else if (name.includes('phone') || name.includes('telefone')) {
      maskedValue = maskPhone(value)
    }

    // Atualizar o valor do input com a máscara
    if (maskedValue !== value && e.target instanceof HTMLInputElement) {
      e.target.value = maskedValue
    }

        // Tratamento especial para checkboxes e radio buttons
    const { type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked ? value : '' }))
    } else if (type === 'radio') {
      // Radio buttons: sempre salvar o value quando selecionado
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: maskedValue }))
    }
  }

    const handleDeficienciaChange = (deficiencia: string) => {
        setFormData(prev => ({
            ...prev,
            deficiencia: prev.deficiencia.includes(deficiencia)
                ? prev.deficiencia.filter(d => d !== deficiencia)
                : [...prev.deficiencia, deficiencia]
        }))
    }

    const handleTurnoChange = (turno: 'primeira' | 'segunda' | 'terceira', dia: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            turnos: {
                ...prev.turnos,
                [turno]: {
                    ...prev.turnos[turno],
                    [dia]: value
                }
            }
        }))
    }

    const handleSaveDraft = async () => {
        setIsSaving(true)
        await saveDraft('internship-registration-request', formData)
        toast.success('Rascunho salvo com sucesso!')
        setIsSaving(false)
    }

    const handleGeneratePDF = async () => {
    try {
      if (!formRef.current) return

      // Usar o estado formData em vez de FormData para capturar radio buttons e checkboxes
      const data: any = { ...formData }

      // Adicionar data atual se não estiver presente (se aplicável)
      const now = new Date()
      if (!data.date_day) data.date_day = String(now.getDate()).padStart(2, '0')
      if (!data.date_month) data.date_month = now.toLocaleString('pt-BR', { month: 'long' })
      if (!data.date_year) data.date_year = String(now.getFullYear())

      toast.loading('Gerando PDF...', { id: 'pdf-generation' })

      const { generateAndDownloadPDF } = await import('@/lib/pdf-generator-react')
      
      // Criar o documento React-PDF
      const pdfDocument = <InternshipRegistrationRequestDocument data={data as any} />
      
      // Gerar e baixar o PDF
      await generateAndDownloadPDF(pdfDocument, 'internship-registration-request.pdf')

      toast.success('PDF gerado com sucesso!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-generation' })
    }
  }

            

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/employee" className="flex items-center text-primary hover:text-primary/80 transition-colors font-medium group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </Link>
                    <div className="flex gap-3">
                        <Button onClick={handleSaveDraft} variant="secondary" size="sm" disabled={isSaving} className="gap-2">
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </Button>
                        <Button onClick={handleGeneratePDF} variant="primary" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Gerar PDF
                        </Button>
                    </div>
                </div>

                <Card variant="glass" className="border-t-4 border-primary">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Solicitação de Cadastro no Estágio</CardTitle>
                                <p className="text-neutral-400 text-sm mt-1">IFCE Campus Maracanaú - Modelo Oficial</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <form ref={formRef} className="space-y-6">
                    {/* Dados Pessoais */}
                    <Card variant="elevated">
                        <CardHeader><CardTitle className="text-lg">1. Dados Pessoais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome Completo" className="input col-span-2" />
                                <input name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="CPF" className="input" />
                            </div>
                            <input name="nome_social" value={formData.nome_social} onChange={handleInputChange} placeholder="Nome Social (Opcional)" className="input" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="curso" value={formData.curso} onChange={handleInputChange} placeholder="Curso" className="input" />
                                <input name="matricula" value={formData.matricula} onChange={handleInputChange} placeholder="Matrícula" className="input" />
                            </div>
                            <input name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Endereço Completo" className="input" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Bairro" className="input" />
                                <input name="municipio_uf" value={formData.municipio_uf} onChange={handleInputChange} placeholder="Município-UF" className="input" />
                                <input name="cep" value={formData.cep} onChange={handleInputChange} placeholder="CEP" className="input" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="Telefone" className="input" />
                                <input name="email_institucional" value={formData.email_institucional} onChange={handleInputChange} placeholder="E-mail Institucional" className="input" />
                                <input name="email_pessoal" value={formData.email_pessoal} onChange={handleInputChange} placeholder="E-mail Pessoal" className="input" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cor/Raça e Etnia */}
                    <Card variant="elevated">
                        <CardHeader><CardTitle className="text-lg">2. Cor/Raça e Etnia</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Cor/Raça</label>
                                    <select name="cor_raca" value={formData.cor_raca} onChange={handleInputChange} className="input w-full">
                                        <option value="amarelo">Amarelo(a)</option>
                                        <option value="branco">Branco(a)</option>
                                        <option value="indigena">Indígena</option>
                                        <option value="pardo">Pardo(a)</option>
                                        <option value="preto">Preto(a)</option>
                                        <option value="prefiro_nao_declarar">Prefiro não declarar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Etnia</label>
                                    <select name="etnia" value={formData.etnia} onChange={handleInputChange} className="input w-full">
                                        <option value="indigena">Indígena</option>
                                        <option value="quilombola">Quilombola</option>
                                        <option value="outra">Outra</option>
                                        <option value="prefiro_nao_declarar">Prefiro não declarar</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tipo de Estágio e Datas */}
                    <Card variant="elevated">
                        <CardHeader><CardTitle className="text-lg">3. Informações do Estágio</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Tipo de Estágio</label>
                                    <select name="tipo_estagio" value={formData.tipo_estagio} onChange={handleInputChange} className="input w-full">
                                        <option value="obrigatorio">Obrigatório</option>
                                        <option value="nao_obrigatorio">Não Obrigatório</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Forma de Estágio</label>
                                    <select name="forma_estagio" value={formData.forma_estagio} onChange={handleInputChange} className="input w-full">
                                        <option value="presencial">Presencial</option>
                                        <option value="remoto">Remoto</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Data Inicial</label>
                                    <input type="date" name="data_inicial" value={formData.data_inicial} onChange={handleInputChange} className="input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Carga Horária Semanal</label>
                                    <input type="number" name="carga_horaria_semanal" value={formData.carga_horaria_semanal} onChange={handleInputChange} placeholder="Horas" className="input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Data Final Prevista</label>
                                    <input type="date" name="data_final_prevista" value={formData.data_final_prevista} onChange={handleInputChange} className="input w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}
