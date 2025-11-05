import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports/download - Download de relatórios

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const period = parseInt(searchParams.get('period') || '30')
    const userFilter = searchParams.get('user') || 'ALL'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Filtro de usuários
    let userWhere = {}
    if (userFilter !== 'ALL') {
      userWhere = { role: userFilter }
    }

    // Buscar dados para o relatório
    const [users, attendanceRecords] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      
      prisma.attendanceRecord.findMany({
        where: {
          timestamp: {
            gte: startDate
          },
          ...(userFilter !== 'ALL' && {
            user: { role: userFilter }
          })
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          machine: {
            select: {
              name: true,
              location: true
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      })
    ])

    if (format === 'csv') {
      return generateCSVReport(attendanceRecords, users, period)
    } else if (format === 'pdf') {
      return generatePDFReport(attendanceRecords, users, period)
    } else {
      return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function generateCSVReport(records: any[], users: any[], period: number) {
  // Cabeçalho do CSV
  const headers = [
    'Data/Hora',
    'Usuário',
    'Email',
    'Role',
    'Tipo',
    'Máquina',
    'Localização'
  ]

  // Dados do CSV
  const csvData = records.map(record => [
    new Date(record.timestamp).toLocaleString('pt-BR'),
    record.user?.name || 'N/A',
    record.user?.email || 'N/A',
    record.user?.role || 'N/A',
    record.type === 'ENTRY' ? 'Entrada' : 'Saída',
    record.machine?.name || 'N/A',
    record.machine?.location || 'N/A'
  ])

  // Construir CSV
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Adicionar BOM para UTF-8
  const bom = '\uFEFF'
  const csvWithBom = bom + csvContent

  return new NextResponse(csvWithBom, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-ponto-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}

function generatePDFReport(records: any[], users: any[], period: number) {
  // Para PDF, vamos gerar um HTML simples que pode ser convertido
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Ponto - Chronos System</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                font-size: 12px;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 2px solid #22c55e;
                padding-bottom: 20px;
            }
            .header h1 { 
                color: #22c55e; 
                margin: 0;
                font-size: 24px;
            }
            .header p { 
                color: #666; 
                margin: 5px 0;
            }
            .summary {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .summary h3 {
                margin-top: 0;
                color: #333;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
            }
            th { 
                background-color: #22c55e; 
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) { 
                background-color: #f9f9f9; 
            }
            .entry { color: #22c55e; font-weight: bold; }
            .exit { color: #ef4444; font-weight: bold; }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 10px;
                border-top: 1px solid #ddd;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Chronos System</h1>
            <p>Relatório de Registros de Ponto</p>
            <p>Período: Últimos ${period} dias | Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="summary">
            <h3>Resumo</h3>
            <p><strong>Total de Usuários:</strong> ${users.length}</p>
            <p><strong>Total de Registros:</strong> ${records.length}</p>
            <p><strong>Registros de Entrada:</strong> ${records.filter(r => r.type === 'ENTRY').length}</p>
            <p><strong>Registros de Saída:</strong> ${records.filter(r => r.type === 'EXIT').length}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tipo</th>
                    <th>Máquina</th>
                    <th>Localização</th>
                </tr>
            </thead>
            <tbody>
                ${records.map(record => `
                    <tr>
                        <td>${new Date(record.timestamp).toLocaleString('pt-BR')}</td>
                        <td>${record.user?.name || 'N/A'}</td>
                        <td>${record.user?.email || 'N/A'}</td>
                        <td>${record.user?.role || 'N/A'}</td>
                        <td class="${record.type.toLowerCase()}">
                            ${record.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                        </td>
                        <td>${record.machine?.name || 'N/A'}</td>
                        <td>${record.machine?.location || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo Chronos System</p>
            <p>© ${new Date().getFullYear()} - Sistema de Registro de Ponto Eletrônico</p>
        </div>
    </body>
    </html>
  `

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-ponto-${new Date().toISOString().split('T')[0]}.html"`
    }
  })
}
