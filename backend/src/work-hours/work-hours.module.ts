import { Module } from '@nestjs/common';
import { WorkHoursService } from './work-hours.service';
import { WorkHoursController } from './work-hours.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkHoursController],
  providers: [WorkHoursService],
  exports: [WorkHoursService],
})
export class WorkHoursModule {}
