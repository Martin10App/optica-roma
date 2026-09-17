// Decide qué hacer con armazones_publico a partir del inventario que manda el
// programa de escritorio. No toca la base: devuelve un plan que la ruta
// /api/armazones/sync ejecuta. Separado así para poder probarlo con datos reales.
//
// En el programa un armazón es único por código + color (así lo busca para
// editarlo y para descontar stock); la marca se puede corregir. Antes la
// sincronización identificaba cada fila por marca + modelo, así que al corregir
// una marca ("ACETRATO" → "GASOIL") insertaba una fila nueva y la vieja quedaba
// publicada para siempre, con la marca mal escrita y a veces con otro precio.
//
// Ahora:
// - Si llega una marca + modelo que no existe pero hay una fila vieja con el
//   mismo modelo que ya no está en el inventario, se le corrige la marca a esa
//   fila (conserva su id, su categoría y lo curado a mano).
// - Las filas de armazones que ya no están en el inventario se marcan
//   en_inventario = false y la web no las muestra. No se borra nada: si el
//   armazón vuelve a cargarse, la fila se reactiva sola.
// - La categoría (receta o sol) la elige el programa al cargar el armazón
//   (desde septiembre de 2026). Si un armazón llega sin categoría, se deja la
//   que tenga la fila; si es nuevo, entra como receta.

export type FilaPublica = {
  id: number;
  marca: string;
  modelo: string;
  categoria: string | null;
  precio: string | number;
  imagen_url: string | null;
  stock_visible: boolean;
  en_inventario?: boolean | null;
};

export type ItemLocal = {
  marca?: string;
  codigo?: string;
  color?: string;
  stock?: string | number;
  precio_venta?: string | number;
  imagen?: string;
  categoria?: string | null;
};

type Armazon = {
  marca: string;
  modelo: string;
  precio: number;
  imagenUrl: string | null;
  stockVisible: boolean;
  /** null: el programa no la mandó y se conserva la que haya */
  categoria: CategoriaArmazon | null;
};

export type CambioFila = Armazon & { id: number; renombrada: boolean; recategorizada: boolean };

export type PlanSincronizacion = {
  nuevos: Armazon[];
  cambios: CambioFila[];
  /** ids que dejan de mostrarse porque ya no están en el inventario */
  bajas: number[];
  /** bajas que no se aplicaron porque el inventario recibido vino demasiado corto */
  bajasRetenidas: number;
};

// Categorías que vienen del programa. Lentes de contacto y accesorios se cargan
// a mano en la web y no están en el inventario: nunca se dan de baja.
const CATEGORIAS_DEL_PROGRAMA = new Set(['armazones de receta', 'lentes de sol']);

export const CATEGORIA_RECETA = 'Armazones de Receta';
export const CATEGORIA_SOL = 'Lentes de Sol';
export type CategoriaArmazon = typeof CATEGORIA_RECETA | typeof CATEGORIA_SOL;

/** Lo que manda el programa → el nombre exacto que usa la web (o null) */
export function categoriaDelPrograma(valor: unknown): CategoriaArmazon | null {
  const texto = String(valor ?? '').trim().toLowerCase();
  if (texto === 'sol' || texto === 'lentes de sol') return CATEGORIA_SOL;
  if (texto === 'receta' || texto === 'armazones de receta') return CATEGORIA_RECETA;
  return null;
}

// Si el inventario recibido tiene menos del 80% de los armazones publicados, no
// se da de baja nada: es más probable una lectura incompleta que un borrado real.
const MINIMO_PARA_BAJAS = 0.8;

const clave = (marca: string, modelo: string) => `${marca}||${modelo}`;

// Solo se cambia entre receta y sol, y solo si el programa dijo cuál es
const cambiaCategoria = (fila: FilaPublica, armazon: Armazon) =>
  armazon.categoria !== null &&
  CATEGORIAS_DEL_PROGRAMA.has((fila.categoria || '').trim().toLowerCase()) &&
  fila.categoria !== armazon.categoria;
const mayus = (texto: string) => texto.trim().toUpperCase();

export function armazonDesdeItem(it: ItemLocal): Armazon | null {
  const marca = (it.marca || '').trim();
  const codigo = (it.codigo || '').trim();
  const color = (it.color || '').trim();
  const modelo = color ? `${codigo} ${color}` : codigo;
  if (!marca || !modelo) return null;
  return {
    marca,
    modelo,
    precio: parseFloat(String(it.precio_venta ?? '0')) || 0,
    imagenUrl: it.imagen ? `/armazones/${it.imagen}` : null,
    stockVisible: (parseInt(String(it.stock ?? '0'), 10) || 0) > 0,
    categoria: categoriaDelPrograma(it.categoria),
  };
}

export function planificarArmazonesPublico(existentes: FilaPublica[], items: ItemLocal[]): PlanSincronizacion {
  // Último valor por clave, igual que antes
  const entrantes = new Map<string, Armazon>();
  for (const it of items) {
    const armazon = armazonDesdeItem(it);
    if (armazon) entrantes.set(clave(armazon.marca, armazon.modelo), armazon);
  }

  const delPrograma = existentes.filter((f) => CATEGORIAS_DEL_PROGRAMA.has((f.categoria || '').trim().toLowerCase()));

  // Si una clave estuviera repetida en la tabla, se usa la fila más nueva
  const porClave = new Map<string, FilaPublica>();
  for (const fila of [...existentes].sort((a, b) => a.id - b.id)) {
    porClave.set(clave(fila.marca, fila.modelo), fila);
  }

  // Filas viejas por modelo: candidatas a recibir una marca corregida
  const viejasPorModelo = new Map<string, FilaPublica[]>();
  for (const fila of delPrograma) {
    if (entrantes.has(clave(fila.marca, fila.modelo))) continue;
    const lista = viejasPorModelo.get(mayus(fila.modelo)) ?? [];
    lista.push(fila);
    viejasPorModelo.set(mayus(fila.modelo), lista);
  }
  viejasPorModelo.forEach((lista) => lista.sort((a, b) => b.id - a.id));

  const usadas = new Set<number>();
  const nuevos: Armazon[] = [];
  const cambios: CambioFila[] = [];

  entrantes.forEach((armazon, k) => {
    const existente = porClave.get(k);
    if (existente) {
      usadas.add(existente.id);
      const cambioPrecio = Math.abs(Number(existente.precio) - armazon.precio) > 0.001;
      const cambioImagen = existente.imagen_url !== armazon.imagenUrl;
      const cambioStock = existente.stock_visible !== armazon.stockVisible;
      const reaparece = existente.en_inventario === false;
      const recategorizada = cambiaCategoria(existente, armazon);
      if (cambioPrecio || cambioImagen || cambioStock || reaparece || recategorizada) {
        cambios.push({ ...armazon, marca: existente.marca, id: existente.id, renombrada: false, recategorizada });
      }
      return;
    }

    const vieja = viejasPorModelo.get(mayus(armazon.modelo))?.find((f) => !usadas.has(f.id));
    if (vieja) {
      usadas.add(vieja.id);
      cambios.push({ ...armazon, id: vieja.id, renombrada: true, recategorizada: cambiaCategoria(vieja, armazon) });
      return;
    }

    nuevos.push(armazon);
  });

  const bajas = delPrograma.filter((f) => !usadas.has(f.id) && f.en_inventario !== false).map((f) => f.id);
  const publicadas = delPrograma.filter((f) => f.en_inventario !== false).length;
  const inventarioCompleto = entrantes.size >= publicadas * MINIMO_PARA_BAJAS;

  return {
    nuevos,
    cambios,
    bajas: inventarioCompleto ? bajas : [],
    bajasRetenidas: inventarioCompleto ? 0 : bajas.length,
  };
}
