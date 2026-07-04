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
        'SELECT archivo_nombre, archivo_pdf FROM rabaquino_licencias WHERE anio = $1',
        [anio]
      );
    } else {
      result = await pool.query(
        'SELECT archivo_nombre, archivo_pdf FROM rabaquino_licencias ORDER BY anio DESC LIMIT 1'
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay documento de licencias' }, { status: 404 });
    }

    const { archivo_nombre, archivo_pdf } = result.rows[0];

    return new NextResponse(archivo_pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${archivo_nombre}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Rabaquino GET licencias pdf error:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener el PDF' }, { status: 500 });
  }
}
