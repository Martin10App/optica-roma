// Cómo se escriben los filtros del catálogo en la dirección.
//
// Lo principal va en la RUTA, no en ?parámetros:
//   /catalogo                              todo
//   /catalogo/lentes-de-sol                una categoría
//   /catalogo/armazon-con-clip             una marca
//   /catalogo/lentes-de-sol/ray-ban        las dos
//   /catalogo/buscar/A5228ALMA%20C4        una búsqueda
// Motivo: un link como /?marcas=ARMAZON+CON+CLIP#catalogo perdía el
// "?marcas=" en la PC de la óptica y abría el catálogo sin filtrar. Lo que va
// en la ruta no se pierde. Los ?parámetros siguen funcionando (links viejos,
// varias marcas, precio, orden).

import { CATEGORIAS, aSlug, categoriaDesdeParam, nombreMarca } from './catalogoTipos';

export const ORDENES = {
  recientes: 'Recién llegados',
  vendidos: 'Más vendidos',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
} as const;
export type Orden = keyof typeof ORDENES;

export interface FiltrosCatalogo {
  categoria: string | null; // nombre exacto de CATEGORIAS
  marcas: string[]; // slugs, ej. "ray-ban"
  texto: string;
  desde: number | null;
  hasta: number | null;
  orden: Orden;
  ocultarAgotados: boolean;
}

export function filtrosVacios(): FiltrosCatalogo {
  return { categoria: null, marcas: [], texto: '', desde: null, hasta: null, orden: 'recientes', ocultarAgotados: false };
}

/** Todas las formas en que una marca puede venir escrita en un link: "RAYBAN" -> ["ray-ban", "rayban"]. */
export function slugsDeMarca(marca: string) {
  const conNombre = aSlug(nombreMarca(marca));
  const cruda = aSlug(marca);
  return conNombre === cruda ? [conNombre] : [conNombre, cruda];
}

function numero(valor: string | null) {
  if (!valor) return null;
  const n = Number(valor.replace(/\D/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function filtrosDesdeUrl(segmentos: string[], query?: URLSearchParams): FiltrosCatalogo {
  const f = filtrosVacios();
  const tramos = segmentos.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  for (let i = 0; i < tramos.length; i++) {
    const tramo = tramos[i];
    if (tramo === 'buscar') {
      f.texto = tramos[i + 1] ?? '';
      i++;
      continue;
    }
    const categoria = categoriaDesdeParam(tramo);
    if (categoria) f.categoria = categoria;
    else if (aSlug(tramo) && !f.marcas.includes(aSlug(tramo))) f.marcas.push(aSlug(tramo));
  }

  if (query) {
    const categoria = categoriaDesdeParam(query.get('categoria'));
    if (categoria) f.categoria = categoria;
    for (const m of (query.get('marcas') ?? '').split(',')) {
      const slug = aSlug(m);
      if (slug && !f.marcas.includes(slug)) f.marcas.push(slug);
    }
    if (query.get('q')) f.texto = query.get('q') ?? '';
    f.desde = numero(query.get('desde'));
    f.hasta = numero(query.get('hasta'));
    const orden = query.get('orden');
    if (orden && orden in ORDENES) f.orden = orden as Orden;
    f.ocultarAgotados = query.get('agotados') === 'no';
  }
  return f;
}

export function urlDesdeFiltros(f: FiltrosCatalogo) {
  const partes = ['/catalogo'];
  if (f.categoria) partes.push(aSlug(f.categoria));
  const query = new URLSearchParams();
  if (f.marcas.length === 1) partes.push(f.marcas[0]);
  else if (f.marcas.length > 1) query.set('marcas', f.marcas.join(','));
  const texto = f.texto.trim();
  if (texto) {
    if (partes.length === 1) partes.push('buscar', encodeURIComponent(texto));
    else query.set('q', texto);
  }
  if (f.desde != null) query.set('desde', String(f.desde));
  if (f.hasta != null) query.set('hasta', String(f.hasta));
  if (f.orden !== 'recientes') query.set('orden', f.orden);
  if (f.ocultarAgotados) query.set('agotados', 'no');
  const consulta = query.toString();
  return partes.join('/') + (consulta ? `?${consulta}` : '');
}

/** "armazon-con-clip" -> "Armazon Con Clip", mientras no llegan los datos con el nombre real. */
export function marcaDesdeSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
}

export function tituloCatalogo(f: FiltrosCatalogo, nombreDeMarca?: (slug: string) => string | undefined) {
  const marca = f.marcas.length === 1 ? (nombreDeMarca?.(f.marcas[0]) ?? marcaDesdeSlug(f.marcas[0])) : null;
  const categoria = f.categoria ? f.categoria.charAt(0) + f.categoria.slice(1).toLowerCase() : null;
  if (marca && categoria) return { titulo: marca, subtitulo: categoria };
  if (marca) return { titulo: marca, subtitulo: null };
  if (categoria) return { titulo: categoria, subtitulo: null };
  return { titulo: 'Catálogo', subtitulo: null };
}

export const RUTAS_CATEGORIAS = CATEGORIAS.map((c) => ({ categoria: c, ruta: `/catalogo/${aSlug(c)}` }));
