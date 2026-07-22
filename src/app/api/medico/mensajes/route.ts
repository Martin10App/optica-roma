import { NextRequest, NextResponse } from 'next/server';
import { medicoPool, sesionDesdeRequest, esSyncDelPrograma } from '@/lib/medicoAuth';
import { avisar } from '@/lib/medicoPush';

// El chat es el registro de lo hablado, así que no se borra nada: solo se marca leído.
// agenda_id NULL = canal general (avisos que no son de ningún cliente en particular).

type Quien = { autor: 'optica' | 'consultorio'; nombre: string | null };

async function quienEs(request: Request): Promise<Quien | null> {
  const sesion = await sesionDesdeRequest(request);
  if (sesion) {
    return {
      autor: sesion.rol === 'optica' ? 'optica' : 'consultorio',
      nombre: sesion.nombre || sesion.usuario,
    };
  }
  // El programa de escritorio escribe siempre como la óptica
  if (esSyncDelPrograma(request)) return { autor: 'optica', nombre: 'Óptica' };
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const quien = await quienEs(request);
    if (!quien) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Contadores para el globito de "sin leer" de cada lado
    if (searchParams.get('no_leidos') === '1') {
      const col = quien.autor === 'optica' ? 'leido_optica' : 'leido_consultorio';
      const res = await medicoPool.query(
        `SELECT agenda_id, COUNT(*)::int AS cantidad
           FROM medico_mensajes
          WHERE ${col} = FALSE AND autor <> $1
          GROUP BY agenda_id`,
        [quien.autor]
      );
      const total = res.rows.reduce((a, r) => a + r.cantidad, 0);
      return NextResponse.json({ success: true, data: res.rows, total });
    }

    const agendaId = searchParams.get('agenda_id');
    const where = agendaId ? 'agenda_id = $1' : 'agenda_id IS NULL';
    const params = agendaId ? [agendaId] : [];

    const res = await medicoPool.query(
      `SELECT id, agenda_id, autor, autor_nombre, texto, creado_en
         FROM medico_mensajes
        WHERE ${where}
        ORDER BY creado_en ASC, id ASC
        LIMIT 500`,
      params
    );
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error) {
    console.error('Medico GET mensajes error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar el chat' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const quien = await quienEs(request);
    if (!quien) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { agenda_id, texto } = await request.json();
    const limpio = String(texto || '').trim();
    if (!limpio) {
      return NextResponse.json({ success: false, error: 'Mensaje vacío' }, { status: 400 });
    }
    if (limpio.length > 2000) {
      return NextResponse.json({ success: false, error: 'Mensaje demasiado largo' }, { status: 400 });
    }

    // El que escribe ya lo tiene leído; el otro lado lo ve como pendiente.
    const res = await medicoPool.query(
      `INSERT INTO medico_mensajes
         (agenda_id, autor, autor_nombre, texto, leido_optica, leido_consultorio)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, agenda_id, autor, autor_nombre, texto, creado_en`,
      [
        agenda_id || null,
        quien.autor,
        quien.nombre,
        limpio,
        quien.autor === 'optica',
        quien.autor === 'consultorio',
      ]
    );
    // Avisar al otro lado, no a quien escribió
    const destino = quien.autor === 'optica' ? 'consultorio' : 'optica';
    let sobre = '';
    if (agenda_id) {
      const p = await medicoPool.query(
        'SELECT nombre FROM medico_agenda WHERE id = $1::int', [agenda_id]);
      if (p.rows[0]?.nombre) sobre = ' · ' + p.rows[0].nombre;
    }
    await avisar(destino, {
      titulo: 'Mensaje de ' + (quien.nombre || (quien.autor === 'optica' ? 'la óptica' : 'el consultorio')) + sobre,
      cuerpo: limpio.length > 120 ? limpio.slice(0, 117) + '…' : limpio,
      tag: 'chat-' + (agenda_id || 'general'),
    });

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    console.error('Medico POST mensajes error:', error);
    return NextResponse.json({ success: false, error: 'Error al enviar el mensaje' }, { status: 500 });
  }
}

/** Marca como leídos los mensajes del otro lado (de un cliente, o del canal general). */
export async function PATCH(request: NextRequest) {
  try {
    const quien = await quienEs(request);
    if (!quien) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agendaId = searchParams.get('agenda_id');
    const col = quien.autor === 'optica' ? 'leido_optica' : 'leido_consultorio';
    const params: any[] = [quien.autor];
    const where = agendaId ? `agenda_id = $${params.push(agendaId)}` : 'agenda_id IS NULL';

    await medicoPool.query(
      `UPDATE medico_mensajes SET ${col} = TRUE
        WHERE ${where} AND ${col} = FALSE AND autor <> $1`,
      params
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medico PATCH mensajes error:', error);
    return NextResponse.json({ success: false, error: 'Error al marcar leídos' }, { status: 500 });
  }
}
