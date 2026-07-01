import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const revalidate = 60; // Cache for 60 seconds

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
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

    let orderClause = 'ORDER BY id DESC';
    if (sort === 'price_asc') orderClause = 'ORDER BY precio ASC, id DESC';
    if (sort === 'price_desc') orderClause = 'ORDER BY precio DESC, id DESC';

    // Fetch paginated products
    const result = await pool.query(`
      SELECT id, modelo, marca, categoria, precio, precio_original, imagen_url, stock_visible, mas_vendido 
      ${baseQuery} 
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}
