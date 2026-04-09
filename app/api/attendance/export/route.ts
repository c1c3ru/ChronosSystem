import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const sessao = await getServerSession(authOptions)

    if (!sessao) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const dataInicial = searchParams.get('dateFrom')
    const dataFinal = searchParams.get('dateTo')
    const tipo = searchParams.get('type')

    // Construir filtro de data
    const filtroData: any = {}
    if (dataInicial) {
      filtroData.gte = new Date(dataInicial)
    }
    if (dataFinal) {
      const dataFim = new Date(dataFinal)
      dataFim.setHours(23, 59, 59, 999)
      filtroData.lte = dataFim
    }

    // Construir filtro de tipo
    const filtroTipo = tipo && tipo !== 'ALL' ? tipo : undefined

    // Buscar todos os registros do usuário
    const registros = await prisma.attendanceRecord.findMany({
      where: {
        userId: sessao.user.id,
        ...(Object.keys(filtroData).length > 0 && { timestamp: filtroData }),
        ...(filtroTipo && { type: filtroTipo }),
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Cabeçalho do CSV
    const colunas = ['Data', 'Hora', 'Tipo', 'Máquina', 'Localização']

    // Formatar linhas do CSV
    const linhas = registros.map((registro) => {
      const data = format(new Date(registro.timestamp), 'dd/MM/yyyy')
      const hora = format(new Date(registro.timestamp), 'HH:mm:ss')
      const tipoTraduzido = registro.type === 'ENTRY' ? 'Entrada' : 'Saída'

      return [data, hora, tipoTraduzido, registro.machine.name, registro.machine.location]
        .map((campo) => `"${campo}"`)
        .join(',')
    })

    const csvConteudo = [colunas.join(','), ...linhas].join('\n')

    // Definir nome do arquivo
    const nomeArquivo = `historico_ponto_${format(new Date(), 'yyyy-MM-dd')}.csv`

    // Retornar o CSV com os headers apropriados para download
    return new Response(csvConteudo, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (erro: any) {
    console.error('❌ [API Export] Erro ao exportar dados:', erro)
    return NextResponse.json({ erro: 'Erro ao exportar dados de registros' }, { status: 500 })
  }
}
