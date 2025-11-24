import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAndActivateMachines() {
    try {
        console.log('🔍 Listando todas as máquinas...\n')

        // Buscar todas as máquinas
        const allMachines = await prisma.machine.findMany({
            orderBy: { createdAt: 'asc' }
        })

        if (allMachines.length === 0) {
            console.log('⚠️  Nenhuma máquina encontrada no banco de dados!')
            return
        }

        console.log(`📊 Total de máquinas: ${allMachines.length}\n`)

        // Listar todas as máquinas
        allMachines.forEach((machine, index) => {
            const status = machine.isActive ? '✅ ATIVA' : '❌ INATIVA'
            console.log(`${index + 1}. ${status}`)
            console.log(`   ID: ${machine.id}`)
            console.log(`   Nome: ${machine.name}`)
            console.log(`   Localização: ${machine.location}`)
            console.log(`   IP: ${machine.ipAddress || 'Não definido'}`)
            console.log(`   Criada em: ${machine.createdAt.toLocaleString('pt-BR')}`)
            console.log('')
        })

        // Verificar quantas estão ativas
        const activeMachines = allMachines.filter(m => m.isActive)
        const inactiveMachines = allMachines.filter(m => !m.isActive)

        console.log(`✅ Máquinas ativas: ${activeMachines.length}`)
        console.log(`❌ Máquinas inativas: ${inactiveMachines.length}\n`)

        // Se houver máquinas inativas, ativar todas
        if (inactiveMachines.length > 0) {
            console.log('🔧 Ativando todas as máquinas inativas...\n')

            for (const machine of inactiveMachines) {
                await prisma.machine.update({
                    where: { id: machine.id },
                    data: { isActive: true }
                })
                console.log(`✅ Máquina "${machine.name}" ativada!`)
            }

            console.log('\n✅ Todas as máquinas foram ativadas com sucesso!')
        } else {
            console.log('✅ Todas as máquinas já estão ativas!')
        }

    } catch (error) {
        console.error('❌ Erro ao listar/ativar máquinas:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

listAndActivateMachines()
    .then(() => {
        console.log('\n✅ Operação concluída!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error)
        process.exit(1)
    })
