import { readFile } from 'fs/promises';
import { Pool } from 'pg';
import type { Producto } from './catalogoTipos';

// Solo servidor. Lee el catálogo completo de armazones_publico en UNA consulta.
// Quien lo sirve (/api/catalogo) lo deja en el CDN de Vercel, así que Neon se
// consulta como mucho una vez por día y otra después de cada deploy, en lugar
// de una vez por cada filtro que tocaba cada visitante.

let pool: Pool | null = null;

type Fila = Omit<Producto, 'precio' | 'precio_original'> & {
  precio: string | number;
  precio_original: string | number | null;
  // false = el armazón ya no está en el inventario del programa (lo marca /api/armazones/sync)
  en_inventario?: boolean | null;
};

async function leerNeon(): Promise<Fila[]> {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  // SELECT * y no la lista de columnas: en_inventario la crea la sincronización
  // la primera vez que corre, y nombrarla antes rompería el catálogo entero.
  const { rows } = await pool.query<Fila>('SELECT * FROM armazones_publico ORDER BY id DESC');
  return rows;
}

// Para probar la web en la PC sin tocar Neon: CATALOGO_ARCHIVO_LOCAL apunta a
// un JSON con la misma forma que devuelve /api/catalogo. En Vercel no existe.
async function leerArchivoLocal(ruta: string): Promise<Fila[]> {
  const json = JSON.parse(await readFile(ruta, 'utf-8'));
  return Array.isArray(json) ? json : json.data;
}

function normalizar(fila: Fila): Producto {
  return {
    id: Number(fila.id),
    marca: String(fila.marca ?? '').trim(),
    modelo: String(fila.modelo ?? '').trim(),
    categoria: String(fila.categoria ?? '').trim(),
    precio: Number(fila.precio) || 0,
    precio_original: fila.precio_original == null ? null : Number(fila.precio_original) || null,
    imagen_url: fila.imagen_url || null,
    stock_visible: Boolean(fila.stock_visible),
    mas_vendido: Boolean(fila.mas_vendido),
  };
}

// "CLIENTE" es la fila que usa el programa cuando el cliente trae su propio
// armazón (precio 0): existe en la tabla pero no es algo que se venda.
function esPublicable(producto: Producto) {
  return producto.precio > 0 && producto.marca.toUpperCase() !== 'CLIENTE';
}

export async function leerCatalogo(): Promise<Producto[]> {
  const archivoLocal = process.env.CATALOGO_ARCHIVO_LOCAL;
  const filas = archivoLocal ? await leerArchivoLocal(archivoLocal) : await leerNeon();
  return filas
    .filter((fila) => fila.en_inventario !== false)
    .map(normalizar)
    .filter(esPublicable);
}
