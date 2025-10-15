import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { WorkHoursService } from '../work-hours/work-hours.service';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
    private workHoursService: WorkHoursService,
  ) {}

  /**
   * Registra ponto via QR code escaneado
   */
  async scanAndRegister(data: {
    qrData: string;
    userId: string;
    type: 'ENTRADA' | 'SAIDA';
    selfieUrl?: string;
    geoLat?: number;
    geoLng?: number;
    deviceInfo?: string;
    userAgent?: string;
  }) {
    // Validar QR code
    const qrPayload = await this.qrService.validateQRCode(data.qrData);

    // Buscar máquina pelo publicId
    const machine = await this.prisma.machine.findUnique({
      where: { publicId: qrPayload.machine_id },
    });

    if (!machine) {
      throw new BadRequestException('Máquina não encontrada');
    }

    // Verificar último registro do usuário
    const lastRecord = await this.prisma.attendanceRecord.findFirst({
      where: { userId: data.userId },
      orderBy: { tsServer: 'desc' },
    });

    // Validar com WorkHoursService
    const validation = await this.workHoursService.validateNewAttendance(
      data.userId,
      data.type as any,
      new Date(),
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    // Buscar hash anterior para cadeia
    const prevHash = lastRecord?.recordHash || null;

    // Criar registro
    const record = await this.prisma.attendanceRecord.create({
      data: {
        userId: data.userId,
        machineId: machine.id,
        type: data.type,
        tsClient: new Date(qrPayload.ts),
        nonce: qrPayload.nonce,
        selfieUrl: data.selfieUrl,
        geoLat: data.geoLat,
        geoLng: data.geoLng,
        deviceInfo: data.deviceInfo,
        userAgent: data.userAgent,
        prevHash,
        recordHash: '', // Será calculado abaixo
      },
    });

    // Calcular hash do registro (sem o próprio recordHash)
    const recordHash = this.calculateRecordHash(record);

    // Atualizar com o hash
    const updatedRecord = await this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { recordHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    // Consumir nonce (marcar como usado)
    await this.qrService.consumeNonce(machine.publicId, qrPayload.nonce);

    // Atualizar resumo diário (async, não bloqueia resposta)
    this.workHoursService.saveDailySummary(data.userId, new Date()).catch(err => {
      console.error('Erro ao salvar resumo diário:', err);
    });

    return updatedRecord;
  }

  /**
   * Busca histórico de registros de um usuário
   */
  async findByUser(userId: string, from?: Date, to?: Date) {
    return this.prisma.attendanceRecord.findMany({
      where: {
        userId,
        tsServer: {
          gte: from,
          lte: to,
        },
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { tsServer: 'desc' },
    });
  }

  /**
   * Busca todos os registros (admin)
   */
  async findAll(filters?: any) {
    return this.prisma.attendanceRecord.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: { tsServer: 'desc' },
      take: 100,
    });
  }

  /**
   * Solicita correção de ponto
   */
  async requestCorrection(data: {
    attendanceRecordId: string;
    userId: string;
    reason: string;
    newType?: 'ENTRADA' | 'SAIDA';
    newTimestamp?: Date;
  }) {
    // Verificar se o registro existe e pertence ao usuário
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: data.attendanceRecordId },
    });

    if (!record || record.userId !== data.userId) {
      throw new BadRequestException('Registro não encontrado');
    }

    // Verificar se já existe correção pendente
    const existingCorrection = await this.prisma.attendanceCorrection.findUnique({
      where: { attendanceRecordId: data.attendanceRecordId },
    });

    if (existingCorrection) {
      throw new BadRequestException('Já existe uma correção para este registro');
    }

    return this.prisma.attendanceCorrection.create({
      data: {
        attendanceRecordId: data.attendanceRecordId,
        userId: data.userId,
        reason: data.reason,
        newType: data.newType,
        newTimestamp: data.newTimestamp,
      },
    });
  }

  /**
   * Aprova ou rejeita correção
   */
  async reviewCorrection(
    correctionId: string,
    reviewerId: string,
    status: 'APROVADO' | 'REJEITADO',
    reviewNotes?: string,
  ) {
    return this.prisma.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });
  }

  /**
   * Verifica integridade da cadeia de hashes
   */
  async verifyHashChain(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { userId },
      orderBy: { tsServer: 'asc' },
    });

    const errors: string[] = [];
    let prevHash: string | null = null;

    for (const record of records) {
      // Verificar se prevHash está correto
      if (record.prevHash !== prevHash) {
        errors.push(
          `Registro ${record.id}: prevHash incorreto (esperado: ${prevHash}, encontrado: ${record.prevHash})`,
        );
      }

      // Recalcular hash do registro
      const calculatedHash = this.calculateRecordHash(record);
      if (record.recordHash !== calculatedHash) {
        errors.push(
          `Registro ${record.id}: recordHash incorreto (esperado: ${calculatedHash}, encontrado: ${record.recordHash})`,
        );
      }

      prevHash = record.recordHash;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcula hash SHA-256 de um registro
   */
  private calculateRecordHash(record: any): string {
    const data = {
      id: record.id,
      userId: record.userId,
      machineId: record.machineId,
      type: record.type,
      tsClient: record.tsClient.toISOString(),
      tsServer: record.tsServer.toISOString(),
      nonce: record.nonce,
      prevHash: record.prevHash,
    };

    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
