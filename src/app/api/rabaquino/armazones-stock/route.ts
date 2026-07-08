import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const maxDuration = 60;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

const CAMPOS_ARMAZON = [
  'marca', 'codigo', 'material', 'color', 'stock',
  'precio_venta', 'precio_costo', 'proveedor', 'ubicacion',
  'k', 'a', 'd', 'p', 'notas', 'imagen', 'stock_rabaquino',
];

type ItemSync = {
  marca?: string;
  codigo?: string;
  material?: string;
  color?: string;
  stock?: string | number;
  precio_venta?: string | number;
  precio_costo?: string | number;
  proveedor?: string;
  ubicacion?: string;
  k?: string;
  a?: string;
  d?: string;
  p?: string;
  notas?: string;
  imagen?: string;
};

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM rabaquino_armazones_stock ORDER BY created_at DESC LIMIT 2000'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Rabaquino GET armazones-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar stock de armazones' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const body = await request.json();
    const campos = Object.keys(body).filter((k) => CAMPOS_ARMAZON.includes(k));
    if (campos.length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos' }, { status: 400 });
    }

    const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const valores = campos.map((c) => body[c]);
    valores.push(id);

    const result = await pool.query(
      `UPDATE rabaquino_armazones_stock SET ${sets} WHERE id = $${valores.length} RETURNING *`,
      valores
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Armazón no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino PATCH armazones-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar stock' }, { status: 500 });
  }
}

// Sincroniza rabaquino_armazones_stock con el inventario real del programa
// de escritorio (public.armazones). NUNCA toca stock_rabaquino en filas que
// ya existen — ese campo lo edita el laboratorio Rabaquino a mano desde el
// portal y es independiente del stock real de Óptica Roma.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const items: ItemSync[] = Array.isArray(body.items) ? body.items : [];

    await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND state = 'idle in transaction'
        AND now() - xact_start > interval '20 seconds'
        AND query ILIKE '%rabaquino_armazones_stock%'
    `);

    const client = await pool.connect();
    let insertados = 0;
    let actualizados = 0;
    try {
      await client.query('BEGIN');

      const existentes = await client.query(
        `SELECT id, marca, codigo, color, material, stock, precio_venta, precio_costo,
                proveedor, ubicacion, k, a, d, p, notas, imagen
         FROM rabaquino_armazones_stock`
      );
      const mapa = new Map<string, any>();
      for (const row of existentes.rows) {
        mapa.set(`${row.marca}||${row.codigo}||${row.color}`, row);
      }

      const CAMPOS_COMPARABLES = [
        'material', 'stock', 'precio_venta', 'precio_costo',
        'proveedor', 'ubicacion', 'k', 'a', 'd', 'p', 'notas', 'imagen',
      ] as const;

      const nuevos: ItemSync[] = [];
      const cambios: { id: number; item: ItemSync }[] = [];

      for (const it of items) {
        const marca = (it.marca || '').trim();
        const codigo = (it.codigo || '').trim();
        const color = (it.color || '').trim();
        if (!marca || !codigo) continue;

        const key = `${marca}||${codigo}||${color}`;
        const existente = mapa.get(key);
        if (!existente) {
          nuevos.push(it);
        } else {
          const cambio = CAMPOS_COMPARABLES.some(
            (campo) => String(existente[campo] ?? '') !== String((it as any)[campo] ?? '')
          );
          if (cambio) cambios.push({ id: existente.id, item: it });
        }
      }

      const FILAS_POR_LOTE = 300;
      for (let i = 0; i < nuevos.length; i += FILAS_POR_LOTE) {
        const lote = nuevos.slice(i, i + FILAS_POR_LOTE);
        const valores: unknown[] = [];
        const placeholders = lote.map((it, idx) => {
          const base = idx * 15;
          valores.push(
            it.marca, it.codigo, it.material || '', it.color || '',
            it.stock ?? '0', it.precio_venta ?? '', it.precio_costo ?? '',
            it.proveedor || '', it.ubicacion || '', it.k || '', it.a || '',
            it.d || '', it.p || '', it.notas || '', it.imagen || ''
          );
          const nums = Array.from({ length: 15 }, (_, j) => `$${base + j + 1}`);
          return `(${nums.join(',')}, 0)`; // stock_rabaquino=0 por defecto en filas nuevas
        });
        await client.query(
          `INSERT INTO rabaquino_armazones_stock
             (marca, codigo, material, color, stock, precio_venta, precio_costo,
              proveedor, ubicacion, k, a, d, p, notas, imagen, stock_rabaquino)
           VALUES ${placeholders.join(',')}`,
          valores
        );
        insertados += lote.length;
      }

      for (const { id, item } of cambios) {
        await client.query(
          `UPDATE rabaquino_armazones_stock SET
             material=$1, stock=$2, precio_venta=$3, precio_costo=$4,
             proveedor=$5, ubicacion=$6, k=$7, a=$8, d=$9, p=$10, notas=$11, imagen=$12
           WHERE id=$13`,
          [
            item.material || '', item.stock ?? '0', item.precio_venta ?? '', item.precio_costo ?? '',
            item.proveedor || '', item.ubicacion || '', item.k || '', item.a || '',
            item.d || '', item.p || '', item.notas || '', item.imagen || '', id,
          ]
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
    console.error('Rabaquino POST armazones-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al sincronizar armazones' }, { status: 500 });
  }
}
