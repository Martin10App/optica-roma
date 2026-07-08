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

// Punto único de sincronización de armazones: el programa de escritorio manda
// UNA sola vez todo el inventario real (public.armazones, PostgreSQL
// 192.168.1.8) y esta ruta lo reparte a los dos catálogos que dependen de él:
//   1. armazones_publico  → catálogo de la tienda online (opticaroma.store)
//   2. rabaquino_armazones_stock → portal del laboratorio Rabaquino
// Los dos tienen campos curados a mano que esta sincronización NUNCA debe
// pisar: armazones_publico tiene categoria/mas_vendido/precio_original
// (marketing), y rabaquino_armazones_stock tiene stock_rabaquino (lo edita
// el laboratorio desde su propio portal). Por eso es un UPSERT selectivo en
// los dos casos, no un borrar-y-reinsertar.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const items: ItemLocal[] = Array.isArray(body.items) ? body.items : [];

    const publico = await sincronizarArmazonesPublico(items);
    const rabaquino = await sincronizarRabaquinoStock(items);

    return NextResponse.json({
      success: true,
      recibidos: items.length,
      publico,
      rabaquino,
    });
  } catch (error) {
    console.error('Armazones sync error:', error);
    return NextResponse.json({ success: false, error: 'Error al sincronizar armazones' }, { status: 500 });
  }
}

async function sincronizarArmazonesPublico(items: ItemLocal[]) {
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

  return { insertados, actualizados };
}

async function sincronizarRabaquinoStock(items: ItemLocal[]) {
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

    const nuevos: ItemLocal[] = [];
    const cambios: { id: number; item: ItemLocal }[] = [];

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

  return { insertados, actualizados };
}
