import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'ponto_db',
      user: process.env.DATABASE_USER || 'ponto_user',
      password: process.env.DATABASE_PASSWORD || 'ponto_password_dev',
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email: string) {
    const result = await this.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findUserById(id: string) {
    const result = await this.query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}
