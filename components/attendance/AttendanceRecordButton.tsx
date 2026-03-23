'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, AlertCircle, ArrowRightLeft, Loader2, Fingerprint } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AttendanceRecordButtonProps {
  onSuccess?: () => void
}

export function AttendanceRecordButton({ onSuccess }: AttendanceRecordButtonProps) {
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [suggestedType, setSuggestedType] = useState<'ENTRY' | 'EXIT' | null>(null)
  const [reason, setReason] = useState('')
  const [countdown, setCountdown] = useState(10)
  const [isPaused, setIsPaused] = useState(true)
  const [isDone, setIsDone] = useState(false)

  // Buscar sugestão inicial
  const fetchSuggestion = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/record')
      if (!res.ok) throw new Error('Erro ao buscar sugestão')
      const data = await res.json()
      
      setSuggestedType(data.suggestion.type)
      setReason(data.suggestion.reason)
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível obter uma sugestão automática')
    } finally {
      setInitializing(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestion()
  }, [fetchSuggestion])

  // Lógica do Countdown
  useEffect(() => {
    if (initializing || isPaused || isDone || !suggestedType) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRecord()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [initializing, isPaused, isDone, suggestedType])

  const handleRecord = async (forcedType?: 'ENTRY' | 'EXIT') => {
    if (loading || isDone) return
    
    setLoading(true)
    setIsPaused(true)

    const typeToUse = forcedType || suggestedType

    try {
      const res = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: typeToUse })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao registrar ponto')
      }

      setIsDone(true)
      toast.success(`Registro de ${typeToUse === 'ENTRY' ? 'Entrada' : 'Saída'} realizado com sucesso!`)
      
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message)
      setIsPaused(false) // Permitir tentar novamente
    } finally {
      setLoading(false)
    }
  }

  const toggleType = () => {
    setSuggestedType(prev => prev === 'ENTRY' ? 'EXIT' : 'ENTRY')
    setReason('Alterado manualmente pelo usuário')
    setIsPaused(true)
  }

  if (initializing) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[300px] border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Analisando contexto para registro...</p>
      </Card>
    )
  }

  const isEntry = suggestedType === 'ENTRY'

  return (
    <Card className="overflow-hidden border-none bg-background shadow-2xl">
      <div className="p-6 md:p-8 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-6 relative">
                {/* SVG Progress Circle Background */}
                <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-muted/20 fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={cn(
                      "fill-none transition-colors duration-500",
                      isEntry ? "stroke-emerald-500" : "stroke-rose-500"
                    )}
                    strokeWidth="8"
                    strokeDasharray="100 100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: isPaused ? 0 : (10 - countdown) * 10 }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Button */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRecord()}
                    disabled={loading}
                    className={cn(
                      "w-36 h-36 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-500 text-white relative overflow-hidden group",
                      isEntry 
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-500/30" 
                        : "bg-gradient-to-br from-rose-500 to-orange-600 hover:shadow-rose-500/30"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {loading ? (
                      <Loader2 className="h-10 w-10 animate-spin" />
                    ) : (
                      <>
                        <Fingerprint className="h-12 w-12 mb-2" />
                        <span className="font-bold text-lg tracking-tight">
                          {isEntry ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                        {!isPaused && (
                          <span className="text-xs font-medium opacity-80">
                            em {countdown}s
                          </span>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-semibold tracking-tight uppercase opacity-90">
                  Registrar {isEntry ? 'Entrada' : 'Saída'}?
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-1.5 px-3 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{reason}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                <Button 
                  variant="outline" 
                  onClick={toggleType}
                  className="gap-2 border-muted-foreground/20"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Alternar
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setIsPaused(!isPaused)}
                  className="gap-2"
                >
                  {isPaused ? 'Retomar Auto' : 'Pausar Auto'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sucesso!</h2>
              <p className="text-muted-foreground mb-8">
                Seu registro foi processado e salvo no sistema.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Fazer novo registro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sugestões inteligentes ao fundo */}
      {!isDone && !isPaused && (
        <div className="bg-muted/30 px-6 py-4 flex items-center gap-3 border-t">
          <AlertCircle className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground italic">
            O sistema detectou seu contexto atual. O registro será feito automaticamente para economizar seu tempo.
          </p>
        </div>
      )}
    </Card>
  )
}
