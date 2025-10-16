import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string; twoFactorCode?: string }) {
    return this.authService.login(body.email, body.password, body.twoFactorCode);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redireciona para o Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.loginWithGoogle(req.user);
    
    const frontendUrl = process.env.PWA_URL || 'http://localhost:3001';
    
    // Verificar se precisa completar cadastro
    if ('requiresRegistration' in result) {
      // Redirecionar para página de registro com dados temporários
      res.redirect(
        `${frontendUrl}/auth/register?userId=${result.tempUserId}&email=${encodeURIComponent(result.email)}&name=${encodeURIComponent(result.name)}`,
      );
    } else {
      // Redirecionar para o frontend com os tokens
      res.redirect(
        `${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`,
      );
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Body() body: { refreshToken?: string }) {
    await this.authService.logout(req.user.id, body.refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Req() req) {
    return this.authService.enable2FA(req.user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Req() req, @Body() body: { code: string }) {
    return this.authService.verify2FA(req.user.id, body.code);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@Req() req, @Body() body: { code: string }) {
    return this.authService.disable2FA(req.user.id, body.code);
  }

  @Post('complete-registration')
  @HttpCode(HttpStatus.OK)
  async completeRegistration(@Body() body: {
    userId: string;
    contractStartDate: string;
    contractEndDate: string;
    totalContractHours: number;
    weeklyHours?: number;
    dailyHours?: number;
  }) {
    return this.authService.completeRegistration(body.userId, {
      contractStartDate: body.contractStartDate,
      contractEndDate: body.contractEndDate,
      totalContractHours: body.totalContractHours,
      weeklyHours: body.weeklyHours,
      dailyHours: body.dailyHours,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }
}
