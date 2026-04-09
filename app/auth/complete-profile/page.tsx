'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { signIn, signOut } from 'next-auth/react'
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { toast } from 'sonner'
import { UserExistsAlert } from '@/components/UserExistsAlert'
import { ShiftConfigForm } from '@/components/ShiftConfigForm'
import {
  CONTRACT_TYPES,
  getContractTypeConfig,
  validateWorkingHours,
  formatHours,
} from '@/lib/contract-types'
import { calculateInternshipEnd, formatDate, formatDuration } from '@/lib/internship-calculator'
import { determineRoleFromSiape } from '@/lib/admin-siape'

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
  hasSiape?: boolean
  contractType?: string
  shift?: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'
  shiftStartTime?: string
  shiftEndTime?: string
  workingDaysPerWeek?: number
  allowFlexibleHours?: boolean
}

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showUserExistsAlert, setShowUserExistsAlert] = useState(false)
  const [existingUserData, setExistingUserData] = useState<any>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const effectiveRole = useMemo(() => {
    if (profileData.siapeNumber && profileData.siapeNumber.length === 7) {
      return determineRoleFromSiape(profileData.siapeNumber)
    }
    return session?.user?.role || 'EMPLOYEE'
  }, [profileData.siapeNumber, session?.user?.role])

  // Função para voltar (logout e redirecionar para login)
  const handleGoBack = async () => {
    try {
      // Fazer logout
      await signOut({ redirect: false })
      // Redirecionar para página de login
      router.push('/auth/signin')
    } catch (error) {
      console.error('Erro ao voltar:', error)
      // Fallback: redirecionar diretamente
      router.push('/auth/signin')
    }
  }

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.
  useEffect(() => {
    if (status === 'loading' || hasRedirected) return

    if (!session) {
      // Deixar o middleware cuidar disso, ou mostrar fallback no render
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
  const validateForm = () => {
    console.log('🔍 [VALIDAÇÃO] Iniciando validação do formulário...')
    console.log('📝 [VALIDAÇÃO] Dados atuais:', profileData)

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

    // Departamento só é obrigatório para funcionários
    if (effectiveRole === 'EMPLOYEE' && !profileData.department) {
      newErrors.department = 'Departamento é obrigatório para funcionários'
    }

    // Validar matrícula SIAPE (apenas se hasSiape for true)
    if (profileData.hasSiape) {
      if (!profileData.siapeNumber) {
        newErrors.siapeNumber = 'Matrícula SIAPE é obrigatória quando selecionada'
      } else if (!/^\d{7}$/.test(profileData.siapeNumber)) {
        newErrors.siapeNumber = 'Matrícula SIAPE deve ter exatamente 7 dígitos'
      }
    }

    // Validar tipo de contrato e carga horária (apenas para funcionários)
    if (effectiveRole === 'EMPLOYEE') {
      if (!profileData.contractType) {
        newErrors.contractType = 'Tipo de contrato é obrigatório'
      }

      // Validar datas apenas para funcionários (não para ADMIN/SUPERVISOR)
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
        if (new Date(profileData.contractEndDate) <= new Date(profileData.contractStartDate)) {
          newErrors.contractEndDate = 'Data de fim deve ser posterior à data de início'
        }
      }
    }

    console.log('🎯 [VALIDAÇÃO] Role efetivo:', effectiveRole)

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ [VALIDAÇÃO] Erros encontrados:', newErrors)
      console.log('📋 [VALIDAÇÃO] Campos obrigatórios para', effectiveRole, ':', {
        phone: !!profileData.phone,
        address: !!profileData.address,
        birthDate: !!profileData.birthDate,
        emergencyContact: !!profileData.emergencyContact,
        emergencyPhone: !!profileData.emergencyPhone,
        siapeNumber: !!profileData.siapeNumber,
        department: effectiveRole === 'EMPLOYEE' ? !!profileData.department : 'N/A (ADMIN)',
        contractType: effectiveRole === 'EMPLOYEE' ? !!profileData.contractType : 'N/A (ADMIN)',
        contractStartDate:
          effectiveRole === 'EMPLOYEE' ? !!profileData.contractStartDate : 'N/A (ADMIN)',
        contractEndDate:
          effectiveRole === 'EMPLOYEE' ? !!profileData.contractEndDate : 'N/A (ADMIN)',
      })
    } else {
      console.log('✅ [VALIDAÇÃO] Todos os campos OK para', effectiveRole)
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
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
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mostrar estado de redirecionamento
        setRedirecting(true)

        // Atualizar sessão para refletir mudanças no banco
        console.log('🔄 Atualizando sessão...')
        await update()

        // Aguardar um pouco para a sessão atualizar
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Forçar atualização da sessão novamente para garantir
        console.log('🔄 Forçando segunda atualização da sessão...')
        await update()

        // Aguardar mais um pouco
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Usar URL de redirecionamento da API
        const redirectUrl = result.redirectUrl || '/employee'
        console.log('🔄 Redirecionando para:', redirectUrl)

        // Redirecionamento com reload completo para forçar nova verificação do middleware
        console.log('🔄 Forçando reload completo...')
        window.location.replace(redirectUrl)
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
  }, [isHydrated, profileData, handleSubmit])

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
    setProfileData((prev) => ({ ...prev, [field]: formatted }))
  }

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 font-outfit">Sessão Expirada</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md font-outfit">
          Para completar seu perfil, você precisa estar autenticado.
        </p>
        <Button onClick={() => signIn()}>Fazer Login</Button>
      </div>
    )
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
              Olá, {session.user.name}! Para continuar, precisamos de algumas informações
              adicionais.
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-400">Erro ao Completar Perfil</h3>
                      <p className="mt-1 text-sm text-red-300">{errors.general}</p>
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
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
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
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Informações Pessoais
                </h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Email (já confirmado)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="email"
                        type="email"
                        value={session.user.email || ''}
                        disabled
                        className="input pl-10 bg-neutral-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="phone"
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
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Endereço Completo *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <textarea
                        id="address"
                        placeholder="Rua, número, bairro, cidade, CEP"
                        className={`input pl-10 min-h-[80px] resize-none ${errors.address ? 'border-error' : ''}`}
                        value={profileData.address || ''}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>
                    {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Data de Nascimento *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="birthDate"
                        type="date"
                        className={`input pl-10 ${errors.birthDate ? 'border-error' : ''}`}
                        value={profileData.birthDate || ''}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, birthDate: e.target.value }))
                        }
                      />
                    </div>
                    {errors.birthDate && (
                      <p className="text-error text-xs mt-1">{errors.birthDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Contato de Emergência
                </h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="emergencyContact"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Nome do Contato *
                    </label>
                    <input
                      id="emergencyContact"
                      type="text"
                      placeholder="Nome completo"
                      className={`input ${errors.emergencyContact ? 'border-error' : ''}`}
                      value={profileData.emergencyContact || ''}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, emergencyContact: e.target.value }))
                      }
                    />
                    {errors.emergencyContact && (
                      <p className="text-error text-xs mt-1">{errors.emergencyContact}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="emergencyPhone"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Telefone de Emergência *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className={`input pl-10 ${errors.emergencyPhone ? 'border-error' : ''}`}
                        value={profileData.emergencyPhone || ''}
                        onChange={(e) => handlePhoneChange('emergencyPhone', e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    {errors.emergencyPhone && (
                      <p className="text-error text-xs mt-1">{errors.emergencyPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Institucionais */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Informações Institucionais
                </h3>

                {/* Toggle para SIAPE */}
                <div className="mb-4">
                  <label htmlFor="hasSiape" className="flex items-center space-x-3 cursor-pointer">
                    <input
                      id="hasSiape"
                      type="checkbox"
                      checked={profileData.hasSiape || false}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          hasSiape: e.target.checked,
                          siapeNumber: e.target.checked ? prev.siapeNumber : '',
                        }))
                      }}
                      className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-neutral-300">
                      Possuo matrícula SIAPE (servidor público)
                    </span>
                  </label>
                  <p className="text-neutral-400 text-xs mt-1 ml-7">
                    Marque esta opção se você é servidor público federal com matrícula SIAPE
                  </p>
                </div>

                {/* Campo SIAPE - apenas se selecionado */}
                {profileData.hasSiape && (
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="siapeNumber"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Matrícula SIAPE *
                      </label>
                      <input
                        id="siapeNumber"
                        type="text"
                        placeholder="1234567"
                        className={`input ${errors.siapeNumber ? 'border-error' : ''}`}
                        value={profileData.siapeNumber || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                          setProfileData((prev) => ({ ...prev, siapeNumber: value }))
                        }}
                        maxLength={7}
                      />
                      {errors.siapeNumber && (
                        <p className="text-error text-xs mt-1">{errors.siapeNumber}</p>
                      )}
                      <p className="text-neutral-400 text-xs mt-1">
                        Sua matrícula SIAPE determinará automaticamente seu nível de acesso no
                        sistema
                      </p>
                      {profileData.siapeNumber && profileData.siapeNumber.length === 7 && (
                        <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-600">
                          <p className="text-xs text-neutral-300">
                            <span className="font-medium">Nível de acesso detectado:</span>{' '}
                            <span
                              className={`font-semibold ${
                                determineRoleFromSiape(profileData.siapeNumber) === 'ADMIN'
                                  ? 'text-red-400'
                                  : 'text-blue-400'
                              }`}
                            >
                              {determineRoleFromSiape(profileData.siapeNumber)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Profissionais - Apenas para funcionários após determinar role pelo SIAPE */}
              {effectiveRole === 'EMPLOYEE' && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                    Informações Profissionais
                  </h3>
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Departamento *
                      </label>
                      <select
                        id="department"
                        className={`input ${errors.department ? 'border-error' : ''}`}
                        value={profileData.department || ''}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, department: e.target.value }))
                        }
                      >
                        <option value="">Selecione o departamento</option>
                        <option value="ASSDAP-MAR">
                          Assist. Depto. Admin. e Planejamento (ASSDAP-MAR)
                        </option>
                        <option value="ASSDE-MAR">Assist. Diretoria de Ensino (ASSDE-MAR)</option>
                        <option value="Alunos">Alunos/Campus Maracanaú (Alunos)</option>
                        <option value="CAC-MAR">Coord. Aquisição e Contratações (CAC-MAR)</option>
                        <option value="CAE-MAR">Coord. Assuntos Estudantis (CAE-MAR)</option>
                        <option value="CAP-MAR">Coord. Almoxarifado e Patrimônio (CAP-MAR)</option>
                        <option value="CBAR-COMP-MAR">
                          Bach. Ciência da Computação (CBAR-COMP-MAR)
                        </option>
                        <option value="CBAR-CONTROLEAUT-MAR">
                          Bach. Eng. Controle e Automação (CBAR-CONTROLEAUT-MAR)
                        </option>
                        <option value="CBAR-ENGAMB-MAR">
                          Bach. Eng. Ambiental e Sanitária (CBAR-ENGAMB-MAR)
                        </option>
                        <option value="CBAR-ENGMECAN-MAR">
                          Bach. Eng. Mecânica (CBAR-ENGMECAN-MAR)
                        </option>
                        <option value="CBCC-MAR">
                          Coord. Bach. Ciências da Computação (CBCC-MAR)
                        </option>
                        <option value="CBBILIO-MAR">Biblioteca (CBBILIO-MAR)</option>
                        <option value="CCA-MAR">Coord. Tec. Química (CCA-MAR)</option>
                        <option value="CCAUTO-MAR">
                          Coord. Tec. Automação Industrial (CCAUTO-MAR)
                        </option>
                        <option value="CCEAS-MAR">
                          Coord. Tec. Eng. Ambiental Sanitária (CCEAS-MAR)
                        </option>
                        <option value="CCECA-MAR">
                          Coord. Tec. Eng. Controle Automação (CCECA-MAR)
                        </option>
                        <option value="CCENM-MAR">Coord. Tec. Eng. Mecânica (CCENM-MAR)</option>
                        <option value="CCINFO-MAR">Coord. Tec. Informática (CCINFO-MAR)</option>
                        <option value="CCLM-MAR">Coord. Lic. Matemática (CCLM-MAR)</option>
                        <option value="CCMEREN-MAR">
                          Coord. Mestrado Energias Renováveis (CCMEREN-MAR)
                        </option>
                        <option value="CCLM-MAR-MESTRADO">
                          Coord. Mestrado Matemática (CCLM-MAR-MESTRADO)
                        </option>
                        <option value="CCTEC-REDES-MAR">
                          Coord. Tec. Redes de Computadores (CCTEC-REDES-MAR)
                        </option>
                        <option value="CCTQ-MAR">Coord. Tec. Química (CCTQ-MAR)</option>
                        <option value="CCTMEC-MAR">Coord. Tec. Mecatrônica (CCTMEC-MAR)</option>
                        <option value="CCTM-MAR">Coord. Tec. Eletrotécnica (CCTM-MAR)</option>
                        <option value="CCTEC-AUTOMACAO-MAR">
                          Coord. Tec. Automação Industrial (CCTEC-AUTOMACAO-MAR)
                        </option>
                        <option value="CCTQ2-MAR">Coord. Tec. Química II (CCTQ2-MAR)</option>
                        <option value="CCTM-MAR-MECANICA">
                          Coord. Tec. Mecânica (CCTM-MAR-MECANICA)
                        </option>
                        <option value="CCTMEC2-MAR">
                          Coord. Tec. Mecatrônica II (CCTMEC2-MAR)
                        </option>
                        <option value="CCTM-MAR-ELETRO">
                          Coord. Tec. Eletrotécnica II (CCTM-MAR-ELETRO)
                        </option>
                        <option value="CCTI-MAR">Coord. Tec. Informática (CCTI-MAR)</option>
                        <option value="CDI-MARACANAU">
                          Coord. Eixo Industrial (CDI-MARACANAU)
                        </option>
                        <option value="CDI-MARACANAU-DI">
                          Coord. Desenv. Institucional (CDI-MARACANAU-DI)
                        </option>
                        <option value="CEI-MARACANAU">Coord. Eixo Indústria (CEI-MARACANAU)</option>
                        <option value="CEOF-MAR">
                          Coord. Exec. Orçamentária Financeira (CEOF-MAR)
                        </option>
                        <option value="CEQMA-MARACANAU">
                          Coord. Eixo Química e Meio Ambiente (CEQMA-MARACANAU)
                        </option>
                        <option value="CETEL-MARACANAU">
                          Coord. Eixo Telemática (CETEL-MARACANAU)
                        </option>
                        <option value="CGP-MAR">Coord. Gestão de Pessoas (CGP-MAR)</option>
                        <option value="CINFRA-MAR">Coord. Infraestrutura (CINFRA-MAR)</option>
                        <option value="CLIC-QUIMICA-MAR">
                          Coord. Lic. Química (CLIC-QUIMICA-MAR)
                        </option>
                        <option value="CMES-ENERGIAS-MAR">
                          Coord. Mestrado Energias Renováveis (CMES-ENERGIAS-MAR)
                        </option>
                        <option value="CPPI-MAR">Coord. Pesquisa, Inovação PG (CPPI-MAR)</option>
                        <option value="CTEC-AUTOMACAO-MAR">
                          Coord. Tec. Automação Industrial (CTEC-AUTOMACAO-MAR)
                        </option>
                        <option value="CTEC-INFORMAT-MAR">
                          Coord. Tec. Informática (CTEC-INFORMAT-MAR)
                        </option>
                        <option value="CTEC-MANUTINDUST-MAR">
                          Coord. Tec. Manutenção Industrial (CTEC-MANUTINDUST-MAR)
                        </option>
                        <option value="CTEC-MEIOAMB-MAR">
                          Coord. Tec. Meio Ambiente (CTEC-MEIOAMB-MAR)
                        </option>
                        <option value="CTEC-REDES-MAR">
                          Coord. Tec. Redes de Computadores (CTEC-REDES-MAR)
                        </option>
                        <option value="CTI-MAR">Coord. Tecnologia da Informação (CTI-MAR)</option>
                        <option value="CTP-MAR">Coord. Pedagógica (CTP-MAR)</option>
                        <option value="DAP-MAR">Depto. Admin. e Planejamento (DAP-MAR)</option>
                        <option value="DE-MAR">Diretoria de Ensino (DE-MAR)</option>
                        <option value="DG-MAR">Diretoria Geral (DG-MAR)</option>
                        <option value="DPPI-MAR">
                          Depto. Extensão, Pesquisa, PG, Inovação (DPPI-MAR)
                        </option>
                        <option value="GAB-MAR">Gabinete (GAB-MAR)</option>
                        <option value="NAPNE-MAR">
                          Coord. Núcleo Atendimento Necessidades Específicas (NAPNE-MAR)
                        </option>
                        <option value="SAE-MARACANAU">
                          Setor Acompanhamento Estágios (SAE-MARACANAU)
                        </option>
                        <option value="SEFE-MAR">
                          Setor Educação Física e Esportes (SEFE-MAR)
                        </option>
                        <option value="SNUTRI-MAR">Setor Nutrição (SNUTRI-MAR)</option>
                        <option value="SPSICO-MAR">Setor Psicologia (SPSICO-MAR)</option>
                        <option value="SSA-MAR">Setor Saúde (SSA-MAR)</option>
                      </select>
                      {errors.department && (
                        <p className="text-error text-xs mt-1">{errors.department}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Início no IFCE/órgão *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="startDate"
                          type="date"
                          className={`input pl-10 ${errors.startDate ? 'border-error' : ''}`}
                          value={profileData.startDate || ''}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      {errors.startDate && (
                        <p className="text-error text-xs mt-1">{errors.startDate}</p>
                      )}
                    </div>

                    {/* Tipo de contrato apenas para funcionários */}
                    {effectiveRole === 'EMPLOYEE' && (
                      <>
                        <div>
                          <label
                            htmlFor="contractType"
                            className="block text-sm font-medium text-neutral-300 mb-2"
                          >
                            Tipo de Contrato *
                          </label>
                          <select
                            id="contractType"
                            className={`input ${errors.contractType ? 'border-error' : ''}`}
                            value={profileData.contractType || ''}
                            onChange={(e) => {
                              setProfileData((prev) => ({
                                ...prev,
                                contractType: e.target.value,
                              }))
                            }}
                          >
                            <option value="">Selecione o tipo de contrato</option>
                            {CONTRACT_TYPES.filter((type: any) => type.id !== 'CUSTOM').map(
                              (type: any) => (
                                <option key={type.id} value={type.id}>
                                  {type.name} - {formatHours(type.dailyHours)}/dia
                                </option>
                              )
                            )}
                          </select>
                          {errors.contractType && (
                            <p className="text-error text-xs mt-1">{errors.contractType}</p>
                          )}
                          {profileData.contractType && (
                            <p className="text-neutral-400 text-xs mt-1">
                              {getContractTypeConfig(profileData.contractType)?.description}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Informações do Contrato - Apenas para funcionários */}
              {effectiveRole === 'EMPLOYEE' && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                    Informações do Contrato
                  </h3>
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contractStartDate"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Início do Contrato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="contractStartDate"
                          type="date"
                          className={`input pl-10 ${errors.contractStartDate ? 'border-error' : ''}`}
                          value={profileData.contractStartDate || ''}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              contractStartDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      {errors.contractStartDate && (
                        <p className="text-error text-xs mt-1">{errors.contractStartDate}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contractEndDate"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Fim do Contrato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="contractEndDate"
                          type="date"
                          className={`input pl-10 ${errors.contractEndDate ? 'border-error' : ''}`}
                          value={profileData.contractEndDate || ''}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, contractEndDate: e.target.value }))
                          }
                          min={profileData.contractStartDate || undefined}
                        />
                      </div>
                      {errors.contractEndDate && (
                        <p className="text-error text-xs mt-1">{errors.contractEndDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Configuração de Turno - Apenas para funcionários */}
              {effectiveRole === 'EMPLOYEE' && (
                <ShiftConfigForm
                  shift={(profileData.shift as any) || 'MORNING'}
                  shiftStartTime={profileData.shiftStartTime || '08:00'}
                  shiftEndTime={profileData.shiftEndTime || '12:00'}
                  workingDaysPerWeek={profileData.workingDaysPerWeek || 5}
                  allowFlexibleHours={profileData.allowFlexibleHours || false}
                  contractType={profileData.contractType}
                  onChange={(field, value) => {
                    setProfileData((prev) => ({ ...prev, [field]: value }))
                  }}
                  errors={errors}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-neutral-700">
                {/* Botão Voltar */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGoBack}
                  disabled={loading || redirecting}
                  className="w-full sm:w-auto sm:min-w-[150px] border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                >
                  <div className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar ao Login</span>
                  </div>
                </Button>

                {/* Botão Salvar */}
                <Button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full sm:w-auto sm:min-w-[150px]"
                  onClick={(e) => {
                    console.log('🖱️ BOTÃO SALVAR CLICADO!')
                    console.log('📊 Estado atual:', { loading, redirecting, profileData })
                    console.log('📝 Dados do formulário no clique:', profileData)
                    // Não prevenir default aqui, deixar o form submit acontecer
                  }}
                >
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
