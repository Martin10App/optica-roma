import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const maxDuration = 60;

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

    const CAMPOS_POR_FILA = 8;
    const FILAS_POR_LOTE = 500; // se mantiene bien por debajo del limite de parametros de Postgres

    // Salvaguarda: si una ejecucion anterior murio a mitad de camino (por
    // ejemplo por el limite de tiempo de la funcion serverless) puede quedar
    // una transaccion abierta bloqueando la tabla para siempre. La matamos
    // antes de intentar nuestra propia transaccion.
    await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND state = 'idle in transaction'
        AND now() - xact_start > interval '20 seconds'
        AND query ILIKE '%rabaquino_cristales_stock%'
    `);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM rabaquino_cristales_stock');

      for (let i = 0; i < items.length; i += FILAS_POR_LOTE) {
        const lote = items.slice(i, i + FILAS_POR_LOTE);
        const valores: unknown[] = [];
        const placeholders = lote.map((it: any, idx: number) => {
          const base = idx * CAMPOS_POR_FILA;
          valores.push(
            it.tipo || '', it.subtipo || '', it.esf || '', it.cil || '',
            it.add_val || '', it.ojo || null, !!it.disponible, it.cantidad ?? 0
          );
          return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},NOW())`;
        });
        await client.query(
          `INSERT INTO rabaquino_cristales_stock
             (tipo, subtipo, esf, cil, add_val, ojo, disponible, cantidad, fecha_sync)
           VALUES ${placeholders.join(',')}`,
          valores
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
