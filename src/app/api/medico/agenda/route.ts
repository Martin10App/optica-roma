import { NextRequest, NextResponse } from 'next/server';
import { medicoPool, sesionDesdeRequest, esSyncDelPrograma } from '@/lib/medicoAuth';

// Todo menos receta_foto: la foto se pide aparte por /api/medico/receta, si no
// cada carga de la lista se traería varios MB al pedo.
const COLUMNAS_LISTA = `
  id, codigo, cedula, nombre, fnac, edad, telefono, sena, fecha_sena,
  origen, estado, fecha_agendada, hora_agendada, nota,
  receta_nombre, receta_subida, receta_bajada, venta_id, creado_en, actualizado_en,
  (receta_foto IS NOT NULL) AS tiene_receta
`;

// Campos que el consultorio puede tocar desde la página
const CAMPOS_CONSULTORIO = ['fecha_agendada', 'hora_agendada', 'estado', 'nota'];
// Campos que puede tocar el programa de escritorio
const CAMPOS_PROGRAMA = [...CAMPOS_CONSULTORIO, 'receta_bajada', 'telefono', 'sena', 'edad'];

const ESTADOS = ['pendiente', 'agendado', 'atendido', 'cancelado', 'archivado'];

/**
 * Mantenimiento barato que corre al cargar la lista.
 *  - Archiva los pendientes que quedaron colgados más de 30 días.
 *  - Borra de Neon las fotos de receta que el programa de la óptica ya se bajó
 *    hace más de 90 días. La foto sigue existiendo en el servidor de la óptica
 *    (carpeta imagenes_recetas) y en la ficha del cliente: lo único que se
 *    pierde es poder verla desde esta página. Sin esto la base crecería para
 *    siempre y el plan gratuito de Neon tiene tope de espacio.
 */
async function mantenimiento() {
  await medicoPool.query(`
    UPDATE medico_agenda
       SET estado = 'archivado', actualizado_en = NOW()
     WHERE estado = 'pendiente'
       AND creado_en < NOW() - INTERVAL '30 days'
  `);

  await medicoPool.query(`
    UPDATE medico_agenda
       SET receta_foto = NULL
     WHERE receta_foto IS NOT NULL
       AND receta_bajada IS NOT NULL
       AND receta_bajada < NOW() - INTERVAL '90 days'
  `);
}

export async function GET(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    const esPrograma = esSyncDelPrograma(request);
    if (!sesion && !esPrograma) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Historial del paciente: todas sus citas anteriores, incluidas las que
    // canceló. Sirve para saber, cuando alguien se vuelve a agendar, si ya
    // había faltado antes. No se borra ningún registro nunca, justamente para
    // que esto tenga sentido.
    const histCedula = searchParams.get('historial_cedula');
    if (histCedula) {
      const digitos = histCedula.replace(/\D/g, '');
      if (!digitos) return NextResponse.json({ success: true, data: [] });

      const excluir = searchParams.get('excluir_id') || '0';
      const hist = await medicoPool.query(
        `SELECT id, codigo, estado, sena, fecha_sena, fecha_agendada, hora_agendada,
                origen, receta_subida, creado_en
           FROM medico_agenda
          WHERE regexp_replace(COALESCE(cedula,''), '[^0-9]', '', 'g') = $1::text
            AND id <> $2::int
          ORDER BY COALESCE(fecha_agendada, fecha_sena::date, creado_en::date) DESC
          LIMIT 30`,
        [digitos, excluir]
      );
      return NextResponse.json({ success: true, data: hist.rows });
    }

    await mantenimiento();

    const mes = searchParams.get('mes'); // YYYY-MM
    const soloPendientes = searchParams.get('pendientes') === '1';

    const params: any[] = [];
    let where: string;

    if (soloPendientes) {
      where = "estado = 'pendiente'";
    } else if (mes && /^\d{4}-\d{2}$/.test(mes)) {
      // Del mes pedido: por fecha de seña o por día agendado. Los pendientes
      // van siempre, sin importar el mes, porque son la cola de trabajo.
      params.push(`${mes}-01`);
      where = `(
        to_char(fecha_sena, 'YYYY-MM') = to_char($1::date, 'YYYY-MM')
        OR to_char(fecha_agendada, 'YYYY-MM') = to_char($1::date, 'YYYY-MM')
        OR estado = 'pendiente'
      )`;
    } else {
      where = "(fecha_sena > NOW() - INTERVAL '60 days' OR estado IN ('pendiente','agendado'))";
    }

    const res = await medicoPool.query(
      `SELECT ${COLUMNAS_LISTA} FROM medico_agenda
        WHERE ${where}
        ORDER BY COALESCE(fecha_agendada, fecha_sena::date) DESC NULLS LAST,
                 hora_agendada NULLS LAST, id DESC
        LIMIT 3000`,
      params
    );

    return NextResponse.json({ success: true, data: res.rows });
  } catch (error) {
    console.error('Medico GET agenda error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar la agenda' }, { status: 500 });
  }
}

/**
 * Alta de un cliente en la agenda. Siempre viene del programa de escritorio:
 * automático al guardar una venta con médico VALE, o a mano desde el formulario
 * "Agendar con médico" cuando el cliente no dejó seña.
 * Reintenta sin duplicar: si ya existe esa venta_id o ese código, actualiza.
 */
export async function POST(request: NextRequest) {
  try {
    const esPrograma = esSyncDelPrograma(request);
    const sesion = esPrograma ? null : await sesionDesdeRequest(request);
    if (!esPrograma && !sesion) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const b = await request.json();

    // El consultorio también puede dar de alta (alguien que llamó a la clínica
    // sin haber señado). Pero no puede inventar código de vale, monto de seña
    // ni id de venta: esos los pone la óptica cuando el cliente pasa a señar.
    if (sesion) {
      if (!String(b.nombre || '').trim()) {
        return NextResponse.json({ success: false, error: 'Falta el nombre' }, { status: 400 });
      }
      b.origen = 'consultorio';
      b.codigo = null;
      b.venta_id = null;
      b.sena = null;
      b.fecha_sena = null;
    }

    const codigo = b.codigo || null;
    const ventaId = b.venta_id ?? null;
    const origen = b.origen || 'venta';
    // Un alta del consultorio no lleva fecha de seña (no pagó nada); una venta
    // que no la trae es porque está pasando ahora mismo.
    const fechaSena =
      b.fecha_sena || (origen === 'consultorio' ? null : new Date().toISOString());

    // ¿Ya está? (reintento del programa, o el cliente señó después de pedir turno)
    let existente = null;
    if (ventaId) {
      const r = await medicoPool.query('SELECT id FROM medico_agenda WHERE venta_id = $1', [ventaId]);
      existente = r.rows[0] || null;
    }
    if (!existente && codigo) {
      const r = await medicoPool.query('SELECT id FROM medico_agenda WHERE codigo = $1', [codigo]);
      existente = r.rows[0] || null;
    }

    // El caso de la seña que llega después: la persona ya estaba anotada —
    // porque la agendamos sin seña, o porque la cargó el consultorio— y ahora
    // pasa a dejar los $1000. Hay que actualizar ESA cita, no crear otra:
    // si no, el médico vería a la misma persona dos veces. Se busca por
    // cédula (solo los dígitos, que en las fichas se escribe de mil formas)
    // entre las citas abiertas que todavía no tienen venta asociada.
    if (!existente && b.cedula) {
      const soloDigitos = String(b.cedula).replace(/\D/g, '');
      if (soloDigitos) {
        const r = await medicoPool.query(
          `SELECT id FROM medico_agenda
            WHERE regexp_replace(COALESCE(cedula,''), '[^0-9]', '', 'g') = $1
              AND venta_id IS NULL
              AND estado IN ('pendiente','agendado')
            ORDER BY id DESC LIMIT 1`,
          [soloDigitos]
        );
        existente = r.rows[0] || null;
      }
    }

    if (existente) {
      const res = await medicoPool.query(
        `UPDATE medico_agenda
            SET nombre = COALESCE($1::text, nombre),
                telefono = COALESCE($2::text, telefono),
                sena = COALESCE($3::text, sena),
                fnac = COALESCE($4::text, fnac),
                edad = COALESCE($5::text, edad),
                codigo = COALESCE($6::text, codigo),
                -- Si la cita se adopta al dejar la seña, la marca de "recién
                -- llegó" es ahora: el médico tiene que verlo como reciente.
                fecha_sena = COALESCE($7::timestamptz, fecha_sena,
                                      CASE WHEN $8::int IS NOT NULL THEN NOW() END),
                venta_id = COALESCE($8::int, venta_id),
                -- Al adoptar una cita que estaba sin seña, pasa a ser una venta
                origen = CASE WHEN $8::int IS NOT NULL THEN 'venta' ELSE origen END,
                -- El día y la hora del consultorio mandan: solo se completan si
                -- estaban vacíos, nunca se pisa lo que ya cargó la secretaria.
                fecha_agendada = COALESCE(fecha_agendada, $9::date),
                hora_agendada  = COALESCE(hora_agendada, $10::text),
                estado = CASE WHEN estado = 'pendiente'
                               AND (COALESCE(fecha_agendada, $9::date) IS NOT NULL
                                 OR COALESCE(hora_agendada, $10::text) IS NOT NULL)
                              THEN 'agendado' ELSE estado END,
                actualizado_en = NOW()
          WHERE id = $11::int
        RETURNING ${COLUMNAS_LISTA}`,
        [b.nombre, b.telefono, b.sena, b.fnac, b.edad, codigo,
         b.fecha_sena || null, ventaId,
         b.fecha_agendada || null, b.hora_agendada || null, existente.id]
      );
      return NextResponse.json({ success: true, data: res.rows[0], nuevo: false });
    }

    const res = await medicoPool.query(
      // El estado y la fecha de seña se resuelven acá y no dentro del SQL: al
      // meterlos en un CASE, Postgres no podía inferir el tipo de los
      // parámetros y toda alta fallaba con error 500.
      `INSERT INTO medico_agenda
        (codigo, cedula, nombre, fnac, edad, telefono, sena, fecha_sena, origen,
         estado, venta_id, nota, fecha_agendada, hora_agendada)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::timestamptz,$9::text,$10::text,
               $11::int,$12::text,$13::date,$14::text)
       RETURNING ${COLUMNAS_LISTA}`,
      [
        codigo,
        b.cedula || null,
        b.nombre || null,
        b.fnac || null,
        b.edad || null,
        b.telefono || null,
        b.sena || null,
        fechaSena,
        origen,
        // Si ya viene con día u hora, nace agendado: no hay nada que coordinar
        b.fecha_agendada || b.hora_agendada ? 'agendado' : 'pendiente',
        ventaId,
        b.nota || null,
        b.fecha_agendada || null,
        b.hora_agendada || null,
      ]
    );
    return NextResponse.json({ success: true, data: res.rows[0], nuevo: true });
  } catch (error) {
    console.error('Medico POST agenda error:', error);
    return NextResponse.json({ success: false, error: 'Error al crear el registro' }, { status: 500 });
  }
}

/**
 * Borra un registro de la agenda, con sus mensajes. Solo desde el programa de
 * la óptica: el consultorio puede marcar "no vino / canceló", pero no borrar,
 * para que no se pierda el registro de lo que pasó.
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!esSyncDelPrograma(request)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    await medicoPool.query('DELETE FROM medico_mensajes WHERE agenda_id = $1::int', [id]);
    const res = await medicoPool.query('DELETE FROM medico_agenda WHERE id = $1::int', [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medico DELETE agenda error:', error);
    return NextResponse.json({ success: false, error: 'Error al borrar' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    const esPrograma = esSyncDelPrograma(request);
    if (!sesion && !esPrograma) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const permitidos = esPrograma ? CAMPOS_PROGRAMA : CAMPOS_CONSULTORIO;
    const body = await request.json();
    const campos = Object.keys(body).filter((k) => permitidos.includes(k));
    if (campos.length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos' }, { status: 400 });
    }
    if (body.estado && !ESTADOS.includes(body.estado)) {
      return NextResponse.json({ success: false, error: 'Estado inválido' }, { status: 400 });
    }

    // Cargar una fecha/hora agenda automáticamente al cliente: ya está agendado.
    const sets = campos.map((c, i) => `${c} = $${i + 1}`);
    const valores = campos.map((c) => (body[c] === '' ? null : body[c]));
    if (!body.estado && (body.fecha_agendada || body.hora_agendada)) {
      sets.push("estado = CASE WHEN estado = 'pendiente' THEN 'agendado' ELSE estado END");
    }
    sets.push('actualizado_en = NOW()');
    valores.push(id);

    const res = await medicoPool.query(
      `UPDATE medico_agenda SET ${sets.join(', ')} WHERE id = $${valores.length}
       RETURNING ${COLUMNAS_LISTA}`,
      valores
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    console.error('Medico PATCH agenda error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}
