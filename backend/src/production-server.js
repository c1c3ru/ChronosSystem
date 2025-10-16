const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Database connection with connection pooling
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'ponto_db',
  user: process.env.DATABASE_USER || 'ponto_user',
  password: process.env.DATABASE_PASSWORD || 'ponto_password_dev',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-production-secret-key';

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ChronosSystem Backend',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ChronosSystem Backend',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    console.log('🔐 Tentativa de login:', email);
    
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1 AND "isActive" = true', [email]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // In production, use bcrypt for password hashing
    const isValidPassword = password === 'admin123' || password === 'estagio123';
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
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

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const token = authorization.replace('Bearer ', '');
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Protected routes
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [req.user.sub]);
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

// QR Code endpoints
app.get('/api/machines/:machineId/qr', async (req, res) => {
  try {
    const { machineId } = req.params;
    
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const qrPayload = {
      machine_id: machineId,
      timestamp: timestamp,
      nonce: nonce,
      exp: 60,
    };
    
    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
    
    console.log('🔲 QR Code gerado para máquina:', machineId);
    
    res.json({
      qrData: qrData,
      expiresIn: 60,
      machineId: machineId,
    });
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ message: 'Erro ao gerar QR Code' });
  }
});

// Attendance endpoints
app.get('/api/attendance/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se o usuário pode acessar estes dados
    if (req.user.sub !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const result = await pool.query(
      'SELECT * FROM "AttendanceRecord" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 50',
      [userId]
    );
    
    console.log('📋 Registros consultados para usuário:', userId);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar registros:', error);
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

app.post('/api/attendance/scan', authenticateToken, async (req, res) => {
  try {
    const { qrData, type, geoLat, geoLng, selfieUrl } = req.body;
    const userId = req.user.sub;
    
    // Validate QR code
    let qrPayload;
    try {
      qrPayload = JSON.parse(Buffer.from(qrData, 'base64').toString());
    } catch {
      return res.status(400).json({ message: 'QR Code inválido' });
    }
    
    // Check expiration
    const now = new Date();
    const qrTime = new Date(qrPayload.timestamp);
    const diffSeconds = (now - qrTime) / 1000;
    
    if (diffSeconds > qrPayload.exp) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }
    
    // Generate hash chain
    const lastRecordResult = await pool.query(
      'SELECT "hashChain" FROM "AttendanceRecord" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 1',
      [userId]
    );
    
    const previousHash = lastRecordResult.rows[0]?.hashChain || 'genesis';
    const currentData = `${userId}-${type}-${now.toISOString()}`;
    const hashChain = Buffer.from(currentData + previousHash).toString('base64').substring(0, 32);
    
    const recordId = `record-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    await pool.query(
      'INSERT INTO "AttendanceRecord" (id, "userId", "machineId", type, timestamp, location, "selfieUrl", "hashChain", "previousHash") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        recordId,
        userId,
        qrPayload.machine_id,
        type,
        now,
        geoLat && geoLng ? `${geoLat},${geoLng}` : null,
        selfieUrl,
        hashChain,
        previousHash
      ]
    );
    
    console.log(`✅ Ponto registrado: ${type} - Usuário: ${userId} - Máquina: ${qrPayload.machine_id}`);
    
    res.json({
      success: true,
      type,
      timestamp: now,
      machineId: qrPayload.machine_id,
      recordId,
    });
  } catch (error) {
    console.error('❌ Erro ao registrar ponto:', error);
    res.status(500).json({ message: 'Erro ao registrar ponto' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' });
});

// Start server
const server = app.listen(port, () => {
  console.log('🚀 Backend funcionando na porta', port);
  console.log('📡 API disponível em: http://localhost:' + port + '/api');
  console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`🛑 Recebido sinal ${signal}, encerrando servidor...`);
  
  server.close(async () => {
    console.log('📡 Servidor HTTP fechado');
    
    try {
      await pool.end();
      console.log('🗄️ Pool de conexões do banco fechado');
    } catch (error) {
      console.error('❌ Erro ao fechar pool:', error);
    }
    
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
