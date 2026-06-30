const { Client } = require('pg');

const neonClient = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });
const localClient = new Client({
  host: '192.168.1.8',
  port: 5432,
  database: 'optica_roma',
  user: 'optica_app',
  password: 'Opticaroma0711'
});

async function run() {
  try {
    console.log('Connecting to databases...');
    await neonClient.connect();
    await localClient.connect();

    console.log('Fetching local armazones...');
    const localRes = await localClient.query('SELECT marca, codigo, precio_venta, stock, imagen FROM public.armazones');
    const armazones = localRes.rows;
    console.log(`Found ${armazones.length} armazones.`);

    console.log('Truncating remote armazones_publico...');
    await neonClient.query('TRUNCATE TABLE armazones_publico RESTART IDENTITY');

    console.log('Inserting into remote database...');
    let inserted = 0;
    for (const item of armazones) {
      if (!item.imagen) continue; // Skip if no image? Actually let's just insert
      
      let precio = 0;
      if (item.precio_venta && !isNaN(parseFloat(item.precio_venta))) {
        precio = parseFloat(item.precio_venta);
      }
      
      let stockVisible = false;
      if (item.stock && parseInt(item.stock, 10) > 0) {
        stockVisible = true;
      }
      
      const imagenUrl = item.imagen ? `/armazones/${item.imagen}` : null;
      
      await neonClient.query(`
        INSERT INTO armazones_publico (modelo, marca, categoria, precio, stock_visible, imagen_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        item.codigo || 'Sin Modelo',
        item.marca || 'Sin Marca',
        'Armazones de Receta',
        precio,
        stockVisible,
        imagenUrl
      ]);
      inserted++;
    }

    console.log(`Successfully migrated ${inserted} armazones!`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await neonClient.end();
    await localClient.end();
  }
}

run();
