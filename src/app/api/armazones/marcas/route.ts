import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// La lista de marcas solo cambia cuando el programa sincroniza los armazones,
// y eso pasa cada 15 días. Sin caché, cada visita al catálogo de la web
// despertaba Neon (que se paga por tiempo despierta) para leer lo mismo.
// Con una hora de caché en el CDN, mil visitas en esa hora son una sola
// consulta a la base.
export const revalidate = 3600;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('categoria') || '';

    let baseQuery = `
      SELECT DISTINCT marca 
      FROM armazones_publico 
      WHERE stock_visible = true AND marca IS NOT NULL AND marca != ''
    `;
    const queryParams: any[] = [];

    if (category && category !== 'Todas' && category !== 'todas') {
      baseQuery += ` AND LOWER(categoria) = $1`;
      queryParams.push(category.toLowerCase().replace(/-/g, ' '));
    }

    baseQuery += ` ORDER BY marca ASC`;

    const result = await pool.query(baseQuery, queryParams);
    
    // El header es lo que de verdad hace que el CDN de Vercel guarde la
    // respuesta: como la ruta lee `searchParams`, Next la trata como dinámica
    // y `revalidate` por sí solo no alcanzaría.
    return NextResponse.json(
      {
        success: true,
        data: result.rows.map(row => row.marca)
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
