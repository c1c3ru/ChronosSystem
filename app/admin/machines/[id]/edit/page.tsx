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
  id: string
  name: string
  location: string
  isActive: boolean
  createdAt: string
  _count?: {
    attendanceRecords: number
    qrEvents: number
  }
}

interface UpdateData {
  name?: string
  location?: string
  isActive?: boolean
}

export default function EditMachinePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [machineData, setMachineData] = useState<MachineData | null>(null)
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

  // Load machine data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadMachineData()
    }
  }, [session, params.id])

  const loadMachineData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/machines/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setMachineData(data)
        // Inicializar dados de atualização com dados atuais
        setUpdateData({
          name: data.name,
          location: data.location,
          isActive: data.isActive
        })
      } else {
        router.push('/admin/machines')
      }
    } catch (error) {
      console.error('Erro ao carregar máquina:', error)
      router.push('/admin/machines')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (updateData.name && updateData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (updateData.location && updateData.location.length < 5) {
      newErrors.location = 'Localização deve ter pelo menos 5 caracteres'
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
      if (updateData.name !== machineData?.name) changedData.name = updateData.name
      if (updateData.location !== machineData?.location) changedData.location = updateData.location
      if (updateData.isActive !== machineData?.isActive) changedData.isActive = updateData.isActive

      const response = await fetch(`/api/machines/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedData)
      })

      if (response.ok) {
        router.push('/admin/machines')
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Erro ao atualizar máquina' })
      }
    } catch (error) {
      setErrors({ general: 'Erro interno. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <Loading />
  }

  if (!session || !machineData) {
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
                <h1 className="text-2xl font-bold text-white">Editar Máquina</h1>
                <p className="text-neutral-400">Atualizar configurações de {machineData.name}</p>
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
                  <CardTitle>Atualizar Configurações</CardTitle>
                  <p className="text-neutral-400 text-sm">
                    Modifique as informações da máquina
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

                {/* Informações da Máquina */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações da Máquina</h3>
                  
                  {/* Nome da Máquina */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nome da Máquina
                    </label>
                    <div className="relative">
                      <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Ex: Terminal Principal, Kiosk Recepção..."
                        className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                        value={updateData.name || ''}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Localização
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <textarea
                        placeholder="Ex: Recepção - Térreo, Sala de Reuniões - 2º Andar..."
                        className={`input pl-10 min-h-[80px] resize-none ${errors.location ? 'border-error' : ''}`}
                        value={updateData.location || ''}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">
                      Status da Máquina
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={updateData.isActive === true}
                          onChange={() => setUpdateData(prev => ({ ...prev, isActive: true }))}
                          className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary"
                        />
                        <span className="text-success text-sm">Ativa</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={updateData.isActive === false}
                          onChange={() => setUpdateData(prev => ({ ...prev, isActive: false }))}
                          className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary"
                        />
                        <span className="text-neutral-500 text-sm">Inativa</span>
                      </label>
                    </div>
                    <p className="text-neutral-500 text-xs mt-1">
                      Máquinas inativas não podem gerar QR codes
                    </p>
                  </div>
                </div>

                {/* Estatísticas */}
                {machineData._count && (
                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Settings className="h-5 w-5 text-neutral-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2">Estatísticas da Máquina</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400">
                          <div>
                            <span className="block text-neutral-300">Registros de Ponto:</span>
                            <span className="text-white font-medium">{machineData._count.attendanceRecords || 0}</span>
                          </div>
                          <div>
                            <span className="block text-neutral-300">QR Codes Gerados:</span>
                            <span className="text-white font-medium">{machineData._count.qrEvents || 0}</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          Criada em: {new Date(machineData.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
                  <Button asChild variant="ghost">
                    <Link href="/admin/machines">
                      Cancelar
                    </Link>
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
