import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJustificationDto } from './dto/create-justification.dto';
import { UpdateJustificationDto } from './dto/update-justification.dto';
import { ReviewJustificationDto } from './dto/review-justification.dto';
import { JustificationStatus } from '@prisma/client';

export interface FindAllFilters {
  status?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class JustificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJustificationDto & { userId: string }) {
    const category = data.category || 'FALTA';
    
    // Verificar se já existe justificativa para a mesma data e categoria
    const existing = await this.prisma.absenceJustification.findFirst({
      where: {
        userId: data.userId,
        date: new Date(data.date),
        category: category,
      },
    });

    if (existing) {
      throw new Error(`Já existe uma justificativa de ${category.toLowerCase()} para esta data`);
    }

    // Validações específicas para atrasos
    if (category === 'ATRASO') {
      if (!data.delayMinutes || data.delayMinutes < 30) {
        throw new Error('Justificativas de atraso são necessárias apenas para atrasos superiores a 30 minutos');
      }
      if (!data.expectedTime || !data.actualTime) {
        throw new Error('Para atrasos, é obrigatório informar o horário esperado e o horário real');
      }
    }

    return this.prisma.absenceJustification.create({
      data: {
        userId: data.userId,
        date: new Date(data.date),
        category: category,
        type: data.type,
        reason: data.reason,
        delayMinutes: data.delayMinutes,
        expectedTime: data.expectedTime ? new Date(data.expectedTime) : null,
        actualTime: data.actualTime ? new Date(data.actualTime) : null,
        documentLinks: data.documentLinks ? JSON.stringify(data.documentLinks) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters: FindAllFilters) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status as JustificationStatus;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    return this.prisma.absenceJustification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.absenceJustification.findMany({
      where: { userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const justification = await this.prisma.absenceJustification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!justification) {
      throw new NotFoundException('Justificativa não encontrada');
    }

    // Parse documentLinks se existir
    if (justification.documentLinks) {
      try {
        (justification as any).documentLinksArray = JSON.parse(justification.documentLinks);
      } catch {
        (justification as any).documentLinksArray = [];
      }
    }

    return justification;
  }

  async update(id: string, data: UpdateJustificationDto) {
    const justification = await this.findOne(id);

    // Validações específicas para atrasos se a categoria for alterada
    if (data.category === 'ATRASO') {
      if (!data.delayMinutes || data.delayMinutes < 30) {
        throw new Error('Justificativas de atraso são necessárias apenas para atrasos superiores a 30 minutos');
      }
      if (!data.expectedTime || !data.actualTime) {
        throw new Error('Para atrasos, é obrigatório informar o horário esperado e o horário real');
      }
    }

    return this.prisma.absenceJustification.update({
      where: { id },
      data: {
        category: data.category,
        type: data.type,
        reason: data.reason,
        delayMinutes: data.delayMinutes,
        expectedTime: data.expectedTime ? new Date(data.expectedTime) : null,
        actualTime: data.actualTime ? new Date(data.actualTime) : null,
        documentLinks: data.documentLinks ? JSON.stringify(data.documentLinks) : null,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async review(id: string, data: ReviewJustificationDto & { reviewedBy: string }) {
    const justification = await this.findOne(id);

    if (justification.status !== 'PENDENTE') {
      throw new Error('Esta justificativa já foi analisada');
    }

    return this.prisma.absenceJustification.update({
      where: { id },
      data: {
        status: data.status,
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: data.reviewNotes,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const justification = await this.findOne(id);

    return this.prisma.absenceJustification.delete({
      where: { id },
    });
  }

  // Estatísticas para dashboard
  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.absenceJustification.count({ where }),
      this.prisma.absenceJustification.count({ 
        where: { ...where, status: 'PENDENTE' } 
      }),
      this.prisma.absenceJustification.count({ 
        where: { ...where, status: 'APROVADO' } 
      }),
      this.prisma.absenceJustification.count({ 
        where: { ...where, status: 'REJEITADO' } 
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
