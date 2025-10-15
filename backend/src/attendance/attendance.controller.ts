import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('scan')
  async scan(@Req() req, @Body() body: any) {
    return this.attendanceService.scanAndRegister({
      ...body,
      userId: req.user.id,
    });
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findByUser(
      userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async findAll(@Query() filters: any) {
    return this.attendanceService.findAll(filters);
  }

  @Post('correction')
  async requestCorrection(@Req() req, @Body() body: any) {
    return this.attendanceService.requestCorrection({
      ...body,
      userId: req.user.id,
    });
  }

  @Patch('correction/:id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async reviewCorrection(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { status: 'APROVADO' | 'REJEITADO'; reviewNotes?: string },
  ) {
    return this.attendanceService.reviewCorrection(
      id,
      req.user.id,
      body.status,
      body.reviewNotes,
    );
  }

  @Get('verify-chain/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'AUDIT')
  async verifyHashChain(@Param('userId') userId: string) {
    return this.attendanceService.verifyHashChain(userId);
  }
}
