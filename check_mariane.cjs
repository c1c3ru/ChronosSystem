const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Mariane
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'Mariane',
        mode: 'insensitive'
      }
    }
  });

  if (users.length === 0) {
    console.log("No user found with name Mariane.");
    return;
  }

  for (const user of users) {
    console.log(`\nUser: ${user.name} (${user.email}) - ID: ${user.id}`);
    
    // Check attendance records for the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: threeDaysAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log(`--- Attendance Records ---`);
    if (records.length === 0) {
      console.log("No attendance records in the last 3 days.");
    } else {
      records.forEach(r => {
        console.log(`[${r.timestamp.toLocaleString()}] ${r.type} (Machine: ${r.machineId})`);
      });
    }

    // Check AuditLogs for any errors or actions related to her
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: threeDaysAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log(`--- Audit Logs ---`);
    if (auditLogs.length === 0) {
      console.log("No audit logs in the last 3 days.");
    } else {
      auditLogs.forEach(l => {
        console.log(`[${l.timestamp.toLocaleString()}] ${l.action} - ${l.resource} - ${l.details}`);
      });
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
