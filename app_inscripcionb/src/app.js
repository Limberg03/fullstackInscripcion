// app.js - VERSIÓN REFACTORIZADA CON REDIS

// ✅ CAMBIO: Solo cargar .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log('📂 Archivo .env cargado (desarrollo)');
} else {
  console.log('🔧 Usando variables de entorno del sistema (producción)');
}

// ✅ NUEVO: Verificar variables críticas
console.log('🔍 Verificando configuración:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  DB_HOST:', process.env.DB_HOST ? '✅' : '❌');
console.log('  DB_USER:', process.env.DB_USER ? '✅' : '❌');
console.log('  REDIS_HOST:', process.env.REDIS_HOST ? '✅' : '❌');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL ? '✅' : '❌');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Importaciones de la aplicación
const { sequelize } = require('./models/index');
const routes = require('./routes/index');
const routesSync = require('./routes_sync/index');

const queueRoutes = require('./routes/queueRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const { notFound, errorHandler, requestLogger } = require('./middleware/index');
const requestTrackingMiddleware = require('./middleware/requestTrackingMiddleware');
const QueueService = require('./services/QueueService');
const CallbackService = require('./services/CallbackService');

const app = express();
const PORT = process.env.PORT || 3000;

// ================ MIDDLEWARE Y CONFIGURACIÓN ================

const allowedOrigins = [
  'http://localhost:5173',           // Desarrollo local
  'http://localhost:3000',           // Desarrollo local alternativo
  'https://*.vercel.app',            // Cualquier dominio de Vercel
  process.env.FRONTEND_URL,          // URL de producción (configurable)
].filter(Boolean);


app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, curl, apps móviles)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Wildcard matching para *.vercel.app
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ Origin bloqueado:', origin);
      callback(null, true); // Aún así permitir (puedes cambiar a false para bloquear)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // Cache preflight 24 horas
}));
// --- FIN DE LA MODIFICACIÓN DE CORS ---

// ✅ Helmet MÍNIMO - Sin CSP ni headers problemáticos
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestTrackingMiddleware);
app.use(requestLogger);

// ================ RUTAS ================
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/tracking', trackingRoutes);
app.use('/', routes);
app.use('/sync', routesSync);
app.use('/queue', queueRoutes);

// Ruta raíz para health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema Académico con Redis - API en funcionamiento.',
    version: '3.0.0'
  });
});

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Variables de servicio (se inicializan en `initializeApp`)
let queueService = null;
let callbackService = null;

// ================ LÓGICA DE INICIALIZACIÓN ================
const initializeApp = async () => {
  try {
    console.log('🚀 Iniciando la aplicación...');

    // 1. Conectar a PostgreSQL
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida.');

    // 2. Inicializar servicios
    callbackService = new CallbackService();
    callbackService.setupDefaultCallbacks();
    console.log('✅ Sistema de Callbacks inicializado.');

    // 3. Inicializar Queue Service con manejo de errores
    console.log('🔄 Inicializando QueueService...');
    try {
      queueService = new QueueService();
      await queueService.initialize();
      console.log('✅ Sistema de Colas con Redis inicializado.');
      
      const redisInfo = await queueService.getRedisInfo();
      // console.log('✅ Redis info:', redisInfo);
    } catch (redisError) {
      console.error('⚠️ Error al inicializar Redis:', redisError.message);
      console.error('⚠️ Continuando sin sistema de colas...');
      queueService = null;
    }

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('✅ Modelos sincronizados con la base de datos.');
    }

    console.log('✅ Aplicación inicializada correctamente.');
    console.log('📡 CORS habilitado para: http://localhost:5173');
    
  } catch (error) {
    console.error('❌ Error fatal al inicializar la aplicación:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Recibida señal ${signal}. Cerrando la aplicación de forma segura...`);
  try {
    if (queueService) await queueService.shutdown();
    await sequelize.close();
    console.log('✅ Recursos liberados. Cierre completado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre seguro:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo de promesa no manejado en:', promise, 'razón:', reason);
  process.exit(1);
});

// ================ INICIO DE LA APLICACIÓN ================
if (require.main === module) {
  initializeApp().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando en http://0.0.0.0:${PORT}`);
      console.log(`🌐 Accesible desde red local: http://192.168.1.9:${PORT}`);
    });
  });
}

module.exports = { 
  app, 
  initializeApp,
  queueService: () => queueService, 
  callbackService: () => callbackService 
};