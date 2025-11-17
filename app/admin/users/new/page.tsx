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
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { CONTRACT_TYPES, getContractTypeConfig, validateWorkingHours, formatHours } from '@/lib/contract-types'
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
    hasSiape: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Funções auxiliares
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400'
      case 'SUPERVISOR': return 'text-yellow-400'
      case 'EMPLOYEE': return 'text-blue-400'
      default: return 'text-neutral-400'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Acesso total ao sistema, pode gerenciar usuários e configurações'
      case 'SUPERVISOR': return 'Pode gerenciar estagiários e visualizar relatórios'
      case 'EMPLOYEE': return 'Acesso básico para registro de ponto e justificativas'
      default: return ''
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      signIn()
    }
  }, [status])

  // Check if user is admin or supervisor
  useEffect(() => {
    if (session && !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      router.push('/employee')
    }
  }, [session])

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
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
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Nome completo do usuário"
                        className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        className={`input pl-10 ${errors.email ? 'border-error' : ''}`}
                        value={userData.email}
                        onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className={`input pl-10 ${errors.password ? 'border-error' : ''}`}
                        value={userData.password}
                        onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Nível de Acesso *
                  </label>
                  <div className="space-y-3">
                    {['EMPLOYEE', 'SUPERVISOR', 'ADMIN'].map((role) => (
                      <label key={role} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={userData.role === role}
                          onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value as any }))}
                          className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-neutral-400" />
                            <span className={`font-medium ${getRoleColor(role)}`}>
                              {role === 'EMPLOYEE' ? 'Estagiário' : 
                               role === 'SUPERVISOR' ? 'Supervisor' : 'Administrador'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Telefone */}
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
                          value={userData.phone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const formatted = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
                            setUserData(prev => ({ ...prev, phone: formatted }))
                          }}
                          maxLength={15}
                        />
                      </div>
                      {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Data de Nascimento *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="date"
                          className={`input pl-10 ${errors.birthDate ? 'border-error' : ''}`}
                          value={userData.birthDate || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthDate: e.target.value }))}
                        />
                      </div>
                      {errors.birthDate && <p className="text-error text-xs mt-1">{errors.birthDate}</p>}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Endereço *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <textarea
                        placeholder="Endereço completo"
                        className={`input pl-10 min-h-[80px] resize-none ${errors.address ? 'border-error' : ''}`}
                        value={userData.address || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Nome do Contato *
                      </label>
                      <input
                        type="text"
                        placeholder="Nome completo"
                        className={`input ${errors.emergencyContact ? 'border-error' : ''}`}
                        value={userData.emergencyContact || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                      {errors.emergencyContact && <p className="text-error text-xs mt-1">{errors.emergencyContact}</p>}
                    </div>

                    {/* Telefone de Emergência */}
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
                          value={userData.emergencyPhone || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const formatted = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
                            setUserData(prev => ({ ...prev, emergencyPhone: formatted }))
                          }}
                          maxLength={15}
                        />
                      </div>
                      {errors.emergencyPhone && <p className="text-error text-xs mt-1">{errors.emergencyPhone}</p>}
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
                          setUserData(prev => ({ 
                            ...prev, 
                            hasSiape: e.target.checked,
                            siapeNumber: e.target.checked ? prev.siapeNumber : ''
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
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Matrícula SIAPE *
                        </label>
                        <input
                          type="text"
                          placeholder="1234567"
                          className={`input ${errors.siapeNumber ? 'border-error' : ''}`}
                          value={userData.siapeNumber || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                            setUserData(prev => ({ ...prev, siapeNumber: value }))
                          }}
                          maxLength={7}
                        />
                        {errors.siapeNumber && <p className="text-error text-xs mt-1">{errors.siapeNumber}</p>}
                        <p className="text-neutral-400 text-xs mt-1">
                          A matrícula SIAPE determinará automaticamente o nível de acesso no sistema
                        </p>
                        {userData.siapeNumber && userData.siapeNumber.length === 7 && (
                          <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-600">
                            <p className="text-xs text-neutral-300">
                              <span className="font-medium">Nível de acesso detectado:</span>{' '}
                              <span className={`font-semibold ${
                                determineRoleFromSiape(userData.siapeNumber) === 'ADMIN' ? 'text-red-400' : 'text-blue-400'
                              }`}>
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Departamento *
                      </label>
                      <select
                        className={`input ${errors.department ? 'border-error' : ''}`}
                        value={userData.department || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, department: e.target.value }))}
                      >
                        <option value="">Selecione o departamento</option>
                        <option value="TI">Tecnologia da Informação</option>
                        <option value="RH">Recursos Humanos</option>
                        <option value="FINANCEIRO">Financeiro</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="VENDAS">Vendas</option>
                        <option value="OPERACOES">Operações</option>
                        <option value="JURIDICO">Jurídico</option>
                        <option value="OUTROS">Outros</option>
                      </select>
                      {errors.department && <p className="text-error text-xs mt-1">{errors.department}</p>}
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
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Data de Início *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="date"
                            className={`input pl-10 ${errors.startDate ? 'border-error' : ''}`}
                            value={userData.startDate || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        {errors.startDate && <p className="text-error text-xs mt-1">{errors.startDate}</p>}
                      </div>

                      {/* Data de Início do Contrato */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Início do Contrato *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="date"
                            className={`input pl-10 ${errors.contractStartDate ? 'border-error' : ''}`}
                            value={userData.contractStartDate || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, contractStartDate: e.target.value }))}
                          />
                        </div>
                        {errors.contractStartDate && <p className="text-error text-xs mt-1">{errors.contractStartDate}</p>}
                      </div>

                      {/* Data de Fim do Contrato */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Fim do Contrato *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="date"
                            className={`input pl-10 ${errors.contractEndDate ? 'border-error' : ''}`}
                            value={userData.contractEndDate || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, contractEndDate: e.target.value }))}
                          />
                        </div>
                        {errors.contractEndDate && <p className="text-error text-xs mt-1">{errors.contractEndDate}</p>}
                      </div>

                      {/* Tipo de Contrato */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Tipo de Contrato *
                        </label>
                        <select
                          className={`input ${errors.contractType ? 'border-error' : ''}`}
                          value={userData.contractType || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, contractType: e.target.value }))}
                        >
                          <option value="">Selecione o tipo</option>
                          {CONTRACT_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        {errors.contractType && <p className="text-error text-xs mt-1">{errors.contractType}</p>}
                      </div>
                    </div>

                    {/* Carga Horária */}
                    {userData.contractType && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Carga Horária Semanal
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            min="1"
                            max="44"
                            className={`input w-32 ${errors.weeklyHours ? 'border-error' : ''}`}
                            value={userData.weeklyHours || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                          />
                          <span className="text-neutral-400 text-sm">horas por semana</span>
                        </div>
                        {errors.weeklyHours && <p className="text-error text-xs mt-1">{errors.weeklyHours}</p>}
                        
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
                    <Link href="/admin/users">
                      Cancelar
                    </Link>
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
