import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SimpleAuthController } from './simple-auth.controller';
import { SimpleAuthService } from './simple-auth.service';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SimpleAuthController],
  providers: [SimpleAuthService, DatabaseService],
})
export class SimpleAuthModule {}
