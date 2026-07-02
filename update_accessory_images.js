const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  await client.connect();
  
  const updates = [
    { modelo: 'PLAQUETAS', imagen_url: '/media/plaquetas.png' },
    { modelo: 'MICRO SOLDADURA DE LENTES', imagen_url: '/media/micro_soldadura.png' },
    { modelo: 'LIQUIDO LIMPIA CRISTALES', imagen_url: '/media/liquido-limpia.png' },
    { modelo: 'CADENAS SILICONA', imagen_url: '/media/portada-cadenas.jpeg' }
  ];

  for (const item of updates) {
    const res = await client.query(`
      UPDATE armazones_publico 
      SET imagen_url = $1
      WHERE modelo = $2
    `, [item.imagen_url, item.modelo]);
    console.log(`Updated ${item.modelo}: ${res.rowCount} row(s)`);
  }

  await client.end();
}

run().catch(console.error);
