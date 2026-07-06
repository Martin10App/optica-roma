import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM rabaquino_cristales_stock ORDER BY tipo ASC, subtipo ASC, esf ASC LIMIT 5000'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Rabaquino GET cristales-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar stock de cristales' }, { status: 500 });
  }
}
