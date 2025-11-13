'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  calculateInternshipProgress, 
  getInternshipMilestones, 
  formatDate, 
  formatDuration,
  type InternshipProgress 
} from '@/lib/internship-calculator'

interface InternshipTimelineProps {
  startDate: string
  weeklyHours: number
  completedHours: number
  contractType: string
}

export default function InternshipTimeline({ 
  startDate, 
  weeklyHours, 
  completedHours, 
  contractType 
}: InternshipTimelineProps) {
  const [progress, setProgress] = useState<InternshipProgress | null>(null)
  const [milestones, setMilestones] = useState<any[]>([])

  useEffect(() => {
    if (startDate && weeklyHours && contractType?.startsWith('ESTAGIO')) {
      const progressData = calculateInternshipProgress(
        new Date(startDate),
        weeklyHours,
        completedHours,
        200
      )
      
      const milestonesData = getInternshipMilestones(
        new Date(startDate),
        progressData.actualEndDate || progressData.estimatedEndDate,
        200
      )
      
      setProgress(progressData)
      setMilestones(milestonesData)
    }
  }, [startDate, weeklyHours, completedHours, contractType])

  if (!progress || !contractType?.startsWith('ESTAGIO')) {
    return null
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Progresso do Estágio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de Progresso Principal */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-300">
              {progress.completedHours}h de {progress.totalRequiredHours}h
            </span>
            <span className="text-sm font-medium text-primary">
              {progress.progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                progress.isOnTrack 
                  ? 'bg-gradient-to-r from-green-500 to-primary' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status e Alertas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Status Atual */}
          <div className={`p-4 rounded-lg border ${
            progress.isOnTrack 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-yellow-900/20 border-yellow-500/30'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {progress.isOnTrack ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              )}
              <span className={`text-sm font-medium ${
                progress.isOnTrack ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {progress.isOnTrack ? 'No Cronograma' : 'Atenção Necessária'}
              </span>
            </div>
            <p className={`text-xs ${
              progress.isOnTrack ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {progress.isOnTrack 
                ? 'Você está cumprindo o cronograma previsto'
                : `${progress.delayDays ? `Atraso de ${progress.delayDays} dias úteis` : 'Verifique sua frequência'}`
              }
            </p>
          </div>

          {/* Tempo Restante */}
          <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Tempo Restante</span>
            </div>
            <p className="text-xs text-blue-300">
              {progress.daysRemaining > 0 
                ? `${formatDuration(progress.daysRemaining)} (${progress.remainingHours}h)`
                : 'Estágio concluído!'
              }
            </p>
          </div>
        </div>

        {/* Linha do Tempo de Marcos */}
        <div>
          <h4 className="text-sm font-medium text-neutral-300 mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Marcos do Estágio
          </h4>
          
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const isCompleted = progress.completedHours >= milestone.hours
              const isCurrent = !isCompleted && (index === 0 || progress.completedHours >= milestones[index - 1]?.hours)
              
              return (
                <div key={milestone.percentage} className="flex items-center space-x-4">
                  {/* Indicador */}
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : isCurrent
                        ? 'bg-primary border-primary animate-pulse'
                        : 'bg-transparent border-neutral-500'
                  }`}>
                    {isCompleted && (
                      <CheckCircle className="w-3 h-3 text-white m-0.5" />
                    )}
                  </div>
                  
                  {/* Linha conectora */}
                  {index < milestones.length - 1 && (
                    <div className={`absolute w-0.5 h-6 ml-1.5 mt-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-neutral-600'
                    }`} />
                  )}
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-green-400' 
                          : isCurrent 
                            ? 'text-primary' 
                            : 'text-neutral-400'
                      }`}>
                        {milestone.label}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {milestone.hours}h
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Previsto para {formatDate(milestone.estimatedDate)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Datas Importantes */}
        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-neutral-700">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-400">Data de Início</span>
            </div>
            <p className="text-sm text-white">{formatDate(new Date(startDate))}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-400">
                {progress.delayDays ? 'Nova Previsão' : 'Previsão de Término'}
              </span>
            </div>
            <p className={`text-sm ${progress.delayDays ? 'text-yellow-400' : 'text-white'}`}>
              {formatDate(progress.actualEndDate || progress.estimatedEndDate)}
            </p>
            {progress.delayDays && (
              <p className="text-xs text-yellow-300 mt-1">
                {formatDuration(progress.delayDays)} de atraso
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
