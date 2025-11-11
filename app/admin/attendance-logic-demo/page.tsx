'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react'

// Simulação da lógica (importaria da lib em produção)
interface TestScenario {
  id: string
  name: string
  description: string
  currentTime: string
  lastRecord: { type: 'ENTRY' | 'EXIT', time: string } | null
  expectedResult: 'ENTRY' | 'EXIT'
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

const testScenarios: TestScenario[] = [
  {
    id: '1',
    name: 'Chegada Normal',
    description: 'Funcionário chegando no horário normal de trabalho',
    currentTime: '08:15',
    lastRecord: null,
    expectedResult: 'ENTRY',
    reason: 'Primeiro registro do dia no horário de trabalho',
    confidence: 'high'
  },
  {
    id: '2', 
    name: 'Saída para Almoço',
    description: 'Funcionário saindo para almoço após trabalhar manhã toda',
    currentTime: '12:00',
    lastRecord: { type: 'ENTRY', time: '08:15' },
    expectedResult: 'EXIT',
    reason: 'Saída para almoço (horário esperado)',
    confidence: 'high'
  },
  {
    id: '3',
    name: 'Retorno do Almoço', 
    description: 'Funcionário voltando do almoço',
    currentTime: '13:00',
    lastRecord: { type: 'EXIT', time: '12:00' },
    expectedResult: 'ENTRY',
    reason: 'Retorno do almoço',
    confidence: 'high'
  },
  {
    id: '4',
    name: 'Saída Final',
    description: 'Funcionário saindo no final do expediente',
    currentTime: '17:00',
    lastRecord: { type: 'ENTRY', time: '13:00' },
    expectedResult: 'EXIT',
    reason: 'Saída do expediente (horário normal)',
    confidence: 'high'
  },
  {
    id: '5',
    name: 'Chegada Atrasada',
    description: 'Funcionário chegando atrasado',
    currentTime: '09:30',
    lastRecord: null,
    expectedResult: 'ENTRY',
    reason: 'Entrada com atraso (1h30min)',
    confidence: 'high'
  },
  {
    id: '6',
    name: 'Saída Antecipada',
    description: 'Funcionário saindo antes do horário',
    currentTime: '15:30',
    lastRecord: { type: 'ENTRY', time: '13:00' },
    expectedResult: 'EXIT',
    reason: 'Saída antecipada (possível emergência)',
    confidence: 'medium'
  },
  {
    id: '7',
    name: 'Trabalho Noturno',
    description: 'Registro durante período noturno',
    currentTime: '22:00',
    lastRecord: { type: 'EXIT', time: '17:00' },
    expectedResult: 'ENTRY',
    reason: 'Entrada noturna (plantão/hora extra)',
    confidence: 'low'
  },
  {
    id: '8',
    name: 'Novo Dia',
    description: 'Primeiro registro de um novo dia',
    currentTime: '08:00',
    lastRecord: { type: 'EXIT', time: '17:00 (ontem)' },
    expectedResult: 'ENTRY',
    reason: 'Novo dia de trabalho',
    confidence: 'high'
  }
]

export default function AttendanceLogicDemo() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null)
  const [showAllResults, setShowAllResults] = useState(false)

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20' 
      case 'low': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <Info className="h-4 w-4" />
      case 'low': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary/20 rounded-xl p-3">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Demonstração: Lógica Inteligente de Ponto
              </h1>
              <p className="text-neutral-400">
                Como o sistema identifica automaticamente se é entrada ou saída
              </p>
            </div>
          </div>
        </div>

        {/* Explicação */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Como Funciona a Detecção Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fatores Analisados:</h3>
                <ul className="space-y-2 text-neutral-300">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Horário atual:</strong> Manhã, almoço, tarde, noite</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Último registro:</strong> Tipo e quando foi feito</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Tempo decorrido:</strong> Intervalo desde último registro</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Contexto temporal:</strong> Novo dia, fim de semana</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Níveis de Confiança:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-green-400 bg-green-500/20">
                      Alta
                    </span>
                    <span className="text-neutral-300">Situação clara e esperada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-500/20">
                      Média
                    </span>
                    <span className="text-neutral-300">Situação provável, mas atípica</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-red-400 bg-red-500/20">
                      Baixa
                    </span>
                    <span className="text-neutral-300">Situação suspeita, requer atenção</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cenários de Teste */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Lista de Cenários */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-white">Cenários de Teste</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant={showAllResults ? "ghost" : "primary"}
                  onClick={() => setShowAllResults(false)}
                >
                  Interativo
                </Button>
                <Button 
                  size="sm" 
                  variant={showAllResults ? "primary" : "ghost"}
                  onClick={() => setShowAllResults(true)}
                >
                  Ver Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedScenario?.id === scenario.id
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{scenario.name}</h3>
                        <p className="text-sm text-neutral-400 mb-2">{scenario.description}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-neutral-500">
                            Horário: <span className="text-white">{scenario.currentTime}</span>
                          </span>
                          {scenario.lastRecord && (
                            <span className="text-neutral-500">
                              Último: <span className="text-white">{scenario.lastRecord.type} {scenario.lastRecord.time}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {showAllResults && (
                        <div className="ml-4 text-right">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            scenario.expectedResult === 'ENTRY' 
                              ? 'text-green-400 bg-green-500/20' 
                              : 'text-orange-400 bg-orange-500/20'
                          }`}>
                            {scenario.expectedResult === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium mt-1 ${getConfidenceColor(scenario.confidence)}`}>
                            {scenario.confidence.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Análise */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-white">Resultado da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedScenario ? (
                <div className="space-y-6">
                  {/* Cenário Selecionado */}
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{selectedScenario.name}</h3>
                    <p className="text-neutral-400 text-sm mb-4">{selectedScenario.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Horário Atual:</span>
                        <div className="text-white font-medium">{selectedScenario.currentTime}</div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Último Registro:</span>
                        <div className="text-white font-medium">
                          {selectedScenario.lastRecord 
                            ? `${selectedScenario.lastRecord.type} ${selectedScenario.lastRecord.time}`
                            : 'Nenhum'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resultado */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Decisão do Sistema</h3>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedScenario.confidence)}`}>
                        {getConfidenceIcon(selectedScenario.confidence)}
                        <span>{selectedScenario.confidence.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-lg font-bold ${
                        selectedScenario.expectedResult === 'ENTRY' 
                          ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                          : 'text-orange-400 bg-orange-500/20 border border-orange-500/30'
                      }`}>
                        <Clock className="h-5 w-5" />
                        <span>{selectedScenario.expectedResult === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-neutral-300 text-sm">
                        <strong>Motivo:</strong> {selectedScenario.reason}
                      </p>
                    </div>
                  </div>

                  {/* Explicação Detalhada */}
                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Como chegamos a esta decisão:</h4>
                    <ul className="space-y-2 text-sm text-neutral-300">
                      <li>• Analisamos o horário atual ({selectedScenario.currentTime})</li>
                      <li>• Verificamos o último registro ({selectedScenario.lastRecord ? `${selectedScenario.lastRecord.type} às ${selectedScenario.lastRecord.time}` : 'nenhum'})</li>
                      <li>• Aplicamos regras de contexto temporal</li>
                      <li>• Determinamos: <strong>{selectedScenario.reason}</strong></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">
                    Selecione um cenário para ver como o sistema analisa e decide
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
