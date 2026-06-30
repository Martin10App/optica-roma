require('dotenv').config({ path: '.env.local' }) || require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function clean() {
  const result = await pool.query('SELECT id, imagen_url FROM armazones_publico WHERE stock_visible = true');
  let missing = 0;

  for (const row of result.rows) {
    if (row.imagen_url) {
      const filePath = path.join(__dirname, 'public', row.imagen_url);
      if (!fs.existsSync(filePath)) {
        await pool.query('UPDATE armazones_publico SET stock_visible = false WHERE id = $1', [row.id]);
        missing++;
      }
    } else {
      await pool.query('UPDATE armazones_publico SET stock_visible = false WHERE id = $1', [row.id]);
      missing++;
    }
  }

  console.log(`Updated ${missing} items with missing images.`);
  await pool.end();
}

clean().catch(console.error);
