import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const machines = await prisma.machine.findMany()
  console.log('Machines:', machines)

  const qrEvents = await prisma.qrEvent.count()
  console.log('QR Events count:', qrEvents)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
