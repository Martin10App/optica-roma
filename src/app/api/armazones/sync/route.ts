import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const maxDuration = 60;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

type ItemLocal = {
  marca?: string;
  codigo?: string;
  color?: string;
  precio_venta?: string | number;
  imagen?: string;
  stock?: string | number;
};

// Sincroniza el catálogo público (armazones_publico) con el inventario real
// del programa de escritorio (public.armazones, PostgreSQL 192.168.1.8).
// A diferencia de rabaquino_cristales_stock, esta tabla tiene campos
// curados a mano para marketing (categoria, mas_vendido, precio_original)
// que NO se deben pisar nunca. Por eso es un UPSERT selectivo, no un
// borrar-y-reinsertar: agrega armazones nuevos con valores por defecto
// razonables, y en los que ya existen solo actualiza precio/foto/stock.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const items: ItemLocal[] = Array.isArray(body.items) ? body.items : [];

    // Salvaguarda de transacción zombie (mismo patrón que cristales-stock)
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
    let insertados = 0;
    let actualizados = 0;
    try {
      await client.query('BEGIN');

      const existentes = await client.query(
        'SELECT id, marca, modelo, precio, imagen_url, stock_visible FROM armazones_publico'
      );
      const mapa = new Map<string, { id: number; precio: string; imagen_url: string | null; stock_visible: boolean }>();
      for (const row of existentes.rows) {
        mapa.set(`${row.marca}||${row.modelo}`, row);
      }

      const nuevos: [string, string, number, string | null, boolean][] = [];
      const cambios: [number, number, string | null, boolean][] = [];

      for (const it of items) {
        const marca = (it.marca || '').trim();
        const codigo = (it.codigo || '').trim();
        const color = (it.color || '').trim();
        const modelo = color ? `${codigo} ${color}` : codigo;
        if (!marca || !modelo) continue;

        const precio = parseFloat(String(it.precio_venta ?? '0')) || 0;
        const imagenUrl = it.imagen ? `/armazones/${it.imagen}` : null;
        const stockNum = parseInt(String(it.stock ?? '0'), 10) || 0;
        const stockVisible = stockNum > 0;

        const key = `${marca}||${modelo}`;
        const existente = mapa.get(key);
        if (!existente) {
          nuevos.push([marca, modelo, precio, imagenUrl, stockVisible]);
        } else {
          const cambioPrecio = Math.abs(Number(existente.precio) - precio) > 0.001;
          const cambioImagen = existente.imagen_url !== imagenUrl;
          const cambioStock = existente.stock_visible !== stockVisible;
          if (cambioPrecio || cambioImagen || cambioStock) {
            cambios.push([existente.id, precio, imagenUrl, stockVisible]);
          }
        }
      }

      // Insertar armazones nuevos, en lotes, con valores por defecto seguros
      // (categoria fija porque esta tabla local es solo armazones de receta;
      // mas_vendido/precio_original quedan para curar a mano después).
      const FILAS_POR_LOTE = 300;
      for (let i = 0; i < nuevos.length; i += FILAS_POR_LOTE) {
        const lote = nuevos.slice(i, i + FILAS_POR_LOTE);
        const valores: unknown[] = [];
        const placeholders = lote.map((row, idx) => {
          const base = idx * 7;
          const [marca, modelo, precio, imagenUrl, stockVisible] = row;
          valores.push(marca, modelo, 'Armazones de Receta', precio, imagenUrl, stockVisible, false);
          return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7})`;
        });
        await client.query(
          `INSERT INTO armazones_publico (marca, modelo, categoria, precio, imagen_url, stock_visible, mas_vendido)
           VALUES ${placeholders.join(',')}`,
          valores
        );
        insertados += lote.length;
      }

      // Actualizar solo lo que cambió, uno por uno por id (suelen ser pocos)
      for (const [id, precio, imagenUrl, stockVisible] of cambios) {
        await client.query(
          'UPDATE armazones_publico SET precio=$1, imagen_url=$2, stock_visible=$3 WHERE id=$4',
          [precio, imagenUrl, stockVisible, id]
        );
        actualizados++;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, insertados, actualizados, recibidos: items.length });
  } catch (error) {
    console.error('Armazones sync error:', error);
    return NextResponse.json({ success: false, error: 'Error al sincronizar armazones' }, { status: 500 });
  }
}

// Temporal: limpiar filas de prueba (marca que arranca con TEST_) usadas para
// validar el POST de arriba antes de correr la sincronización real. Solo
// borra filas cuya marca empieza con "TEST_", nunca puede tocar datos reales.
export async function DELETE(request: NextRequest) {
  const secret = request.headers.get('x-sync-secret');
  if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  const result = await pool.query("DELETE FROM armazones_publico WHERE marca LIKE 'TEST\\_%' ESCAPE '\\'");
  return NextResponse.json({ success: true, borrados: result.rowCount });
}
