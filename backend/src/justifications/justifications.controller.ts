import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JustificationsService } from './justifications.service';
import { CreateJustificationDto } from './dto/create-justification.dto';
import { UpdateJustificationDto } from './dto/update-justification.dto';
import { ReviewJustificationDto } from './dto/review-justification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('api/justifications')
@UseGuards(JwtAuthGuard)
export class JustificationsController {
  constructor(private readonly justificationsService: JustificationsService) {}

  @Post()
  async create(@Body() createJustificationDto: CreateJustificationDto, @Request() req) {
    return this.justificationsService.create({
      ...createJustificationDto,
      userId: req.user.id,
    });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async findAll(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.justificationsService.findAll({
      status,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('my')
  async findMyJustifications(@Request() req) {
    return this.justificationsService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const justification = await this.justificationsService.findOne(id);
    
    // Usuários só podem ver suas próprias justificativas, exceto admins/supervisores
    if (
      justification.userId !== req.user.id &&
      !['ADMIN', 'SUPERVISOR'].includes(req.user.role)
    ) {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }
    
    return justification;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJustificationDto: UpdateJustificationDto,
    @Request() req,
  ) {
    const justification = await this.justificationsService.findOne(id);
    
    // Usuários só podem editar suas próprias justificativas pendentes
    if (justification.userId !== req.user.id) {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }
    
    if (justification.status !== 'PENDENTE') {
      throw new HttpException(
        'Não é possível editar justificativas já analisadas',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    return this.justificationsService.update(id, updateJustificationDto);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async review(
    @Param('id') id: string,
    @Body() reviewJustificationDto: ReviewJustificationDto,
    @Request() req,
  ) {
    return this.justificationsService.review(id, {
      ...reviewJustificationDto,
      reviewedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const justification = await this.justificationsService.findOne(id);
    
    // Usuários só podem deletar suas próprias justificativas pendentes
    if (justification.userId !== req.user.id) {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }
    
    if (justification.status !== 'PENDENTE') {
      throw new HttpException(
        'Não é possível deletar justificativas já analisadas',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    return this.justificationsService.remove(id);
  }
}
