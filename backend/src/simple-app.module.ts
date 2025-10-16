import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimpleAuthModule } from './simple-auth/simple-auth.module';
import { SimpleHealthController } from './simple-health/simple-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SimpleAuthModule,
  ],
  controllers: [SimpleHealthController],
})
export class AppModule {}
