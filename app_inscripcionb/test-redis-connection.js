require('dotenv').config();
const Redis = require('ioredis');

console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A REDIS\n');
console.log('Configuración:');
console.log('  REDIS_HOST:', process.env.REDIS_HOST);
console.log('  REDIS_PORT:', process.env.REDIS_PORT);
console.log('  REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***SET***' : 'NOT SET');
console.log('  REDIS_TLS:', process.env.REDIS_TLS);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('\n');

const testClusterConnection = async () => {
  console.log('📡 TEST 1: Intentando conexión en MODO CLUSTER CON TLS...\n');
  
  const cluster = new Redis.Cluster(
    [{
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379
    }],
    {
      redisOptions: {
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === 'true' ? {
          checkServerIdentity: () => undefined,
          rejectUnauthorized: false
        } : undefined,
        connectTimeout: 20000,
        commandTimeout: 15000,
        family: 4
      },
      clusterRetryStrategy: (times) => {
        if (times > 5) {
          console.error('❌ Cluster: Max retries reached');
          return null;
        }
        console.log(`   Retry ${times}/5...`);
        return Math.min(times * 1000, 3000);
      },
      slotsRefreshTimeout: 15000,
      enableReadyCheck: true,
      maxRedirections: 16,
      natMap: {}
    }
  );

  cluster.on('error', (err) => {
    console.error('❌ Cluster Error:', err.message);
  });

  cluster.on('node error', (err, node) => {
    console.error('❌ Node Error:', node, '→', err.message);
  });

  cluster.on('ready', () => {
    console.log('✅ Cluster is READY!');
  });

  cluster.on('connect', () => {
    console.log('✅ Cluster CONNECTED!');
  });

  cluster.on('+node', (node) => {
    console.log('✅ Node added:', node.options.host);
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout (20s)'));
      }, 20000);

      cluster.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      cluster.once('error', (err) => {
        if (err.message.includes('timeout') || err.message.includes('refresh')) {
          // Continuar esperando, puede ser solo un nodo
          return;
        }
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log('✅ Conexión exitosa en modo CLUSTER');
    const result = await cluster.ping();
    console.log('✅ PING response:', result);
    
    // Probar comandos básicos
    await cluster.set('test:connection', 'OK');
    const value = await cluster.get('test:connection');
    console.log('✅ SET/GET test:', value);
    await cluster.del('test:connection');
    
    await cluster.quit();
    return true;
  } catch (error) {
    console.error('❌ Falló conexión CLUSTER:', error.message);
    await cluster.disconnect();
    return false;
  }
};

const testStandaloneConnection = async () => {
  console.log('\n📡 TEST 2: Intentando conexión en MODO STANDALONE CON TLS...\n');
  
  const standalone = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {
      checkServerIdentity: () => undefined,
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 20000,
    commandTimeout: 15000,
    family: 4,
    retryStrategy: (times) => {
      if (times > 5) {
        console.error('❌ Standalone: Max retries reached');
        return null;
      }
      console.log(`   Retry ${times}/5...`);
      return Math.min(times * 1000, 3000);
    }
  });

  standalone.on('error', (err) => {
    console.error('❌ Standalone Error:', err.message);
  });

  standalone.on('ready', () => {
    console.log('✅ Standalone is READY!');
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout (20s)'));
      }, 20000);

      standalone.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      standalone.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log('✅ Conexión exitosa en modo STANDALONE');
    const result = await standalone.ping();
    console.log('✅ PING response:', result);
    
    await standalone.quit();
    return true;
  } catch (error) {
    console.error('❌ Falló conexión STANDALONE:', error.message);
    await standalone.disconnect();
    return false;
  }
};

(async () => {
  const clusterSuccess = await testClusterConnection();
  const standaloneSuccess = await testStandaloneConnection();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTADOS:');
  console.log('  Cluster Mode + TLS:', clusterSuccess ? '✅ FUNCIONA' : '❌ FALLA');
  console.log('  Standalone Mode + TLS:', standaloneSuccess ? '✅ FUNCIONA' : '❌ FALLA');
  console.log('='.repeat(50));
  
  if (!clusterSuccess && !standaloneSuccess) {
    console.log('\n⚠️  PROBLEMAS DETECTADOS:');
    console.log('   1. Verifica que el Security Group permita tu IP');
    console.log('   2. Redis está en VPC privada (172.31.x.x)');
    console.log('   3. Necesitas conexión desde AWS (EC2/ECS/Lambda)');
    console.log('   4. Considera usar AWS Systems Manager Session Manager');
  }
  
  process.exit(0);
})();