// Teste rápido de conexão Redis
const Redis = require('ioredis');

async function testRedis() {
  console.log('Testando conexão Redis...');

  const redis = new Redis('redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000
  });

  try {
    const pong = await redis.ping();
    console.log('✅ Redis conectado:', pong);
    console.log('✅ Redis funcionando perfeitamente!');
  } catch (error) {
    console.error('❌ Erro Redis:', error.message);
  } finally {
    await redis.quit();
    process.exit(0);
  }
}

testRedis();
