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
    rejectUnauthorized: false
  }
});

async function verify() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS\n');

    // Ver todas las tablas
    const tablesResult = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    
    console.log('📊 Tablas creadas:');
    tablesResult.rows.forEach(t => console.log(`  - ${t.tablename}`));

    // Contar registros (solo si existen las tablas)
    try {
      const usuarios = await client.query('SELECT COUNT(*) FROM "Usuarios"');
      console.log(`\n📈 Usuarios: ${usuarios.rows[0].count}`);
    } catch (e) {
      console.log('\n⚠️ No se pudo contar usuarios (tabla no existe o está vacía)');
    }

    await client.end();
    console.log('\n✅ Verificación completa');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verify();