
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const machines = await prisma.machine.findMany()
  console.log('Machines in DB:', JSON.stringify(machines, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
