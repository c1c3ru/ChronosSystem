import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndCreateMachines() {
    try {
        console.log('🔍 Verificando máquinas cadastradas...')

        // Verificar se existem máquinas ativas
        const activeMachines = await prisma.machine.findMany({
            where: { isActive: true }
        })

        console.log(`📊 Máquinas ativas encontradas: ${activeMachines.length}`)

        if (activeMachines.length === 0) {
            console.log('⚠️  Nenhuma máquina ativa encontrada!')
            console.log('🔧 Criando máquina padrão...')

            const defaultMachine = await prisma.machine.create({
                data: {
                    name: 'Terminal Principal',
                    location: 'Recepção - Térreo',
                    ipAddress: '192.168.1.100',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })

            console.log('✅ Máquina padrão criada com sucesso!')
            console.log('📋 Detalhes:', {
                id: defaultMachine.id,
                name: defaultMachine.name,
                location: defaultMachine.location,
                isActive: defaultMachine.isActive
            })
        } else {
            console.log('✅ Máquinas ativas já existem:')
            activeMachines.forEach((machine, index) => {
                console.log(`   ${index + 1}. ${machine.name} - ${machine.location} (ID: ${machine.id})`)
            })
        }

        // Verificar todas as máquinas (incluindo inativas)
        const allMachines = await prisma.machine.findMany()
        console.log(`\n📊 Total de máquinas no banco: ${allMachines.length}`)

        if (allMachines.length > activeMachines.length) {
            console.log('⚠️  Máquinas inativas:')
            const inactiveMachines = allMachines.filter(m => !m.isActive)
            inactiveMachines.forEach((machine, index) => {
                console.log(`   ${index + 1}. ${machine.name} - ${machine.location} (ID: ${machine.id})`)
            })
        }

    } catch (error) {
        console.error('❌ Erro ao verificar/criar máquinas:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

checkAndCreateMachines()
    .then(() => {
        console.log('\n✅ Verificação concluída!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error)
        process.exit(1)
    })
