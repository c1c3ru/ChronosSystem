'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { toast } from 'sonner'
import { CONTRACT_TYPES, getContractTypeConfig, validateWorkingHours, formatHours } from '@/lib/contract-types'

interface ProfileData {
  phone?: string
  address?: string
  birthDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  department?: string
  startDate?: string
  contractStartDate?: string
  contractEndDate?: string
  siapeNumber?: string
  contractType?: string
  weeklyHours?: number
}

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Redirect if not authenticated or profile already complete
  useEffect(() => {
    if (status === 'loading' || hasRedirected) return
    
    if (!session) {
      signIn()
      return
    }

    // Se o perfil já está completo, redirecionar
    if ((session.user as any).profileComplete) {
      console.log('🔄 Perfil já completo, redirecionando...')
      setHasRedirected(true)
      const role = session.user.role
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        router.push('/admin')
      } else {
        router.push('/employee')
      }
    }
  }, [session, status, router, hasRedirected])

  // Detectar hidratação
  useEffect(() => {
    console.log('🔄 Componente hidratado')
    setIsHydrated(true)
  }, [])

  // Anexar event listener após hidratação e quando formulário estiver disponível
  useEffect(() => {
    if (!isHydrated) return
    
    // Aguardar um tick para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      const form = formRef.current
      if (form) {
        console.log('📋 Anexando event listener manual ao formulário')
        
        const handleFormSubmit = async (e: Event) => {
          console.log('🚀 Event listener manual chamado!')
          e.preventDefault()
          
          // Chamar a mesma lógica do handleSubmit
          const fakeReactEvent = e as unknown as React.FormEvent
          
          await handleSubmit(fakeReactEvent)
        }
        
        // Anexar listener manual
        form.addEventListener('submit', handleFormSubmit)
        console.log('✅ Event listener manual anexado')
        
        // Cleanup
        return () => {
          console.log('🧹 Removendo event listener manual')
          form.removeEventListener('submit', handleFormSubmit)
        }
      } else {
        console.log('❌ Formulário ainda não está disponível no DOM')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isHydrated, profileData])

  const validateForm = () => {
    console.log('🔍 Validando formulário com dados:', profileData)
    const newErrors: Record<string, string> = {}

    if (!profileData.phone) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(profileData.phone)) {
      newErrors.phone = 'Formato inválido. Use: (11) 99999-9999'
    }

    if (!profileData.address) {
      newErrors.address = 'Endereço é obrigatório'
    }

    if (!profileData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    }

    if (!profileData.emergencyContact) {
      newErrors.emergencyContact = 'Contato de emergência é obrigatório'
    }

    if (!profileData.emergencyPhone) {
      newErrors.emergencyPhone = 'Telefone de emergência é obrigatório'
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(profileData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Formato inválido. Use: (11) 99999-9999'
    }

    if (!profileData.department) {
      newErrors.department = 'Departamento é obrigatório'
    }

    // Validar matrícula SIAPE (obrigatória para todos)
    if (!profileData.siapeNumber) {
      newErrors.siapeNumber = 'Matrícula SIAPE é obrigatória'
    } else if (!/^\d{7}$/.test(profileData.siapeNumber)) {
      newErrors.siapeNumber = 'Matrícula SIAPE deve ter exatamente 7 dígitos'
    }

    // Validar tipo de contrato e carga horária (apenas para funcionários)
    const userRole = session?.user?.role
    if (userRole === 'EMPLOYEE') {
      if (!profileData.contractType) {
        newErrors.contractType = 'Tipo de contrato é obrigatório'
      } else {
        const contractConfig = getContractTypeConfig(profileData.contractType)
        if (contractConfig && profileData.weeklyHours) {
          const validation = validateWorkingHours(profileData.weeklyHours, contractConfig.category)
          if (!validation.isValid) {
            newErrors.weeklyHours = validation.error || 'Carga horária inválida'
          }
        }
      }
    }

    // Validar datas apenas para funcionários (não para ADMIN/SUPERVISOR)
    if (userRole === 'EMPLOYEE') {
      if (!profileData.startDate) {
        newErrors.startDate = 'Data de início é obrigatória'
      }
      
      if (!profileData.contractStartDate) {
        newErrors.contractStartDate = 'Data de início do contrato é obrigatória'
      }

      if (!profileData.contractEndDate) {
        newErrors.contractEndDate = 'Data de fim do contrato é obrigatória'
      }

      // Validar se data de fim é posterior à data de início
      if (profileData.contractStartDate && profileData.contractEndDate) {
        const startDate = new Date(profileData.contractStartDate)
        const endDate = new Date(profileData.contractEndDate)
        
        if (endDate <= startDate) {
          newErrors.contractEndDate = 'Data de fim deve ser posterior à data de início'
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Erros de validação encontrados:', newErrors)
    } else {
      console.log('✅ Validação passou - todos os campos OK')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit chamado!')
    e.preventDefault()
    
    console.log('📝 Dados do formulário:', profileData)
    
    if (!validateForm()) {
      console.log('❌ Validação falhou')
      return
    }
    
    console.log('✅ Validação passou')

    try {
      setLoading(true)
      setErrors({}) // Limpar erros anteriores
      
      console.log('Enviando dados:', profileData)
      
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Perfil salvo com sucesso:', result)
        
        // Mostrar estado de sucesso
        setSuccess(true)
        setErrors({}) // Limpar erros
        
        // Mostrar toast de sucesso
        toast.success('Perfil completado com sucesso!')
        
        // Aguardar um pouco para o toast aparecer
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mostrar estado de redirecionamento
        setRedirecting(true)
        
        // Usar URL de redirecionamento da API
        const redirectUrl = result.redirectUrl || '/employee'
        console.log('🔄 Redirecionando para:', redirectUrl)
        
        // Redirecionamento simples e confiável
        window.location.href = redirectUrl
        
      } else {
        const error = await response.json()
        console.error('Erro na API:', error)
        const errorMessage = error.message || 'Erro ao salvar perfil'
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Erro no submit:', error)
      const errorMessage = 'Erro interno. Tente novamente.'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const handlePhoneChange = (field: 'phone' | 'emergencyPhone', value: string) => {
    const formatted = formatPhone(value)
    setProfileData(prev => ({ ...prev, [field]: formatted }))
  }

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Complete seu Perfil</CardTitle>
            <p className="text-neutral-400 text-sm sm:text-base">
              Olá, {session.user.name}! Para continuar, precisamos de algumas informações adicionais.
            </p>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-400">
                        Erro ao Completar Perfil
                      </h3>
                      <p className="mt-1 text-sm text-red-300">
                        {errors.general}
                      </p>
                      <div className="mt-3 flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setErrors({})}
                          className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Fechar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({})
                            // Tentar enviar novamente
                            const form = formRef.current
                            if (form) {
                              form.requestSubmit()
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-400">
                        Perfil Completado com Sucesso!
                      </h3>
                      <p className="mt-1 text-sm text-green-300">
                        Suas informações foram salvas. Você será redirecionado em instantes...
                      </p>
                      {redirecting && (
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                          <span className="text-xs text-green-400">Redirecionando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informações Pessoais */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações Pessoais</h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email (já confirmado)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        value={session.user.email || ''}
                        disabled
                        className="input pl-10 bg-neutral-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className={`input pl-10 ${errors.phone ? 'border-error' : ''}`}
                        value={profileData.phone || ''}
                        onChange={(e) => handlePhoneChange('phone', e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Endereço Completo *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <textarea
                        placeholder="Rua, número, bairro, cidade, CEP"
                        className={`input pl-10 min-h-[80px] resize-none ${errors.address ? 'border-error' : ''}`}
                        value={profileData.address || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Data de Nascimento *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="date"
                        className={`input pl-10 ${errors.birthDate ? 'border-error' : ''}`}
                        value={profileData.birthDate || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                    {errors.birthDate && <p className="text-error text-xs mt-1">{errors.birthDate}</p>}
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Contato de Emergência</h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className={`input ${errors.emergencyContact ? 'border-error' : ''}`}
                      value={profileData.emergencyContact || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                    {errors.emergencyContact && <p className="text-error text-xs mt-1">{errors.emergencyContact}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Telefone de Emergência *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className={`input pl-10 ${errors.emergencyPhone ? 'border-error' : ''}`}
                        value={profileData.emergencyPhone || ''}
                        onChange={(e) => handlePhoneChange('emergencyPhone', e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    {errors.emergencyPhone && <p className="text-error text-xs mt-1">{errors.emergencyPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações Profissionais</h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Departamento *
                    </label>
                    <select
                      className={`input ${errors.department ? 'border-error' : ''}`}
                      value={profileData.department || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="">Selecione o departamento</option>
                      <option value="COORDENACAO_INFORMATICA">Coordenação de Informática</option>
                      <option value="COORDENACAO_EDIFICACOES">Coordenação de Edificações</option>
                      <option value="COORDENACAO_TELECOMUNICACOES">Coordenação de Telecomunicações</option>
                      <option value="COORDENACAO_PEDAGOGICA">Coordenação Pedagógica</option>
                      <option value="COORDENACAO_MEIO_AMBIENTE">Coordenação de Meio Ambiente</option>
                      <option value="DIRECAO_GERAL">Direção Geral</option>
                      <option value="DIRETORIA_ENSINO">Diretoria de Ensino</option>
                      <option value="DIRETORIA_ADMINISTRACAO">Diretoria de Administração e Planejamento</option>
                      <option value="COORDENACAO_EXTENSAO">Coordenação de Extensão</option>
                      <option value="COORDENACAO_PESQUISA">Coordenação de Pesquisa e Inovação</option>
                      <option value="BIBLIOTECA">Biblioteca</option>
                      <option value="REGISTRO_ACADEMICO">Registro Acadêmico</option>
                      <option value="ASSISTENCIA_ESTUDANTIL">Assistência Estudantil</option>
                      <option value="RECURSOS_HUMANOS">Recursos Humanos</option>
                      <option value="FINANCEIRO">Setor Financeiro</option>
                      <option value="PATRIMONIO">Patrimônio</option>
                      <option value="ALMOXARIFADO">Almoxarifado</option>
                      <option value="MANUTENCAO">Manutenção</option>
                      <option value="SEGURANCA">Segurança</option>
                      <option value="LIMPEZA">Limpeza</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                    {errors.department && <p className="text-error text-xs mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Matrícula SIAPE *
                    </label>
                    <input
                      type="text"
                      placeholder="1234567"
                      className={`input ${errors.siapeNumber ? 'border-error' : ''}`}
                      value={profileData.siapeNumber || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                        setProfileData(prev => ({ ...prev, siapeNumber: value }))
                      }}
                      maxLength={7}
                    />
                    {errors.siapeNumber && <p className="text-error text-xs mt-1">{errors.siapeNumber}</p>}
                    <p className="text-neutral-400 text-xs mt-1">
                      Sua matrícula SIAPE determinará automaticamente seu nível de acesso no sistema
                    </p>
                  </div>

                  {/* Tipo de contrato apenas para funcionários */}
                  {session?.user?.role === 'EMPLOYEE' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Tipo de Contrato *
                        </label>
                        <select
                          className={`input ${errors.contractType ? 'border-error' : ''}`}
                          value={profileData.contractType || ''}
                          onChange={(e) => {
                            const contractConfig = getContractTypeConfig(e.target.value)
                            setProfileData(prev => ({ 
                              ...prev, 
                              contractType: e.target.value,
                              weeklyHours: contractConfig?.weeklyHours || prev.weeklyHours
                            }))
                          }}
                        >
                          <option value="">Selecione o tipo de contrato</option>
                          {CONTRACT_TYPES.filter(type => type.id !== 'CUSTOM').map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name} - {formatHours(type.dailyHours)}/dia
                            </option>
                          ))}
                        </select>
                        {errors.contractType && <p className="text-error text-xs mt-1">{errors.contractType}</p>}
                        {profileData.contractType && (
                          <p className="text-neutral-400 text-xs mt-1">
                            {getContractTypeConfig(profileData.contractType)?.description}
                          </p>
                        )}
                      </div>

                      {profileData.contractType && (
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Carga Horária Semanal *
                          </label>
                          <input
                            type="number"
                            min="12"
                            max="44"
                            placeholder="20"
                            className={`input ${errors.weeklyHours ? 'border-error' : ''}`}
                            value={profileData.weeklyHours || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0
                              setProfileData(prev => ({ ...prev, weeklyHours: value }))
                            }}
                          />
                          {errors.weeklyHours && <p className="text-error text-xs mt-1">{errors.weeklyHours}</p>}
                          <p className="text-neutral-400 text-xs mt-1">
                            Estágios: 12h a 36h • Empregos: 40h ou 44h
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Data de início apenas para funcionários */}
                  {session?.user?.role === 'EMPLOYEE' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Data de Início *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="date"
                          className={`input pl-10 ${errors.startDate ? 'border-error' : ''}`}
                          value={profileData.startDate || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      {errors.startDate && <p className="text-error text-xs mt-1">{errors.startDate}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Contrato - Apenas para funcionários */}
              {session?.user?.role === 'EMPLOYEE' && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações do Contrato</h3>
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Início do Contrato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="date"
                          className={`input pl-10 ${errors.contractStartDate ? 'border-error' : ''}`}
                          value={profileData.contractStartDate || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, contractStartDate: e.target.value }))}
                        />
                      </div>
                      {errors.contractStartDate && <p className="text-error text-xs mt-1">{errors.contractStartDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Fim do Contrato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="date"
                          className={`input pl-10 ${errors.contractEndDate ? 'border-error' : ''}`}
                          value={profileData.contractEndDate || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, contractEndDate: e.target.value }))}
                          min={profileData.contractStartDate || undefined}
                        />
                      </div>
                      {errors.contractEndDate && <p className="text-error text-xs mt-1">{errors.contractEndDate}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-neutral-700">
                <Button type="submit" disabled={loading || redirecting} className="w-full sm:w-auto sm:min-w-[150px]">
                  {redirecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Redirecionando...</span>
                    </div>
                  ) : loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Salvar e Continuar</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
