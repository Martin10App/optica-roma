import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio');

    let result;
    if (anio) {
      result = await pool.query(
        'SELECT anio, archivo_nombre, actualizado_at FROM rabaquino_licencias WHERE anio = $1',
        [anio]
      );
    } else {
      result = await pool.query(
        'SELECT anio, archivo_nombre, actualizado_at FROM rabaquino_licencias ORDER BY anio DESC LIMIT 1'
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Rabaquino GET licencias error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar licencias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { anio, archivo_nombre, pdf_base64 } = await request.json();

    if (!anio || !archivo_nombre || !pdf_base64) {
      return NextResponse.json({ success: false, error: 'Faltan datos (anio, archivo_nombre, pdf_base64)' }, { status: 400 });
    }

    const buffer = Buffer.from(pdf_base64, 'base64');

    const result = await pool.query(
      `INSERT INTO rabaquino_licencias (anio, archivo_nombre, archivo_pdf, actualizado_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (anio) DO UPDATE
       SET archivo_nombre = EXCLUDED.archivo_nombre,
           archivo_pdf = EXCLUDED.archivo_pdf,
           actualizado_at = now()
       RETURNING anio, archivo_nombre, actualizado_at`,
      [anio, archivo_nombre, buffer]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino POST licencias error:', error);
    return NextResponse.json({ success: false, error: 'Error al subir licencias' }, { status: 500 });
  }
}
