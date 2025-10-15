import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface QRPayload {
  machine_id: string;
  ts: string;
  exp: number;
  nonce: string;
  version: string;
}

@Injectable()
export class QrService {
  private readonly hmacSecret: string;
  private readonly qrExpiration: number;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {
    this.hmacSecret = this.configService.get('HMAC_SECRET') || 'default-secret';
    this.qrExpiration = parseInt(this.configService.get('QR_EXPIRATION_SECONDS') || '60');
  }

  /**
   * Gera um novo QR code assinado para uma máquina
   */
  async generateQRCode(machineId: string): Promise<string> {
    // Verificar se a máquina existe
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine || !machine.isActive) {
      throw new BadRequestException('Máquina não encontrada ou inativa');
    }

    // Criar payload
    const payload: QRPayload = {
      machine_id: machine.publicId,
      ts: new Date().toISOString(),
      exp: this.qrExpiration,
      nonce: this.generateNonce(),
      version: 'v1',
    };

    // Gerar assinatura HMAC
    const signature = this.generateHMAC(payload);

    // Codificar payload e signature em base64url
    const payloadB64 = this.base64urlEncode(JSON.stringify(payload));
    const signatureB64 = this.base64urlEncode(signature);

    const qrData = `${payloadB64}.${signatureB64}`;

    // Salvar evento no banco
    const expiresAt = new Date(Date.now() + this.qrExpiration * 1000);
    await this.prisma.machineQrEvent.create({
      data: {
        machineId,
        payload: JSON.stringify(payload),
        signature,
        nonce: payload.nonce,
        tsGenerated: new Date(payload.ts),
        expiresAt,
      },
    });

    // Armazenar nonce no Redis com TTL
    await this.redis.setWithExpiry(
      `nonce:${machine.publicId}:${payload.nonce}`,
      '1',
      this.qrExpiration + 30, // 30s de margem
    );

    return qrData;
  }

  /**
   * Valida um QR code escaneado
   */
  async validateQRCode(qrData: string): Promise<QRPayload> {
    try {
      // Separar payload e signature
      const [payloadB64, signatureB64] = qrData.split('.');

      if (!payloadB64 || !signatureB64) {
        throw new BadRequestException('QR code inválido');
      }

      // Decodificar
      const payloadStr = this.base64urlDecode(payloadB64);
      const signature = this.base64urlDecode(signatureB64);
      const payload: QRPayload = JSON.parse(payloadStr);

      // Verificar estrutura do payload
      if (!payload.machine_id || !payload.ts || !payload.exp || !payload.nonce) {
        throw new BadRequestException('Payload do QR code inválido');
      }

      // Recalcular HMAC e comparar (timing-safe)
      const expectedSignature = this.generateHMAC(payload);
      
      if (!this.timingSafeCompare(signature, expectedSignature)) {
        throw new BadRequestException('Assinatura do QR code inválida');
      }

      // Verificar timestamp e expiração
      const tsGenerated = new Date(payload.ts).getTime();
      const now = Date.now();
      const expirationMs = payload.exp * 1000;

      if (now - tsGenerated > expirationMs) {
        throw new BadRequestException('QR code expirado');
      }

      // Verificar se o nonce já foi usado (anti-replay)
      const nonceKey = `nonce:${payload.machine_id}:${payload.nonce}`;
      const nonceExists = await this.redis.get(nonceKey);

      if (!nonceExists) {
        throw new BadRequestException('QR code já foi utilizado ou expirou');
      }

      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao validar QR code');
    }
  }

  /**
   * Marca um nonce como usado (consumido)
   */
  async consumeNonce(machineId: string, nonce: string): Promise<void> {
    const nonceKey = `nonce:${machineId}:${nonce}`;
    await this.redis.delete(nonceKey);

    // Registrar no banco para auditoria
    await this.prisma.nonce.create({
      data: {
        machineId,
        nonce,
        expiresAt: new Date(Date.now() + this.qrExpiration * 1000),
      },
    });
  }

  /**
   * Gera assinatura HMAC-SHA256
   */
  private generateHMAC(payload: QRPayload): string {
    const data = JSON.stringify(payload);
    return createHmac('sha256', this.hmacSecret).update(data).digest('hex');
  }

  /**
   * Gera um nonce aleatório
   */
  private generateNonce(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Codifica string em base64url
   */
  private base64urlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Decodifica base64url para string
   */
  private base64urlDecode(str: string): string {
    // Adicionar padding se necessário
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  /**
   * Comparação timing-safe de strings
   */
  private timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return timingSafeEqual(bufA, bufB);
  }

  /**
   * Limpa QR codes e nonces expirados (executado periodicamente)
   */
  async cleanupExpired(): Promise<void> {
    const now = new Date();

    // Limpar eventos de QR expirados
    await this.prisma.machineQrEvent.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Limpar nonces expirados
    await this.prisma.nonce.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
