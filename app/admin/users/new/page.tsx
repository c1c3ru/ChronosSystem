'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  User,
  ArrowLeft,
  Save,
  Mail,
  Lock,
  Shield,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import {
  CONTRACT_TYPES,
  ContractTypeConfig,
  getContractTypeConfig,
  validateWorkingHours,
  formatHours,
} from '@/lib/contract-types'
import { determineRoleFromSiape } from '@/lib/admin-siape'

interface UserData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE'
  phone?: string
  address?: string
  department?: string
  birthDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  siapeNumber?: string
  hasSiape?: boolean
  registrationNumber?: string
  startDate?: string
  contractStartDate?: string
  contractEndDate?: string
  contractType?: string
  weeklyHours?: number
}

export default function NewUserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    phone: '',
    address: '',
    department: '',
    hasSiape: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Funções auxiliares
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-400'
      case 'SUPERVISOR':
        return 'text-yellow-400'
      case 'EMPLOYEE':
        return 'text-blue-400'
      default:
        return 'text-neutral-400'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Acesso total ao sistema, pode gerenciar usuários e configurações'
      case 'SUPERVISOR':
        return 'Pode gerenciar estagiários e visualizar relatórios'
      case 'EMPLOYEE':
        return 'Acesso básico para registro de ponto e justificativas'
      default:
        return ''
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      signIn()
    }
  }, [status, session])

  // Check if user is admin or supervisor
  useEffect(() => {
    if (session && !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      router.push('/employee')
    }
  }, [session, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Campos básicos obrigatórios
    if (!userData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (userData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!userData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!userData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (userData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Campos de perfil obrigatórios
    if (!userData.phone) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(userData.phone)) {
      newErrors.phone = 'Formato inválido. Use: (11) 99999-9999'
    }

    if (!userData.address) {
      newErrors.address = 'Endereço é obrigatório'
    }

    if (!userData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    }

    if (!userData.emergencyContact) {
      newErrors.emergencyContact = 'Contato de emergência é obrigatório'
    }

    if (!userData.emergencyPhone) {
      newErrors.emergencyPhone = 'Telefone de emergência é obrigatório'
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(userData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Formato inválido. Use: (11) 99999-9999'
    }

    // Validação SIAPE (apenas se hasSiape for true)
    if (userData.hasSiape) {
      if (!userData.siapeNumber) {
        newErrors.siapeNumber = 'Matrícula SIAPE é obrigatória quando selecionada'
      } else if (!/^\d{7}$/.test(userData.siapeNumber)) {
        newErrors.siapeNumber = 'Matrícula SIAPE deve ter exatamente 7 dígitos'
      }
    }

    // Validações específicas para funcionários
    if (userData.role === 'EMPLOYEE') {
      if (!userData.department) {
        newErrors.department = 'Departamento é obrigatório para funcionários'
      }

      if (!userData.registrationNumber?.trim()) {
        newErrors.registrationNumber = 'Matrícula é obrigatória para alunos/estagiários'
      }

      if (!userData.startDate) {
        newErrors.startDate = 'Data de início é obrigatória para funcionários'
      }

      if (!userData.contractStartDate) {
        newErrors.contractStartDate = 'Data de início do contrato é obrigatória'
      }

      if (!userData.contractEndDate) {
        newErrors.contractEndDate = 'Data de fim do contrato é obrigatória'
      }

      // Validar se data de fim é posterior à data de início
      if (userData.contractStartDate && userData.contractEndDate) {
        if (new Date(userData.contractEndDate) <= new Date(userData.contractStartDate)) {
          newErrors.contractEndDate = 'Data de fim deve ser posterior à data de início'
        }
      }

      if (!userData.contractType) {
        newErrors.contractType = 'Tipo de contrato é obrigatório para funcionários'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        router.push('/admin/users')
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Erro ao criar usuário' })
      }
    } catch (error) {
      setErrors({ general: 'Erro interno. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 border-b border-neutral-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Usuários
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Novo Usuário</h1>
                <p className="text-neutral-400">Cadastrar novo estagiário ou supervisor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Cadastrar Novo Usuário</CardTitle>
                  <p className="text-neutral-400 text-sm">
                    Defina as informações básicas do usuário
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>

                  {/* Nome */}
                  <div>
                    <label
                      htmlFor="new-user-name"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="new-user-name"
                        type="text"
                        placeholder="Nome completo do usuário"
                        className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                        value={userData.name}
                        onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="new-user-email"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="new-user-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        className={`input pl-10 ${errors.email ? 'border-error' : ''}`}
                        value={userData.email}
                        onChange={(e) =>
                          setUserData((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </div>
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Senha */}
                  <div>
                    <label
                      htmlFor="new-user-password"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="new-user-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className={`input pl-10 ${errors.password ? 'border-error' : ''}`}
                        value={userData.password}
                        onChange={(e) =>
                          setUserData((prev) => ({ ...prev, password: e.target.value }))
                        }
                      />
                    </div>
                    {errors.password && (
                      <p className="text-error text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Role */}
                <fieldset>
                  <legend className="block text-sm font-medium text-neutral-300 mb-3">
                    Nível de Acesso *
                  </legend>
                  <div className="space-y-3">
                    {['EMPLOYEE', 'SUPERVISOR', 'ADMIN'].map((role) => (
                      <div
                        key={role}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                      >
                        <input
                          id={`new-user-role-${role}`}
                          type="radio"
                          name="role"
                          value={role}
                          checked={userData.role === role}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              role: e.target.value as UserData['role'],
                            }))
                          }
                          className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary mt-0.5"
                        />
                        <label htmlFor={`new-user-role-${role}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-neutral-400" />
                            <span className={`font-medium ${getRoleColor(role)}`}>
                              {role === 'EMPLOYEE'
                                ? 'Estagiário'
                                : role === 'SUPERVISOR'
                                  ? 'Supervisor'
                                  : 'Administrador'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {getRoleDescription(role)}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Telefone */}
                    <div>
                      <label
                        htmlFor="new-user-phone"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Telefone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="new-user-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className={`input pl-10 ${errors.phone ? 'border-error' : ''}`}
                          value={userData.phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const formatted = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
                            setUserData((prev) => ({ ...prev, phone: formatted }))
                          }}
                          maxLength={15}
                        />
                      </div>
                      {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label
                        htmlFor="new-user-birthdate"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Data de Nascimento *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="new-user-birthdate"
                          type="date"
                          className={`input pl-10 ${errors.birthDate ? 'border-error' : ''}`}
                          value={userData.birthDate || ''}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, birthDate: e.target.value }))
                          }
                        />
                      </div>
                      {errors.birthDate && (
                        <p className="text-error text-xs mt-1">{errors.birthDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <label
                      htmlFor="new-user-address"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Endereço *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <textarea
                        id="new-user-address"
                        placeholder="Endereço completo"
                        className={`input pl-10 min-h-[80px] resize-none ${errors.address ? 'border-error' : ''}`}
                        value={userData.address || ''}
                        onChange={(e) =>
                          setUserData((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>
                    {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                  </div>
                </div>

                {/* Contato de Emergência */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Contato de Emergência</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nome do Contato */}
                    <div>
                      <label
                        htmlFor="new-user-emergency-contact"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Nome do Contato *
                      </label>
                      <input
                        id="new-user-emergency-contact"
                        type="text"
                        placeholder="Nome completo"
                        className={`input ${errors.emergencyContact ? 'border-error' : ''}`}
                        value={userData.emergencyContact || ''}
                        onChange={(e) =>
                          setUserData((prev) => ({ ...prev, emergencyContact: e.target.value }))
                        }
                      />
                      {errors.emergencyContact && (
                        <p className="text-error text-xs mt-1">{errors.emergencyContact}</p>
                      )}
                    </div>

                    {/* Telefone de Emergência */}
                    <div>
                      <label
                        htmlFor="new-user-emergency-phone"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Telefone de Emergência *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          id="new-user-emergency-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className={`input pl-10 ${errors.emergencyPhone ? 'border-error' : ''}`}
                          value={userData.emergencyPhone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const formatted = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
                            setUserData((prev) => ({ ...prev, emergencyPhone: formatted }))
                          }}
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Institucionais</h3>

                  {/* Toggle para SIAPE */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userData.hasSiape || false}
                        onChange={(e) => {
                          setUserData((prev) => ({
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
                      Marque esta opção se o usuário é servidor público federal com matrícula SIAPE
                    </p>
                  </div>

                  {/* Campo SIAPE - apenas se selecionado */}
                  {userData.hasSiape && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="new-user-siape"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Matrícula SIAPE *
                        </label>
                        <input
                          id="new-user-siape"
                          type="text"
                          placeholder="1234567"
                          className={`input ${errors.siapeNumber ? 'border-error' : ''}`}
                          value={userData.siapeNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                            setUserData((prev) => ({ ...prev, siapeNumber: value }))
                          }}
                          maxLength={7}
                        />
                        {errors.siapeNumber && (
                          <p className="text-error text-xs mt-1">{errors.siapeNumber}</p>
                        )}
                        <p className="text-neutral-400 text-xs mt-1">
                          A matrícula SIAPE determinará automaticamente o nível de acesso no sistema
                        </p>
                        {userData.siapeNumber && userData.siapeNumber.length === 7 && (
                          <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-600">
                            <p className="text-xs text-neutral-300">
                              <span className="font-medium">Nível de acesso detectado:</span>{' '}
                              <span
                                className={`font-semibold ${
                                  determineRoleFromSiape(userData.siapeNumber) === 'ADMIN'
                                    ? 'text-red-400'
                                    : 'text-blue-400'
                                }`}
                              >
                                {determineRoleFromSiape(userData.siapeNumber)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Departamento - obrigatório para funcionários */}
                  {userData.role === 'EMPLOYEE' && (
                    <div>
                      <label
                        htmlFor="new-user-department"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Departamento *
                      </label>
                      <select
                        id="new-user-department"
                        className={`input ${errors.department ? 'border-error' : ''}`}
                        value={userData.department || ''}
                        onChange={(e) =>
                          setUserData((prev) => ({ ...prev, department: e.target.value }))
                        }
                      >
                        <option value="">Selecione o departamento</option>
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
                  )}

                  {/* Matrícula - do aluno/estagiário (não confundir com SIAPE, exclusiva de servidor) */}
                  {userData.role === 'EMPLOYEE' && (
                    <div>
                      <label
                        htmlFor="new-user-registration-number"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Matrícula *
                      </label>
                      <input
                        id="new-user-registration-number"
                        type="text"
                        placeholder="Número da matrícula do aluno"
                        className={`input ${errors.registrationNumber ? 'border-error' : ''}`}
                        value={userData.registrationNumber || ''}
                        onChange={(e) =>
                          setUserData((prev) => ({
                            ...prev,
                            registrationNumber: e.target.value,
                          }))
                        }
                      />
                      {errors.registrationNumber && (
                        <p className="text-error text-xs mt-1">{errors.registrationNumber}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Informações de Contrato - apenas para funcionários */}
                {userData.role === 'EMPLOYEE' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Informações de Contrato</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Data de Início */}
                      <div>
                        <label
                          htmlFor="new-user-start-date"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Data de Início *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-user-start-date"
                            type="date"
                            className={`input pl-10 ${errors.startDate ? 'border-error' : ''}`}
                            value={userData.startDate || ''}
                            onChange={(e) =>
                              setUserData((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                          />
                        </div>
                        {errors.startDate && (
                          <p className="text-error text-xs mt-1">{errors.startDate}</p>
                        )}
                      </div>

                      {/* Data de Início do Contrato */}
                      <div>
                        <label
                          htmlFor="new-user-contract-start"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Início do Contrato *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-user-contract-start"
                            type="date"
                            className={`input pl-10 ${errors.contractStartDate ? 'border-error' : ''}`}
                            value={userData.contractStartDate || ''}
                            onChange={(e) =>
                              setUserData((prev) => ({
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

                      {/* Data de Fim do Contrato */}
                      <div>
                        <label
                          htmlFor="new-user-contract-end"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Fim do Contrato *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            id="new-user-contract-end"
                            type="date"
                            className={`input pl-10 ${errors.contractEndDate ? 'border-error' : ''}`}
                            value={userData.contractEndDate || ''}
                            onChange={(e) =>
                              setUserData((prev) => ({ ...prev, contractEndDate: e.target.value }))
                            }
                          />
                        </div>
                        {errors.contractEndDate && (
                          <p className="text-error text-xs mt-1">{errors.contractEndDate}</p>
                        )}
                      </div>

                      {/* Tipo de Contrato */}
                      <div>
                        <label
                          htmlFor="new-user-contract-type"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Tipo de Contrato *
                        </label>
                        <select
                          id="new-user-contract-type"
                          className={`input ${errors.contractType ? 'border-error' : ''}`}
                          value={userData.contractType || ''}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, contractType: e.target.value }))
                          }
                        >
                          <option value="">Selecione o tipo</option>
                          {CONTRACT_TYPES.map((type: ContractTypeConfig) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        {errors.contractType && (
                          <p className="text-error text-xs mt-1">{errors.contractType}</p>
                        )}
                      </div>
                    </div>

                    {/* Carga Horária */}
                    {userData.contractType && (
                      <div>
                        <label
                          htmlFor="new-user-weekly-hours"
                          className="block text-sm font-medium text-neutral-300 mb-2"
                        >
                          Carga Horária Semanal
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            id="new-user-weekly-hours"
                            type="number"
                            min="1"
                            max="44"
                            className={`input w-32 ${errors.weeklyHours ? 'border-error' : ''}`}
                            value={userData.weeklyHours || ''}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                weeklyHours: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                          <span className="text-neutral-400 text-sm">horas por semana</span>
                        </div>
                        {errors.weeklyHours && (
                          <p className="text-error text-xs mt-1">{errors.weeklyHours}</p>
                        )}

                        {userData.contractType && userData.weeklyHours && (
                          <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-600">
                            <p className="text-xs text-neutral-300">
                              <span className="font-medium">Configuração:</span>{' '}
                              {formatHours(userData.weeklyHours)} por semana
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
                  <Button asChild variant="ghost">
                    <Link href="/admin/users">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={loading} className="min-w-[150px]">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Criando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Criar Usuário</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
