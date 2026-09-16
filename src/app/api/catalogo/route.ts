import { NextResponse } from 'next/server';
import { leerCatalogo } from '@/lib/catalogo';

// Dinámica a propósito: si fuera estática, `next build` consultaría Neon y un
// corte de Neon haría fallar el deploy (incluido el de las fotos automáticas).
// El ahorro lo da el Cache-Control: el CDN guarda la respuesta 24 h y después
// la sigue sirviendo mientras la renueva en segundo plano. Cada deploy vacía
// ese caché, y la tarea que publica las fotos nuevas hace deploy justo cuando
// entran armazones nuevos.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await leerCatalogo();
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (error) {
    console.error('Error al leer el catálogo:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo leer el catálogo' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
