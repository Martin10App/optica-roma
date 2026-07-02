import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;
  const search = searchParams.get('search') || '';

  try {
    let baseQuery = `FROM armazones_publico`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      baseQuery += ` WHERE modelo ILIKE $${paramIndex} OR marca ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, queryParams);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT id, modelo, marca, categoria, precio, precio_original, stock_visible, imagen_url 
      ${baseQuery} 
      ORDER BY id DESC
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
    console.error('Error fetching admin catalog:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, precio, precio_original, categoria } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const result = await pool.query(`
      UPDATE armazones_publico
      SET precio = $1, categoria = $2, precio_original = $3
      WHERE id = $4
      RETURNING *
    `, [precio, categoria, precio_original !== undefined ? (precio_original === 0 ? null : precio_original) : null, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const modelo = formData.get('modelo') as string;
    const marca = formData.get('marca') as string;
    const categoria = formData.get('categoria') as string;
    const precio = parseFloat(formData.get('precio') as string);
    const image = formData.get('image') as File | null;

    if (!modelo || !marca || !categoria) {
      return NextResponse.json({ success: false, error: 'Modelo, marca y categoría son requeridos' }, { status: 400 });
    }

    let imagenUrl = null;

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${image.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const path = join(process.cwd(), 'public', 'media', filename);
      await writeFile(path, buffer);
      imagenUrl = `/media/${filename}`;
    }

    const result = await pool.query(`
      INSERT INTO armazones_publico (modelo, marca, categoria, precio, stock_visible, imagen_url)
      VALUES ($1, $2, $3, $4, true, $5)
      RETURNING *
    `, [modelo, marca, categoria, isNaN(precio) ? 0 : precio, imagenUrl]);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
