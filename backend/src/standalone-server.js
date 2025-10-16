<<<<<<< HEAD
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

// Authentication middleware
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
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Consultando perfil do usuário:', req.user.sub);
    
    // Get user from database
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [req.user.sub]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco:', req.user.sub);
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('✅ Perfil encontrado:', user.email);
    
    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      role: user.role,
    };
    
    console.log('📤 Enviando resposta:', JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Generate QR Code endpoint (for kiosk compatibility)
app.get('/api/machines/:machineId/qr', async (req, res) => {
  try {
    const { machineId } = req.params;
    
    // Generate a simple QR code payload
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const qrPayload = {
      machine_id: machineId,
      timestamp: timestamp,
      nonce: nonce,
      exp: 60, // expires in 60 seconds
    };
    
    // Simple base64 encoding for demo
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

// Generate QR Code endpoint (alternative)
app.post('/api/qr/generate', async (req, res) => {
  try {
    const { machineId } = req.body;
    
    // Generate a simple QR code payload
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const qrPayload = {
      machine_id: machineId || 'KIOSK-001',
      timestamp: timestamp,
      nonce: nonce,
      exp: 60, // expires in 60 seconds
    };
    
    // Simple base64 encoding for demo
    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
    
    console.log('🔲 QR Code gerado para máquina:', machineId || 'KIOSK-001');
    
    res.json({
      qrCode: qrData,
      expiresIn: 60,
      machineId: machineId || 'KIOSK-001',
    });
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ message: 'Erro ao gerar QR Code' });
  }
});

// Validate QR Code endpoint
app.post('/api/qr/validate', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ message: 'QR Code não fornecido' });
    }
    
    // Decode and validate
    const payload = JSON.parse(Buffer.from(qrData, 'base64').toString());
    const now = new Date();
    const qrTime = new Date(payload.timestamp);
    const diffSeconds = (now - qrTime) / 1000;
    
    if (diffSeconds > payload.exp) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }
    
    console.log('✅ QR Code validado:', payload.machine_id);
    
    res.json({
      valid: true,
      machineId: payload.machine_id,
      timestamp: payload.timestamp,
    });
  } catch (error) {
    console.error('❌ Erro ao validar QR Code:', error);
    res.status(400).json({ message: 'QR Code inválido' });
  }
});

// Get user attendance records
app.get('/api/attendance/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get attendance records from database
    const result = await pool.query(
      'SELECT * FROM "AttendanceRecord" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 10',
      [userId]
    );
    
    console.log('📋 Registros de ponto consultados para usuário:', userId);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar registros:', error);
    res.status(500).json({ message: 'Erro ao buscar registros' });
  }
});

// Record attendance (scan QR code)
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { qrData, type, geoLat, geoLng, selfieUrl } = req.body;
    
    // Get user from token
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;
    
    // Validate QR code
    let qrPayload;
    try {
      qrPayload = JSON.parse(Buffer.from(qrData, 'base64').toString());
    } catch {
      return res.status(400).json({ message: 'QR Code inválido' });
    }
    
    // Check if QR is expired
    const now = new Date();
    const qrTime = new Date(qrPayload.timestamp);
    const diffSeconds = (now - qrTime) / 1000;
    
    if (diffSeconds > qrPayload.exp) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }
    
    // Generate hash chain (simple implementation)
    const lastRecordResult = await pool.query(
      'SELECT "hashChain" FROM "AttendanceRecord" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 1',
      [userId]
    );
    
    const previousHash = lastRecordResult.rows[0]?.hashChain || 'genesis';
    const currentData = `${userId}-${type}-${now.toISOString()}`;
    const hashChain = Buffer.from(currentData + previousHash).toString('base64').substring(0, 32);
    
    // Insert attendance record
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

// Users management endpoints
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Only admins can list users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const result = await pool.query(
      'SELECT id, email, name, "fullName", phone, "employeeId", role, "isActive", "contractStartDate", "contractEndDate", "createdAt", "updatedAt" FROM "User" WHERE "isActive" = true ORDER BY "createdAt" DESC'
    );
    
    console.log('👥 Lista de usuários consultada pelo admin:', req.user.email);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    // Only admins can create users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { name, fullName, email, phone, employeeId, role, password, contractStartDate, contractEndDate } = req.body;
    
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'Nome, email, função e senha são obrigatórios' });
    }
    
    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();
    
    // In production, hash the password with bcrypt
    await pool.query(
      'INSERT INTO "User" (id, email, name, "fullName", phone, "employeeId", role, password, "contractStartDate", "contractEndDate", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [userId, email, name, fullName, phone, employeeId, role, password, contractStartDate, contractEndDate, true, now, now]
    );
    
    console.log('✅ Usuário criado:', email, 'por admin:', req.user.email);
    
    res.status(201).json({
      id: userId,
      email,
      name,
      fullName,
      phone,
      employeeId,
      role,
      contractStartDate,
      contractEndDate,
      isActive: true,
      createdAt: now,
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

app.put('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    // Only admins can update users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { userId } = req.params;
    const { name, fullName, email, phone, employeeId, role, contractStartDate, contractEndDate, isActive } = req.body;
    
    if (!name || !email || !role || isActive === undefined) {
      return res.status(400).json({ message: 'Nome, email e função são obrigatórios' });
    }
    
    const now = new Date();
    
    const result = await pool.query(
      'UPDATE "User" SET name = $1, "fullName" = $2, email = $3, phone = $4, "employeeId" = $5, role = $6, "contractStartDate" = $7, "contractEndDate" = $8, "isActive" = $9, "updatedAt" = $10 WHERE id = $11 RETURNING *',
      [name, fullName, email, phone, employeeId, role, contractStartDate, contractEndDate, isActive, now, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('✅ Usuário atualizado:', email, 'por admin:', req.user.email);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { userId } = req.params;
    
    // Don't allow deleting self
    if (userId === req.user.sub) {
      return res.status(400).json({ message: 'Não é possível deletar seu próprio usuário' });
    }
    
    const result = await pool.query('DELETE FROM "User" WHERE id = $1 RETURNING email', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('✅ Usuário deletado:', result.rows[0].email, 'por admin:', req.user.email);
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
});

// Machines management endpoints
app.get('/api/machines', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const result = await pool.query(
      'SELECT * FROM "Machine" ORDER BY "createdAt" DESC'
    );
    
    console.log('🖥️ Lista de máquinas consultada pelo admin:', req.user.email);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar máquinas:', error);
    res.status(500).json({ message: 'Erro ao buscar máquinas' });
  }
});

app.post('/api/machines', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { name, location, description } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ message: 'Nome e localização são obrigatórios' });
    }
    
    const machineId = `machine-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();
    
    await pool.query(
      'INSERT INTO "Machine" (id, name, location, description, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [machineId, name, location, description, true, now, now]
    );
    
    console.log('✅ Máquina criada:', name, 'por admin:', req.user.email);
    
    res.status(201).json({
      id: machineId,
      name,
      location,
      description,
      isActive: true,
      createdAt: now,
    });
  } catch (error) {
    console.error('❌ Erro ao criar máquina:', error);
    res.status(500).json({ message: 'Erro ao criar máquina' });
  }
});

app.put('/api/machines/:machineId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { machineId } = req.params;
    const { name, location, description, isActive } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ message: 'Nome e localização são obrigatórios' });
    }
    
    const now = new Date();
    
    const result = await pool.query(
      'UPDATE "Machine" SET name = $1, location = $2, description = $3, "isActive" = $4, "updatedAt" = $5 WHERE id = $6 RETURNING *',
      [name, location, description, isActive, now, machineId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Máquina não encontrada' });
    }
    
    console.log('✅ Máquina atualizada:', name, 'por admin:', req.user.email);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar máquina:', error);
    res.status(500).json({ message: 'Erro ao atualizar máquina' });
  }
});

app.delete('/api/machines/:machineId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { machineId } = req.params;
    
    const result = await pool.query('DELETE FROM "Machine" WHERE id = $1 RETURNING name', [machineId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Máquina não encontrada' });
    }
    
    console.log('✅ Máquina deletada:', result.rows[0].name, 'por admin:', req.user.email);
    
    res.json({ message: 'Máquina deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar máquina:', error);
    res.status(500).json({ message: 'Erro ao deletar máquina' });
  }
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
=======
[conteúdo completo do arquivo]
>>>>>>> 935f7b70044b3bbc872b4c4fe5c0bd4035148ce5
