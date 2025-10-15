import { Controller, Post, Body } from '@nestjs/common';
import { QrService, QRPayload } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('validate')
  async validate(@Body() body: { qrData: string }): Promise<{ valid: boolean; payload: QRPayload }> {
    const payload = await this.qrService.validateQRCode(body.qrData);
    return { valid: true, payload };
  }
}
