const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  await client.connect();
  
  await client.query(`UPDATE armazones_publico SET imagen_url = '/media/liquido-limpia.png' WHERE modelo = 'LIQUIDO LIMPIA CRISTALES'`);

  console.log('Image updated successfully');

  await client.end();
}

run().catch(console.error);
