import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const revalidate = 0; // Disable cache for real-time updates

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
    
    return NextResponse.json({
      success: true,
      data: result.rows.map(row => row.marca)
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
