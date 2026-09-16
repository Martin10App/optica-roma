// Tipos y utilidades del catálogo que se usan en el servidor y en el navegador.
// No importar `pg` ni nada de Node acá: este archivo llega al bundle del cliente.

export interface Producto {
  id: number;
  marca: string;
  modelo: string;
  categoria: string;
  precio: number;
  precio_original: number | null;
  imagen_url: string | null;
  stock_visible: boolean;
  mas_vendido: boolean;
}

export const CATEGORIAS = [
  'Armazones de Receta',
  'Lentes de Sol',
  'Lentes de Contacto',
  'Accesorios',
] as const;

/** Minúsculas, sin tildes y con guiones como espacios, para comparar textos. */
export function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * "Armazones de Receta" -> "armazones-de-receta", "REEF|" -> "reef".
 * Es el formato de las rutas del catálogo (/catalogo/lentes-de-sol/ray-ban):
 * solo letras, números y guiones, para que un link nunca se rompa al copiarlo.
 */
export function aSlug(texto: string) {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Acepta el valor de `?categoria=` (o un tramo de la ruta) y devuelve la categoría exacta, o null. */
export function categoriaDesdeParam(param: string | null) {
  if (!param) return null;
  return CATEGORIAS.find((c) => aSlug(c) === aSlug(param)) ?? null;
}

// En la base las marcas están en mayúsculas ("ALMA SANTA"). En pantalla se
// muestran como se escriben de verdad; las que no siguen la regla general van acá.
const MARCAS_ESCRITAS: Record<string, string> = {
  RAYBAN: 'Ray-Ban',
  JBX: 'JBX',
  DIVERONA: 'Di Verona',
  OCEANBLUE: 'Ocean Blue',
};

export function nombreMarca(marca: string) {
  const limpia = marca.trim();
  const exacta = MARCAS_ESCRITAS[limpia.toUpperCase()];
  if (exacta) return exacta;
  // Las que ya vienen con mayúsculas y minúsculas ("Alcon", "CooperVision") se respetan.
  if (limpia !== limpia.toUpperCase()) return limpia;
  return limpia.toLowerCase().replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
}

const formatoPesos = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio: number) {
  return formatoPesos.format(precio);
}
