import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleApiError } from '@/lib/error-handler'
import { requireAuth, requireAdmin } from '@/lib/auth-helpers'
import { MachineCache } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createMachineSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  location: z.string().min(2, 'Localização deve ter pelo menos 2 caracteres'),
  isActive: z.boolean().optional().default(true),
})

/**
 * GET /api/machines - List all machines
 *
 * Lists all point-of-attendance machines in the system.
 * Supports filtering by active status.
 *
 * @param request - Next.js request object
 * @returns JSON array of machines with attendance statistics
 *
 * @example
 * GET /api/machines?active=true
 * Response: [{ id, name, location, isActive, _count: { attendanceRecords, qrEvents } }]
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    requireAuth(session)

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    // Try to get from cache for active machines (most common query)
    if (activeOnly) {
      const cachedMachines = await MachineCache.getActive()
      if (cachedMachines) {
        return NextResponse.json(cachedMachines)
      }
    }

    const where = activeOnly ? { isActive: true } : {}

    const machines = await prisma.machine.findMany({
      where,
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendanceRecords: true,
            qrEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Cache active machines
    if (activeOnly) {
      await MachineCache.setActive(machines)
    }

    return NextResponse.json(machines)
  } catch (error) {
    return handleApiError(error, { route: '/api/machines', method: 'GET' })
  }
}

/**
 * POST /api/machines - Create a new machine
 *
 * Creates a new point-of-attendance machine.
 * Requires ADMIN or SUPERVISOR role.
 *
 * @param request - Next.js request object with machine data in body
 * @returns JSON object of created machine
 *
 * @example
 * POST /api/machines
 * Body: { name: "Recepção", location: "Térreo - Entrada Principal", isActive: true }
 * Response: { id, name, location, isActive, createdAt }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authenticatedSession = requireAdmin(session)

    const body = await request.json()
    const validatedData = createMachineSchema.parse(body)

    const machine = await prisma.machine.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authenticatedSession.user.id,
        action: 'CREATE_MACHINE',
        resource: 'MACHINE',
        details: `Máquina criada: ${machine.name} - ${machine.location}`,
      },
    })

    // Invalidate machine cache
    await MachineCache.invalidateAll()

    return NextResponse.json(machine, { status: 201 })
  } catch (error) {
    return handleApiError(error, {
      route: '/api/machines',
      method: 'POST',
    })
  }
}
