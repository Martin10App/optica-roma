import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const maxDuration = 60;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

type ItemVendido = {
  marca?: string;
  modelo?: string;
  cantidad?: number;
};

// Recibe el ranking real de "más vendidos" calculado por el programa de
// escritorio a partir de ventas confirmadas (compartida.ventas_profesionales,
// PostgreSQL 192.168.1.8) y lo aplica a armazones_publico. Reemplaza la
// marca completa cada vez (se apaga todo y se prende solo lo que vino en la
// lista), para que nunca quede un "más vendido" viejo colgado si dejó de
// venderse.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const items: ItemVendido[] = Array.isArray(body.items) ? body.items : [];

    await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND state = 'idle in transaction'
        AND now() - xact_start > interval '20 seconds'
        AND query ILIKE '%armazones_publico%'
    `);

    const client = await pool.connect();
    let marcados = 0;
    try {
      await client.query('BEGIN');
      await client.query('UPDATE armazones_publico SET mas_vendido = false WHERE mas_vendido = true');

      for (const it of items) {
        const marca = (it.marca || '').trim();
        const modelo = (it.modelo || '').trim();
        if (!marca || !modelo) continue;
        const result = await client.query(
          'UPDATE armazones_publico SET mas_vendido = true WHERE marca = $1 AND modelo = $2',
          [marca, modelo]
        );
        marcados += result.rowCount ?? 0;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, recibidos: items.length, marcados });
  } catch (error) {
    console.error('Mas vendidos sync error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar más vendidos' }, { status: 500 });
  }
}
