import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { SimpleAuthService } from './simple-auth.service';

@Controller('auth')
export class SimpleAuthController {
  constructor(private authService: SimpleAuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      console.log('🔐 Tentativa de login:', loginDto.email);
      const result = await this.authService.login(loginDto.email, loginDto.password);
      console.log('✅ Login bem-sucedido:', loginDto.email);
      return result;
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  }

  @Get('me')
  async getProfile(@Headers('authorization') authorization: string) {
    try {
      if (!authorization) {
        throw new UnauthorizedException('Token não fornecido');
      }

      const token = authorization.replace('Bearer ', '');
      const user = await this.authService.validateToken(token);
      return user;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error.message);
      throw error;
    }
  }

  @Post('logout')
  async logout() {
    return { message: 'Logout realizado com sucesso' };
  }
}
