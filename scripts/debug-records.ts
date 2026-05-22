import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      attendanceRecords: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
  })

  console.log('--- DEBUG ATTENDANCE RECORDS ---')
  for (const user of users) {
    if (user.attendanceRecords.length === 0) continue
    console.log(`User: ${user.name} (${user.email}) ID: ${user.id}`)
    for (const record of user.attendanceRecords) {
      console.log(`  - ${record.type} at ${record.timestamp.toISOString()}`)
    }
  }
}

main().finally(() => prisma.$disconnect())
