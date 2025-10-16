import { NestFactory } from '@nestjs/core';
import { AppModule } from './simple-app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      credentials: true,
    });

    app.setGlobalPrefix('api');
    
    await app.listen(4000);
    console.log('🚀 Backend funcionando na porta 4000');
    console.log('📡 API disponível em: http://localhost:4000/api');
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();
