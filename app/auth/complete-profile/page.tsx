'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

interface ProfileData {
  phone?: string
  address?: string
  birthDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  department?: string
  startDate?: string
}

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated or profile already complete
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      signIn()
      return
    }

    // Se o perfil já está completo, redirecionar
    if ((session.user as any).profileComplete) {
      const role = session.user.role
      if (role === 'ADMIN' || role === 'SUPERVISOR') {
        router.push('/admin')
      } else {
        router.push('/employee')
      }
    }
  }, [session, status, router])

  const validateForm = () => {
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

    if (!profileData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        // Atualizar sessão
        await update()
        
        // Redirecionar baseado no role
        const role = session?.user.role
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          router.push('/admin')
        } else {
          router.push('/employee')
        }
      } else {
        const error = await response.json()
        setErrors({ general: error.message || 'Erro ao salvar perfil' })
      }
    } catch (error) {
      setErrors({ general: 'Erro interno. Tente novamente.' })
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
            <p className="text-neutral-400">
              Olá, {session.user.name}! Para continuar, precisamos de algumas informações adicionais.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error text-sm">
                  {errors.general}
                </div>
              )}

              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                <h3 className="text-lg font-semibold text-white mb-4">Contato de Emergência</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                <h3 className="text-lg font-semibold text-white mb-4">Informações Profissionais</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                  {loading ? (
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
