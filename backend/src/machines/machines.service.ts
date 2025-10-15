import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { randomBytes } from 'crypto';

@Injectable()
export class MachinesService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
  ) {}

  async create(data: any) {
    return this.prisma.machine.create({
      data: {
        ...data,
        publicId: this.generatePublicId(),
      },
    });
  }

  async findAll() {
    return this.prisma.machine.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.machine.findUnique({
      where: { id },
      include: {
        qrEvents: {
          take: 10,
          orderBy: { tsGenerated: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.machine.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.machine.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCurrentQR(machineId: string): Promise<string> {
    return this.qrService.generateQRCode(machineId);
  }

  private generatePublicId(): string {
    return `MACHINE_${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  // Cron job para limpar QR codes expirados a cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    await this.qrService.cleanupExpired();
    console.log('🧹 QR codes expirados limpos');
  }
}
