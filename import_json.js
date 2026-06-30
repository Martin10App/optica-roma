const { Client } = require('pg');
const fs = require('fs');

const neonClient = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    console.log('Connecting to Neon DB...');
    await neonClient.connect();

    console.log('Reading JSON data...');
    const data = JSON.parse(fs.readFileSync('C:/Users/OPTICA ROMA/Desktop/juego alma/armazones_export.json', 'utf8'));
    console.log(`Found ${data.length} armazones in JSON.`);

    console.log('Truncating remote armazones_publico...');
    await neonClient.query('TRUNCATE TABLE armazones_publico RESTART IDENTITY');

    console.log('Inserting into remote database...');
    let inserted = 0;
    for (const item of data) {
      if (!item.imagen) continue;
      
      let precio = 0;
      if (item.precio_venta && !isNaN(parseFloat(item.precio_venta))) {
        precio = parseFloat(item.precio_venta);
      }
      
      let stockVisible = false;
      if (item.stock_num && parseInt(item.stock_num, 10) > 0) {
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

    console.log(`Successfully imported ${inserted} armazones!`);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await neonClient.end();
  }
}

run();
