import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserCache } from '@/lib/cache'
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from '@/lib/password-policy'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'EMPLOYEE']),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  emergencyContact: z.string().min(1, 'Contato de emergência é obrigatório'),
  emergencyPhone: z.string().min(1, 'Telefone de emergência é obrigatório'),
  department: z.string().optional(),
  siapeNumber: z.string().optional(),
  hasSiape: z.boolean().optional(),
  registrationNumber: z.string().optional(),
  startDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  contractType: z.string().optional(),
  weeklyHours: z.number().optional(),
})

// GET /api/users - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    // Create cache key based on query params
    const cacheKey = `page:${page}:limit:${limit}:search:${search}:role:${role}`

    // Try to get from cache
    const cachedData = await UserCache.getList(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        role ? { role } : {},
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          department: true,
          siapeNumber: true,
          registrationNumber: true,
          contractType: true,
          weeklyHours: true,
          shiftStartTime: true,
          shiftEndTime: true,
          profileComplete: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              attendanceRecords: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    const response = {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }

    // Cache the result
    await UserCache.setList(response.users, cacheKey)

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/users - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Validações específicas para SIAPE
    if (validatedData.hasSiape && validatedData.siapeNumber) {
      if (!/^\d{7}$/.test(validatedData.siapeNumber)) {
        return NextResponse.json(
          { error: 'Matrícula SIAPE deve ter exatamente 7 dígitos' },
          { status: 400 }
        )
      }
    }

    // Validações específicas para funcionários
    if (validatedData.role === 'EMPLOYEE') {
      if (!validatedData.department) {
        return NextResponse.json(
          { error: 'Departamento é obrigatório para funcionários' },
          { status: 400 }
        )
      }
      if (
        !validatedData.startDate ||
        !validatedData.contractStartDate ||
        !validatedData.contractEndDate
      ) {
        return NextResponse.json(
          { error: 'Datas são obrigatórias para funcionários' },
          { status: 400 }
        )
      }
      if (!validatedData.contractType) {
        return NextResponse.json(
          { error: 'Tipo de contrato é obrigatório para funcionários' },
          { status: 400 }
        )
      }

      // Validar se data de fim é posterior à data de início
      if (validatedData.contractStartDate && validatedData.contractEndDate) {
        if (new Date(validatedData.contractEndDate) <= new Date(validatedData.contractStartDate)) {
          return NextResponse.json(
            { error: 'Data de fim deve ser posterior à data de início' },
            { status: 400 }
          )
        }
      }
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, BCRYPT_SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone,
        address: validatedData.address,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        emergencyContact: validatedData.emergencyContact,
        emergencyPhone: validatedData.emergencyPhone,
        department: validatedData.department,
        siapeNumber: validatedData.siapeNumber,
        registrationNumber: validatedData.registrationNumber,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        contractStartDate: validatedData.contractStartDate
          ? new Date(validatedData.contractStartDate)
          : null,
        contractEndDate: validatedData.contractEndDate
          ? new Date(validatedData.contractEndDate)
          : null,
        contractType: validatedData.contractType,
        weeklyHours: validatedData.weeklyHours,
        profileComplete: true, // Admin já preenche tudo
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER',
        resource: 'USER',
        details: `Usuário criado: ${user.email} (${user.role})`,
      },
    })

    // Invalidate user cache
    await UserCache.invalidateAll()

    return NextResponse.json(user, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
