import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SimpleAuthService {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.databaseService.findUserByEmail(email);
      
      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Para teste, vamos aceitar a senha "admin123" e "estagio123"
      const isValidPassword = password === 'admin123' || password === 'estagio123';
      
      if (!isValidPassword) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw new UnauthorizedException('Erro no login');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.databaseService.findUserById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
