import { NextRequest, NextResponse } from 'next/server';
import { medicoPool, sesionDesdeRequest, esSyncDelPrograma } from '@/lib/medicoAuth';
import { avisar } from '@/lib/medicoPush';

export const maxDuration = 30;

// La página ya comprime la foto antes de mandarla (~150 KB). Este tope es la
// red de seguridad por si alguien sube el original de la cámara sin comprimir.
const MAX_BASE64 = 3_000_000;

/**
 * GET ?id=N        → devuelve la foto de una receta (base64)
 * GET ?pendientes=1 → lista las recetas que el programa todavía no bajó
 */
export async function GET(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    const esPrograma = esSyncDelPrograma(request);
    if (!sesion && !esPrograma) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    if (searchParams.get('pendientes') === '1') {
      if (!esPrograma) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
      }
      const res = await medicoPool.query(`
        SELECT id, codigo, cedula, nombre, receta_nombre, receta_subida, venta_id
          FROM medico_agenda
         WHERE receta_foto IS NOT NULL AND receta_bajada IS NULL
         ORDER BY receta_subida ASC
         LIMIT 50
      `);
      return NextResponse.json({ success: true, data: res.rows });
    }

    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const res = await medicoPool.query(
      'SELECT id, receta_foto, receta_nombre, receta_subida FROM medico_agenda WHERE id = $1',
      [id]
    );
    if (res.rowCount === 0 || !res.rows[0].receta_foto) {
      return NextResponse.json({ success: false, error: 'Sin receta' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    console.error('Medico GET receta error:', error);
    return NextResponse.json({ success: false, error: 'Error al leer la receta' }, { status: 500 });
  }
}

/** El consultorio sube la foto: queda procesado (verde) y esperando que el programa la baje. */
export async function POST(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    if (!sesion) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const { foto, nombre } = await request.json();
    if (!foto || typeof foto !== 'string') {
      return NextResponse.json({ success: false, error: 'Falta la foto' }, { status: 400 });
    }
    if (foto.length > MAX_BASE64) {
      return NextResponse.json(
        { success: false, error: 'La foto es demasiado grande' },
        { status: 413 }
      );
    }

    // Si vuelven a subir una foto de un cliente que ya se bajó, se limpia
    // receta_bajada para que el programa se traiga también la corrección.
    const res = await medicoPool.query(
      `UPDATE medico_agenda
          SET receta_foto = $1,
              receta_nombre = $2,
              receta_subida = NOW(),
              receta_bajada = NULL,
              estado = 'atendido',
              actualizado_en = NOW()
        WHERE id = $3
      RETURNING id, codigo, nombre, estado, receta_subida`,
      [foto, nombre || `receta_${id}.jpg`, id]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    await avisar('optica', {
      titulo: 'Receta nueva',
      cuerpo: 'El médico subió la receta de ' + (res.rows[0].nombre || 'un paciente') + '.',
      tag: 'receta',
    });

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    console.error('Medico POST receta error:', error);
    return NextResponse.json({ success: false, error: 'Error al subir la receta' }, { status: 500 });
  }
}

/** El programa avisa que ya se bajó la foto y la adjuntó a la ficha del cliente. */
export async function PATCH(request: NextRequest) {
  try {
    if (!esSyncDelPrograma(request)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const res = await medicoPool.query(
      `UPDATE medico_agenda SET receta_bajada = NOW(), actualizado_en = NOW()
        WHERE id = $1 RETURNING id`,
      [id]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medico PATCH receta error:', error);
    return NextResponse.json({ success: false, error: 'Error al marcar la receta' }, { status: 500 });
  }
}
