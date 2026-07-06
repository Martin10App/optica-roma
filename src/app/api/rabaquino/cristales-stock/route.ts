import { NextRequest, NextResponse } from 'next/server';
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

// Reemplaza todo el contenido de la tabla con el stock actual que manda el
// programa de escritorio (sincronización periódica). Requiere el header
// X-Sync-Secret para evitar que cualquiera pueda pisar la tabla.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM rabaquino_cristales_stock');
      for (const it of items) {
        await client.query(
          `INSERT INTO rabaquino_cristales_stock
             (tipo, subtipo, esf, cil, add_val, ojo, disponible, cantidad, fecha_sync)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
          [
            it.tipo || '', it.subtipo || '', it.esf || '', it.cil || '',
            it.add_val || '', it.ojo || null, !!it.disponible, it.cantidad ?? 0,
          ]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error('Rabaquino POST cristales-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al sincronizar stock de cristales' }, { status: 500 });
  }
}
