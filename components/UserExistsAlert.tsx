'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, User, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UserData {
  id: string
  email: string
  name: string
  role: string
  profileComplete: boolean
  createdAt: string
  updatedAt: string
}

interface UserExistsAlertProps {
  userData: UserData
  onContinue?: () => void
  onCancel?: () => void
  showActions?: boolean
}

export function UserExistsAlert({
  userData,
  onContinue,
  onCancel,
  showActions = true,
}: UserExistsAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'SUPERVISOR':
        return 'Supervisor'
      case 'EMPLOYEE':
        return 'Funcionário'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-error-400'
      case 'SUPERVISOR':
        return 'text-warning-400'
      case 'EMPLOYEE':
        return 'text-info-400'
      default:
        return 'text-neutral-400'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          {userData.profileComplete ? (
            <CheckCircle className="h-6 w-6 text-success-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-warning-400" />
          )}
          <h3 className="text-lg font-semibold text-foreground">
            {userData.profileComplete ? 'Usuário Já Cadastrado' : 'Cadastro Incompleto'}
          </h3>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-muted-foreground text-sm mb-3">
            {userData.profileComplete
              ? 'Este usuário já possui cadastro completo no sistema.'
              : 'Este usuário já existe mas precisa completar o cadastro.'}
          </p>
        </div>

        {/* User Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-foreground font-medium">{userData.name}</p>
              <p className="text-muted-foreground text-sm">{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-sm">Nível de Acesso</p>
              <p className={`font-medium ${getRoleColor(userData.role)}`}>
                {getRoleLabel(userData.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-sm">Cadastrado em</p>
              <p className="text-muted-foreground text-sm">{formatDate(userData.createdAt)}</p>
            </div>
          </div>

          {userData.updatedAt !== userData.createdAt && (
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Última atualização</p>
                <p className="text-muted-foreground text-sm">{formatDate(userData.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              userData.profileComplete
                ? 'bg-success-900/30 text-success-400 border border-success-500/30'
                : 'bg-warning-900/30 text-warning-400 border border-warning-500/30'
            }`}
          >
            {userData.profileComplete ? '✅ Perfil Completo' : '⚠️ Perfil Incompleto'}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3">
            {userData.profileComplete ? (
              <>
                <Button
                  onClick={() => {
                    setIsVisible(false)
                    onContinue?.()
                  }}
                  className="flex-1"
                >
                  Fazer Login
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsVisible(false)
                    onCancel?.()
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsVisible(false)
                    onContinue?.()
                  }}
                  className="flex-1"
                >
                  Completar Cadastro
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsVisible(false)
                    onCancel?.()
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        )}

        {/* Close button if no actions */}
        {!showActions && (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsVisible(false)} size="sm">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
