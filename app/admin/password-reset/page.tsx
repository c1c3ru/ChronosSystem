'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Users, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Copy,
  Trash2,
  RefreshCw,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  name: string
}

interface ActiveToken {
  id: string
  token: string
  expires: string
  createdAt: string
  user: User
  resetUrl: string
}

export default function PasswordResetPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [activeTokens, setActiveTokens] = useState<ActiveToken[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTokens, setIsLoadingTokens] = useState(true)
  const [reason, setReason] = useState('')
  const [expiresInHours, setExpiresInHours] = useState(24)
  const [resetType, setResetType] = useState<'mass' | 'individual'>('individual')
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [customMessage, setCustomMessage] = useState('')

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes((session.user as any)?.role)) {
      loadUsers()
      loadActiveTokens()
    }
  }, [session, status])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        // Filtrar apenas usuários com senha (não só Google)
        const usersWithPassword = data.users.filter((user: any) => user.password !== null)
        setUsers(usersWithPassword)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    }
  }

  const loadActiveTokens = async () => {
    try {
      setIsLoadingTokens(true)
      const response = await fetch('/api/admin/password-reset')
      const data = await response.json()
      
      if (response.ok) {
        setActiveTokens(data.activeTokens)
      }
    } catch (error) {
      console.error('Erro ao carregar tokens:', error)
      toast.error('Erro ao carregar tokens ativos')
    } finally {
      setIsLoadingTokens(false)
    }
  }

  const handleMassReset = async () => {
    if (!reason.trim()) {
      toast.error('Motivo é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mass',
          userIds: resetType === 'mass' ? undefined : selectedUsers,
          reason,
          expiresInHours
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setReason('')
        setSelectedUsers([])
        loadActiveTokens()
      } else {
        toast.error(data.error || 'Erro ao criar tokens de reset')
      }
    } catch (error) {
      console.error('Erro ao criar reset:', error)
      toast.error('Erro ao criar tokens de reset')
    } finally {
      setIsLoading(false)
    }
  }

  const handleIndividualReset = async (userId: string) => {
    if (!reason.trim()) {
      toast.error('Motivo é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'individual',
          userId,
          reason,
          expiresInHours
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Token de reset criado com sucesso')
        setReason('')
        loadActiveTokens()
      } else {
        toast.error(data.error || 'Erro ao criar token de reset')
      }
    } catch (error) {
      console.error('Erro ao criar reset:', error)
      toast.error('Erro ao criar token de reset')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado para a área de transferência')
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const invalidateToken = async (tokenId: string) => {
    try {
      const response = await fetch(`/api/admin/password-reset?tokenId=${tokenId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Token invalidado')
        loadActiveTokens()
      } else {
        toast.error('Erro ao invalidar token')
      }
    } catch (error) {
      console.error('Erro ao invalidar token:', error)
      toast.error('Erro ao invalidar token')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const isExpired = (expiresString: string) => {
    return new Date(expiresString) < new Date()
  }

  const sendResetEmails = async () => {
    if (selectedTokens.length === 0) {
      toast.error('Selecione pelo menos um token')
      return
    }

    setIsSendingEmails(true)

    try {
      const response = await fetch('/api/admin/send-reset-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenIds: selectedTokens,
          customMessage: customMessage.trim() || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setSelectedTokens([])
        setCustomMessage('')
      } else {
        toast.error(data.error || 'Erro ao enviar emails')
      }
    } catch (error) {
      console.error('Erro ao enviar emails:', error)
      toast.error('Erro ao enviar emails')
    } finally {
      setIsSendingEmails(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  }

  // Fallback visual caso o middleware falhe e o usuário não tenha permissão
  if (!session || !['ADMIN', 'SUPERVISOR'].includes((session.user as any)?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 font-outfit">Acesso Restrito</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md font-outfit">
          Você não tem permissão para acessar esta área ou sua sessão expirou.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/employee'} 
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
          >
            Ir para Área do Funcionário
          </button>
          <button 
            onClick={() => signIn()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Reset de Senhas</h1>
        </div>
        <p className="text-gray-600">
          Gerencie resets de senha para usuários do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criar Reset */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Criar Reset de Senha
          </h2>

          <div className="space-y-4">
            {/* Tipo de Reset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reset
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="individual"
                    checked={resetType === 'individual'}
                    onChange={(e) => setResetType(e.target.value as 'individual')}
                    className="mr-2"
                  />
                  <User className="h-4 w-4 mr-1" />
                  Individual
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="mass"
                    checked={resetType === 'mass'}
                    onChange={(e) => setResetType(e.target.value as 'mass')}
                    className="mr-2"
                  />
                  <Users className="h-4 w-4 mr-1" />
                  Em Massa
                </label>
              </div>
            </div>

            {/* Seleção de Usuários (apenas para individual) */}
            {resetType === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Usuários
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </p>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do Reset
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: Solicitação de segurança, senha comprometida, etc."
                required
              />
            </div>

            {/* Expiração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expira em (horas)
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 hora</option>
                <option value={6}>6 horas</option>
                <option value={12}>12 horas</option>
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={168}>7 dias</option>
              </select>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={resetType === 'mass' ? handleMassReset : () => {
                if (selectedUsers.length === 0) {
                  toast.error('Selecione pelo menos um usuário')
                  return
                }
                selectedUsers.forEach(userId => handleIndividualReset(userId))
              }}
              disabled={isLoading || !reason.trim() || (resetType === 'individual' && selectedUsers.length === 0)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {resetType === 'mass' ? 'Reset em Massa' : `Reset para ${selectedUsers.length} usuário(s)`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tokens Ativos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Tokens Ativos
            </h2>
            <button
              onClick={loadActiveTokens}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoadingTokens ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum token ativo</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeTokens.map((token) => (
                  <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={selectedTokens.includes(token.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTokens([...selectedTokens, token.id])
                            } else {
                              setSelectedTokens(selectedTokens.filter(id => id !== token.id))
                            }
                          }}
                          className="mr-3"
                          disabled={isExpired(token.expires)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium">{token.user.name}</span>
                            {isExpired(token.expires) && (
                              <XCircle className="h-4 w-4 ml-2 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{token.user.email}</p>
                          <p className="text-xs text-gray-500">
                            Criado: {formatDate(token.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expira: {formatDate(token.expires)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(token.resetUrl)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Copiar URL de reset"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => invalidateToken(token.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Invalidar token"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Envio de Emails */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Emails de Reset
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mensagem Personalizada (opcional)
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      placeholder="Ex: Por motivos de segurança..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {selectedTokens.length} token(s) selecionado(s)
                    </p>
                    <button
                      onClick={sendResetEmails}
                      disabled={isSendingEmails || selectedTokens.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSendingEmails ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Enviar Emails
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-gray-600">Usuários com Senha</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeTokens.filter(t => !isExpired(t.expires)).length}
              </p>
              <p className="text-gray-600">Tokens Válidos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeTokens.filter(t => isExpired(t.expires)).length}
              </p>
              <p className="text-gray-600">Tokens Expirados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
