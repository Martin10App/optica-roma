'use client';

import { useEffect, useState } from 'react';
import type { Producto } from './catalogoTipos';

// Una sola descarga por visita: "Recién llegados" y el catálogo comparten la
// misma promesa, así la portada pide /api/catalogo una vez y no dos.
let descarga: Promise<Producto[]> | null = null;

function descargarCatalogo() {
  descarga ??= fetch('/api/catalogo')
    .then(async (respuesta) => {
      const json = await respuesta.json();
      if (!respuesta.ok || !json.success) throw new Error(json.error || 'Error al cargar el catálogo');
      return json.data as Producto[];
    })
    .catch((error) => {
      descarga = null; // que "Reintentar" vuelva a pedirlo
      throw error;
    });
  return descarga;
}

export type EstadoCatalogo = 'cargando' | 'listo' | 'error';

export function useCatalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estado, setEstado] = useState<EstadoCatalogo>('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado('cargando');
    descargarCatalogo()
      .then((lista) => {
        if (!vigente) return;
        setProductos(lista);
        setEstado('listo');
      })
      .catch(() => vigente && setEstado('error'));
    return () => {
      vigente = false;
    };
  }, [intento]);

  return { productos, estado, reintentar: () => setIntento((n) => n + 1) };
}
