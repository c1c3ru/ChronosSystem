import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class SimpleHealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ChronosSystem Backend',
      version: '1.0.0',
    };
  }

  @Get('db')
  getDatabaseHealth() {
    return {
      status: 'ok',
      database: 'PostgreSQL',
      connected: true,
    };
  }
}
