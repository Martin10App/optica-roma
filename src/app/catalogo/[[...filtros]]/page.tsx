import type { Metadata } from 'next';
import CatalogoPagina from '@/components/catalogo/CatalogoPagina';
import { RUTAS_CATEGORIAS, filtrosDesdeUrl, tituloCatalogo } from '@/lib/catalogoRutas';
import { SITE_URL } from '@/lib/constants';

// La página no consulta nada en el servidor (los productos los baja el
// navegador de /api/catalogo, que está en el caché del CDN): cada ruta se
// genera una vez y queda guardada.
export const dynamic = 'force-static';

type Props = { params: { filtros?: string[] } };

export function generateStaticParams() {
  return [{ filtros: [] }, ...RUTAS_CATEGORIAS.map((r) => ({ filtros: [r.ruta.split('/').pop()!] }))];
}

export function generateMetadata({ params }: Props): Metadata {
  const segmentos = params.filtros ?? [];
  const { titulo, subtitulo } = tituloCatalogo(filtrosDesdeUrl(segmentos));
  const nombre = subtitulo ? `${titulo}: ${subtitulo.toLowerCase()}` : titulo;
  const ruta = `/catalogo${segmentos.length ? `/${segmentos.join('/')}` : ''}`;
  return {
    title: `${nombre} | Óptica Roma`,
    description: `${nombre} en Óptica Roma, Las Piedras y Canelones. Precios en pesos, consultá por WhatsApp.`,
    alternates: { canonical: `${SITE_URL}${ruta}` },
  };
}

export default function Page({ params }: Props) {
  return <CatalogoPagina segmentos={params.filtros ?? []} />;
}
