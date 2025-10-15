import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { QrModule } from '../qr/qr.module';
import { WorkHoursModule } from '../work-hours/work-hours.module';

@Module({
  imports: [QrModule, WorkHoursModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
