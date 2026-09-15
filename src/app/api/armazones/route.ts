import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const revalidate = 3600; // ver el Cache-Control del GET, más abajo

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  // Tope: el catálogo pide de a 12. Sin tope, cualquiera podía pedir los
  // +1200 armazones de una vez y cada pedido así es transferencia de Neon.
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
  const offset = (page - 1) * limit;

  const category = searchParams.get('categoria') || '';
  const sort = searchParams.get('sort') || 'newest';
  const brands = searchParams.get('marcas') ? searchParams.get('marcas')!.split(',') : [];

  try {
    let baseQuery = `FROM armazones_publico WHERE 1=1`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (category) {
      baseQuery += ` AND LOWER(categoria) = $${paramIndex}`;
      queryParams.push(category.toLowerCase().replace(/-/g, ' '));
      paramIndex++;
    }

    if (brands.length > 0) {
      const placeholders = brands.map((_, i) => `LOWER($${paramIndex + i})`).join(', ');
      baseQuery += ` AND LOWER(marca) IN (${placeholders})`;
      queryParams.push(...brands.map(m => m.toLowerCase()));
      paramIndex += brands.length;
    }

    // Fetch total count for pagination
    const countResult = await pool.query(`
      SELECT COUNT(*) 
      ${baseQuery}
    `, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // "Más recientes" es el orden por defecto del catálogo y antes no tenía
    // rama propia: caía en ventas_count, así que los armazones recién cargados
    // nunca aparecían primero. El id lo pone la sincronización al insertar,
    // así que id DESC = lo último que entró. En todos los órdenes los agotados
    // van al final, para que la primera página muestre lo que se puede comprar.
    let orderClause = 'ORDER BY stock_visible DESC, id DESC';
    if (sort === 'price_asc') orderClause = 'ORDER BY stock_visible DESC, precio ASC, id DESC';
    if (sort === 'price_desc') orderClause = 'ORDER BY stock_visible DESC, precio DESC, id DESC';
    if (sort === 'bestsellers') orderClause = 'ORDER BY stock_visible DESC, mas_vendido DESC, ventas_count DESC, id DESC';

    // Fetch paginated products
    const result = await pool.query(`
      SELECT id, modelo, marca, categoria, precio, precio_original, imagen_url, stock_visible, mas_vendido 
      ${baseQuery} 
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
    
    // Sin este header, cada visitante que abre el catálogo o toca un filtro
    // despierta Neon (que se paga por tiempo despierta), incluso de noche o el
    // domingo con la óptica cerrada. `revalidate` por sí solo no alcanza: como
    // la ruta lee `searchParams`, Next la trata como dinámica y no la cachea.
    // Una hora es de sobra: los armazones se sincronizan cada 15 días.
    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}
