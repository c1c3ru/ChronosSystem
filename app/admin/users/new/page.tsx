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
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface UserData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE'
  phone?: string
  address?: string
  department?: string
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
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      case 'ADMIN': return 'Acesso total ao sistema'
      case 'SUPERVISOR': return 'Gerencia usuários e relatórios'
      case 'EMPLOYEE': return 'Registro de ponto e justificativas'
      default: return ''
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

                {/* Informações Opcionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Adicionais (Opcional)</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="input"
                        value={userData.phone}
                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Departamento
                      </label>
                      <select
                        className="input"
                        value={userData.department}
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
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Endereço
                    </label>
                    <textarea
                      placeholder="Endereço completo (opcional)"
                      className="input min-h-[80px] resize-none"
                      value={userData.address}
                      onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

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
