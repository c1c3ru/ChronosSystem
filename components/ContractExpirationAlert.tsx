'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, FileText, X } from 'lucide-react'

interface ContractExpirationAlertProps {
  contractEndDate?: Date | string
  userName?: string
  onDismiss?: () => void
}

export function ContractExpirationAlert({
  contractEndDate,
  userName = 'Usuário',
  onDismiss,
}: ContractExpirationAlertProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [daysUntilExpiration, setDaysUntilExpiration] = useState(0)
  const [alertType, setAlertType] = useState<'warning' | 'urgent' | 'critical'>('warning')

  useEffect(() => {
    if (!contractEndDate) return

    const endDate = new Date(contractEndDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    setDaysUntilExpiration(diffDays)

    // Mostrar alerta apenas se estiver próximo do fim
    if (diffDays <= 60 && diffDays > 0) {
      setIsVisible(true)

      // Definir tipo de alerta baseado nos dias restantes
      if (diffDays <= 15) {
        setAlertType('critical')
      } else if (diffDays <= 30) {
        setAlertType('urgent')
      } else {
        setAlertType('warning')
      }
    }
  }, [contractEndDate])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || daysUntilExpiration <= 0) {
    return null
  }

  const getAlertStyles = () => {
    switch (alertType) {
      case 'critical':
        return {
          container: 'bg-red-900/30 border-red-500/50 text-red-100',
          icon: 'text-red-400',
          title: 'text-red-300',
          button: 'bg-red-600 hover:bg-red-700',
        }
      case 'urgent':
        return {
          container: 'bg-orange-900/30 border-orange-500/50 text-orange-100',
          icon: 'text-orange-400',
          title: 'text-orange-300',
          button: 'bg-orange-600 hover:bg-orange-700',
        }
      case 'warning':
        return {
          container: 'bg-yellow-900/30 border-yellow-500/50 text-yellow-100',
          icon: 'text-yellow-400',
          title: 'text-yellow-300',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        }
    }
  }

  const styles = getAlertStyles()

  const getAlertTitle = () => {
    switch (alertType) {
      case 'critical':
        return '🚨 Contrato Expira em Breve!'
      case 'urgent':
        return '⚠️ Atenção: Contrato Próximo do Fim'
      case 'warning':
        return '📅 Lembrete: Renovação de Contrato'
    }
  }

  const getDocumentationList = () => {
    return [
      'Relatório de atividades desenvolvidas',
      'Avaliação de desempenho',
      'Declaração de cumprimento de carga horária',
      'Termo de compromisso (se renovação)',
      'Documentos pessoais atualizados',
      'Comprovante de matrícula (se estudante)',
    ]
  }

  return (
    <div className={`rounded-lg border p-4 mb-6 ${styles.container}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertTriangle className={`h-6 w-6 mt-0.5 ${styles.icon}`} />
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${styles.title}`}>{getAlertTitle()}</h3>

            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className={`h-4 w-4 ${styles.icon}`} />
                <span className="text-sm">
                  Seu contrato expira em <strong>{daysUntilExpiration} dia(s)</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  Data de término:{' '}
                  <strong>{new Date(contractEndDate!).toLocaleDateString('pt-BR')}</strong>
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className={`h-4 w-4 ${styles.icon}`} />
                <span className="text-sm font-medium">Documentação necessária para renovação:</span>
              </div>

              <ul className="text-xs space-y-1 ml-6">
                {getDocumentationList().map((doc, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-3 bg-black/20 rounded border border-current/20">
              <p className="text-xs">
                <strong>💡 Dica:</strong> Entre em contato com seu supervisor ou RH com antecedência
                para iniciar o processo de renovação e evitar interrupções.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded text-xs font-medium text-white ${styles.button} transition-colors`}
                onClick={() =>
                  window.open(
                    'mailto:rh@instituicao.edu.br?subject=Renovação de Contrato',
                    '_blank'
                  )
                }
              >
                📧 Contatar RH
              </button>

              <button
                className={`px-3 py-1 rounded text-xs font-medium text-white ${styles.button} transition-colors`}
                onClick={() => window.print()}
              >
                🖨️ Imprimir Lembrete
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-current/60 hover:text-current transition-colors p-1"
          title="Dispensar alerta"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook para verificar contratos próximos do fim
export function useContractExpiration(contractEndDate?: Date | string) {
  const [shouldShowAlert, setShouldShowAlert] = useState(false)
  const [daysUntilExpiration, setDaysUntilExpiration] = useState(0)

  useEffect(() => {
    if (!contractEndDate) return

    const endDate = new Date(contractEndDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    setDaysUntilExpiration(diffDays)
    setShouldShowAlert(diffDays <= 60 && diffDays > 0)
  }, [contractEndDate])

  return {
    shouldShowAlert,
    daysUntilExpiration,
  }
}
