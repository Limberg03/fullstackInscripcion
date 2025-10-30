require('dotenv').config({ path: '.env.production' });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    require: true,
    rejectUnauthorized: false  // ← CRÍTICO para RDS
  }
});

client.connect()
  .then(() => {
    console.log('✅ Conexión exitosa! La contraseña es correcta.');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('⚠️ La contraseña es INCORRECTA');
    } else if (err.message.includes('timeout') || err.message.includes('ECONNREFUSED')) {
      console.error('⚠️ Problema de red o Security Group');
    } else if (err.message.includes('no pg_hba.conf')) {
      console.error('⚠️ Problema de SSL - verifica la configuración');
    }
  });