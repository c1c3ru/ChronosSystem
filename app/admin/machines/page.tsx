'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { 
  Monitor, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Power,
  PowerOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Machine {
  id: string
  name: string
  location: string
  isActive: boolean
  createdAt: string
  _count: {
    attendanceRecords: number
  }
}

export default function MachinesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Load machines data
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadMachines()
    }
  }, [session])

  const loadMachines = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/machines')
      
      if (response.ok) {
        const data = await response.json()
        setMachines(data)
      }
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMachine = async (machineId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        loadMachines() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status da máquina:', error)
    }
  }

  const deleteMachine = async (machineId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta máquina?')) return
    
    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadMachines() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao excluir máquina:', error)
    }
  }

  const filteredMachines = machines.filter(machine => 
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
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
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Máquinas</h1>
                <p className="text-neutral-400">Administre terminais de ponto</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/machines/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Máquina
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou localização..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Machines Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMachines.map((machine) => (
            <Card key={machine.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    <span>{machine.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMachine(machine.id, machine.isActive)}
                      className={`p-1 rounded ${
                        machine.isActive 
                          ? 'text-success hover:bg-success/10' 
                          : 'text-neutral-500 hover:bg-neutral-700'
                      }`}
                    >
                      {machine.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-400">Localização</p>
                    <p className="text-white">{machine.location}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">Status</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          machine.isActive ? 'bg-success' : 'bg-neutral-500'
                        }`} />
                        <span className={`text-sm ${
                          machine.isActive ? 'text-success' : 'text-neutral-500'
                        }`}>
                          {machine.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-neutral-400">Registros</p>
                      <p className="text-white font-medium">{machine._count?.attendanceRecords || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-400">Criada em</p>
                    <p className="text-white text-sm">
                      {new Date(machine.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/machines/${machine.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMachine(machine.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Monitor className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma máquina encontrada</h3>
              <p className="text-neutral-400 mb-4">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca'
                  : 'Comece criando a primeira máquina'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/admin/machines/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Máquina
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
