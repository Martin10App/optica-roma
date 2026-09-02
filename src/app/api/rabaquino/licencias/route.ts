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

    const campos = 'anio, archivo_nombre, actualizado_at, ultimo_empleado, ultima_fecha_dia_txt, ultima_accion';
    let result;
    if (anio) {
      result = await pool.query(
        `SELECT ${campos} FROM rabaquino_licencias WHERE anio = $1`,
        [anio]
      );
    } else {
      result = await pool.query(
        `SELECT ${campos} FROM rabaquino_licencias ORDER BY anio DESC LIMIT 1`
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Rabaquino GET licencias error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar licencias' }, { status: 500 });
  }
}

// Sube el PDF de licencias del año. Lo llama SOLO el programa de escritorio
// (exportar_licencias_pdf), que ya venía mandando el header; el portal de esta
// ruta solo hace GET, así que exigir el secreto no le cambia nada a Rabaquino.
// Sin esto, cualquiera con la URL podía reemplazar el PDF de todo el año.
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret');
    if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { anio, archivo_nombre, pdf_base64, empleado_nombre, fecha_dia_txt, accion } = await request.json();

    if (!anio || !archivo_nombre || !pdf_base64) {
      return NextResponse.json({ success: false, error: 'Faltan datos (anio, archivo_nombre, pdf_base64)' }, { status: 400 });
    }

    const buffer = Buffer.from(pdf_base64, 'base64');

    const result = await pool.query(
      `INSERT INTO rabaquino_licencias (anio, archivo_nombre, archivo_pdf, actualizado_at, ultimo_empleado, ultima_fecha_dia_txt, ultima_accion)
       VALUES ($1, $2, $3, now(), $4, $5, $6)
       ON CONFLICT (anio) DO UPDATE
       SET archivo_nombre = EXCLUDED.archivo_nombre,
           archivo_pdf = EXCLUDED.archivo_pdf,
           actualizado_at = now(),
           ultimo_empleado = EXCLUDED.ultimo_empleado,
           ultima_fecha_dia_txt = EXCLUDED.ultima_fecha_dia_txt,
           ultima_accion = EXCLUDED.ultima_accion
       RETURNING anio, archivo_nombre, actualizado_at, ultimo_empleado, ultima_fecha_dia_txt, ultima_accion`,
      [anio, archivo_nombre, buffer, empleado_nombre || null, fecha_dia_txt || null, accion || null]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino POST licencias error:', error);
    return NextResponse.json({ success: false, error: 'Error al subir licencias' }, { status: 500 });
  }
}
