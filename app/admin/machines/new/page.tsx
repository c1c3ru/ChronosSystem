'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Monitor, 
  ArrowLeft,
  Save,
  MapPin,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface MachineData {
  name: string
  location: string
  isActive: boolean
}

export default function NewMachinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [machineData, setMachineData] = useState<MachineData>({
    name: '',
    location: '',
    isActive: true
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

    if (!machineData.name.trim()) {
      newErrors.name = 'Nome da máquina é obrigatório'
    } else if (machineData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!machineData.location.trim()) {
      newErrors.location = 'Localização é obrigatória'
    } else if (machineData.location.length < 5) {
      newErrors.location = 'Localização deve ter pelo menos 5 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(machineData)
      })

      if (response.ok) {
        router.push('/admin/machines')
      } else {
        const error = await response.json()
        setErrors({ general: error.message || 'Erro ao criar máquina' })
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
                <Link href="/admin/machines">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Máquinas
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Nova Máquina</h1>
                <p className="text-neutral-400">Adicionar novo terminal de ponto</p>
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
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Configurar Nova Máquina</CardTitle>
                  <p className="text-neutral-400 text-sm">
                    Defina o nome e localização do novo terminal
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

                {/* Nome da Máquina */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nome da Máquina *
                  </label>
                  <div className="relative">
                    <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Ex: Terminal Principal, Kiosk Recepção..."
                      className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                      value={machineData.name}
                      onChange={(e) => setMachineData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Localização */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Localização *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <textarea
                      placeholder="Ex: Recepção - Térreo, Sala de Reuniões - 2º Andar..."
                      className={`input pl-10 min-h-[80px] resize-none ${errors.location ? 'border-error' : ''}`}
                      value={machineData.location}
                      onChange={(e) => setMachineData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Status Inicial
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={machineData.isActive}
                        onChange={() => setMachineData(prev => ({ ...prev, isActive: true }))}
                        className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary"
                      />
                      <span className="text-success text-sm">Ativa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={!machineData.isActive}
                        onChange={() => setMachineData(prev => ({ ...prev, isActive: false }))}
                        className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary"
                      />
                      <span className="text-neutral-500 text-sm">Inativa</span>
                    </label>
                  </div>
                  <p className="text-neutral-500 text-xs mt-1">
                    Máquinas ativas podem gerar QR codes para registro de ponto
                  </p>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Settings className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Configurações Automáticas</h3>
                      <ul className="text-xs text-neutral-400 space-y-1">
                        <li>• QR codes serão gerados automaticamente a cada 60 segundos</li>
                        <li>• Registros de ponto ficarão disponíveis imediatamente</li>
                        <li>• Logs de auditoria serão criados para todas as ações</li>
                        <li>• A máquina aparecerá no dashboard administrativo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
                  <Button asChild variant="ghost">
                    <Link href="/admin/machines">
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
                        <span>Criar Máquina</span>
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
