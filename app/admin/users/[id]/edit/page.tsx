'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { User, ArrowLeft, Save, Mail, Lock, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface UserData {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE'
  phone?: string
  address?: string
  department?: string
}

interface UpdateData {
  name?: string
  email?: string
  password?: string
  role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE'
  phone?: string
  address?: string
  department?: string
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [updateData, setUpdateData] = useState<UpdateData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${id}`)

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
          setUpdateData({
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || '',
            address: data.address || '',
            department: data.department || '',
          })
        } else {
          router.push('/admin/users')
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        router.push('/admin/users')
      } finally {
        setLoading(false)
      }
    }

    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadUserData()
    }
  }, [session, id, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (updateData.name && updateData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (updateData.password && updateData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)

      // Filtrar apenas campos que foram alterados
      const changedData: UpdateData = {}
      if (updateData.name !== userData?.name) changedData.name = updateData.name
      if (updateData.email !== userData?.email) changedData.email = updateData.email
      if (updateData.role !== userData?.role) changedData.role = updateData.role
      if (updateData.phone !== userData?.phone) changedData.phone = updateData.phone
      if (updateData.address !== userData?.address) changedData.address = updateData.address
      if (updateData.department !== userData?.department)
        changedData.department = updateData.department
      if (updateData.password) changedData.password = updateData.password

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changedData),
      })

      if (response.ok) {
        router.push('/admin/users')
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Erro ao atualizar usuário' })
      }
    } catch (error) {
      setErrors({ general: 'Erro interno. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

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
        return 'Acesso total ao sistema'
      case 'SUPERVISOR':
        return 'Gerencia usuários e relatórios'
      case 'EMPLOYEE':
        return 'Registro de ponto e justificativas'
      default:
        return ''
    }
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  if (!session || !userData) {
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
                <h1 className="text-2xl font-bold text-white">Editar Usuário</h1>
                <p className="text-neutral-400">Atualizar informações de {userData.name}</p>
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
                  <CardTitle>Atualizar Informações</CardTitle>
                  <p className="text-neutral-400 text-sm">
                    Modifique apenas os campos que deseja alterar
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
                      htmlFor="edit-user-name"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="edit-user-name"
                        type="text"
                        placeholder="Nome completo do usuário"
                        className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                        value={updateData.name || ''}
                        onChange={(e) =>
                          setUpdateData((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="edit-user-email"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="edit-user-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        className={`input pl-10 ${errors.email ? 'border-error' : ''}`}
                        value={updateData.email || ''}
                        onChange={(e) =>
                          setUpdateData((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </div>
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label
                      htmlFor="edit-user-password"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Nova Senha (Opcional)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="edit-user-password"
                        type="password"
                        placeholder="Deixe em branco para manter a atual"
                        className={`input pl-10 ${errors.password ? 'border-error' : ''}`}
                        value={updateData.password || ''}
                        onChange={(e) =>
                          setUpdateData((prev) => ({ ...prev, password: e.target.value }))
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
                    Nível de Acesso
                  </legend>
                  <div className="space-y-3">
                    {['EMPLOYEE', 'SUPERVISOR', 'ADMIN'].map((role) => (
                      <div
                        key={role}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                      >
                        <input
                          id={`edit-user-role-${role}`}
                          type="radio"
                          name="role"
                          value={role}
                          checked={updateData.role === role}
                          onChange={(e) =>
                            setUpdateData((prev) => ({ ...prev, role: e.target.value as UpdateData['role'] }))
                          }
                          className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary mt-0.5"
                        />
                        <label htmlFor={`edit-user-role-${role}`} className="flex-1 cursor-pointer">
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

                {/* Informações Opcionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Adicionais</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Telefone */}
                    <div>
                      <label
                        htmlFor="edit-user-phone"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Telefone
                      </label>
                      <input
                        id="edit-user-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="input"
                        value={updateData.phone || ''}
                        onChange={(e) =>
                          setUpdateData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>

                    {/* Departamento */}
                    <div>
                      <label
                        htmlFor="edit-user-department"
                        className="block text-sm font-medium text-neutral-300 mb-2"
                      >
                        Departamento
                      </label>
                      <select
                        id="edit-user-department"
                        className="input"
                        value={updateData.department || ''}
                        onChange={(e) =>
                          setUpdateData((prev) => ({ ...prev, department: e.target.value }))
                        }
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
                    <label
                      htmlFor="edit-user-address"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Endereço
                    </label>
                    <textarea
                      id="edit-user-address"
                      placeholder="Endereço completo"
                      className="input min-h-[80px] resize-none"
                      value={updateData.address || ''}
                      onChange={(e) =>
                        setUpdateData((prev) => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
                  <Button asChild variant="ghost">
                    <Link href="/admin/users">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={saving} className="min-w-[150px]">
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Salvar Alterações</span>
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
