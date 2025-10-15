import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { WorkHoursService, DailySummary, ContractSummary } from './work-hours.service';

@Controller('work-hours')
export class WorkHoursController {
  constructor(private workHoursService: WorkHoursService) {}

  @Get('daily')
  async getDailySummary(
    @Req() req,
    @Query('date') dateStr?: string,
  ): Promise<DailySummary> {
    const userId = req.user.sub;
    const date = dateStr ? new Date(dateStr) : new Date();
    
    return this.workHoursService.calculateDailySummary(userId, date);
  }

  @Get('weekly')
  async getWeeklySummary(
    @Req() req,
    @Query('startDate') startDateStr?: string,
  ) {
    const userId = req.user.sub;
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    
    return this.workHoursService.getWeeklySummary(userId, startDate);
  }

  @Get('monthly')
  async getMonthlySummary(
    @Req() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const userId = req.user.sub;
    const now = new Date();
    const yearNum = year ? parseInt(year) : now.getFullYear();
    const monthNum = month ? parseInt(month) : now.getMonth() + 1;
    
    return this.workHoursService.getMonthlySummary(userId, yearNum, monthNum);
  }

  @Get('contract')
  async getContractSummary(@Req() req): Promise<ContractSummary> {
    const userId = req.user.sub;
    return this.workHoursService.calculateContractSummary(userId);
  }

  @Get('user/:userId/daily')
  async getUserDailySummary(
    @Param('userId') userId: string,
    @Query('date') dateStr?: string,
  ): Promise<DailySummary> {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.workHoursService.calculateDailySummary(userId, date);
  }

  @Get('user/:userId/contract')
  async getUserContractSummary(@Param('userId') userId: string): Promise<ContractSummary> {
    return this.workHoursService.calculateContractSummary(userId);
  }
}
