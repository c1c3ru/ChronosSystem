import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @Roles('ADMIN', 'SUPERVISOR')
  create(@Body() createMachineDto: any) {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPERVISOR')
  findAll() {
    return this.machinesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Get(':id/qr')
  async getCurrentQR(@Param('id') id: string) {
    return {
      qrData: await this.machinesService.getCurrentQR(id),
    };
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  update(@Param('id') id: string, @Body() updateMachineDto: any) {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }
}
