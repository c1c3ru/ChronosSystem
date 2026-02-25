import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('user123', 10)
    const employee = await prisma.user.create({
        data: {
            name: 'Test Employee',
            email: 'testemployee@example.com',
            password: hashedPassword,
            role: 'EMPLOYEE',
            profileComplete: true,
            contractType: 'ESTAGIO_20H',
            weeklyHours: 20,
            dailyHours: 4,
            shift: 'MORNING',
            shiftStartTime: '08:00',
            shiftEndTime: '12:00',
            workingDaysPerWeek: 5,
        },
    })
    console.log('Employee created:', employee.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
