const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  await client.connect();
  const accesorios = [
    { modelo: 'PLAQUETAS', marca: 'Generico', categoria: 'accesorios', precio: 150, imagen_url: '' },
    { modelo: 'MICRO SOLDADURA DE LENTES', marca: 'Servicio', categoria: 'accesorios', precio: 400, imagen_url: '' },
    { modelo: 'LIQUIDO LIMPIA CRISTALES', marca: 'Optica Roma', categoria: 'accesorios', precio: 150, imagen_url: '' },
    { modelo: 'CADENAS SILICONA', marca: 'Generico', categoria: 'accesorios', precio: 300, imagen_url: '/media/portada-cadenas.jpeg', precio_original: 400 } // oferta
  ];

  for (const item of accesorios) {
    const res = await client.query('SELECT id FROM armazones_publico WHERE modelo = $1', [item.modelo]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO armazones_publico (modelo, marca, categoria, precio, precio_original, imagen_url, stock_visible)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [item.modelo, item.marca, item.categoria, item.precio, item.precio_original || null, item.imagen_url]);
      console.log('Inserted:', item.modelo);
    } else {
      console.log('Already exists:', item.modelo);
    }
  }

  await client.end();
}

run().catch(console.error);
