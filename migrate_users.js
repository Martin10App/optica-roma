const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const neonClient = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    console.log('Connecting to Neon DB...');
    await neonClient.connect();

    console.log('Creating users table...');
    await neonClient.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'cliente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating orders table...');
    await neonClient.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        total DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(50) DEFAULT 'pendiente',
        preferencia_mp_id VARCHAR(255),
        pago_id VARCHAR(255),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating order items table...');
    await neonClient.query(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER NOT NULL,
        modelo VARCHAR(255),
        marca VARCHAR(255),
        cantidad INTEGER NOT NULL,
        precio DECIMAL(10, 2) NOT NULL
      );
    `);

    // Create the admin user if it doesn't exist
    const adminEmail = 'martin@opticaroma.com.uy';
    const checkAdmin = await neonClient.query('SELECT * FROM usuarios WHERE email = $1', [adminEmail]);
    
    if (checkAdmin.rows.length === 0) {
      console.log('Creating admin user "martin"...');
      const hash = await bcrypt.hash('0711', 10);
      await neonClient.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
        ['Martin', adminEmail, hash, 'admin']
      );
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await neonClient.end();
  }
}

run();
