const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'ponto_db',
  user: process.env.DATABASE_USER || 'ponto_user',
  password: process.env.DATABASE_PASSWORD || 'ponto_password_dev',
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ChronosSystem Backend',
    version: '1.0.0',
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'PostgreSQL',
      connected: true,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'PostgreSQL',
      connected: false,
      error: error.message,
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Tentativa de login:', email);
    
    // Find user in database
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Simple password check (for development)
    const isValidPassword = password === 'admin123' || password === 'estagio123';
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('✅ Login bem-sucedido:', email);
    
    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [payload.sub]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Start server
app.listen(port, () => {
  console.log('🚀 Backend funcionando na porta', port);
  console.log('📡 API disponível em: http://localhost:' + port + '/api');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await pool.end();
  process.exit(0);
});
