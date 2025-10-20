import { Module } from '@nestjs/common';
import { JustificationsService } from './justifications.service';
import { JustificationsController } from './justifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JustificationsController],
  providers: [JustificationsService],
  exports: [JustificationsService],
})
export class JustificationsModule {}
