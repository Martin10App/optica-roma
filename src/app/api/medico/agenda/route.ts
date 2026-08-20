import { NextRequest, NextResponse } from 'next/server';
import { medicoPool, sesionDesdeRequest, esSyncDelPrograma } from '@/lib/medicoAuth';
import { avisar } from '@/lib/medicoPush';

// Todo menos receta_foto: la foto se pide aparte por /api/medico/receta, si no
// cada carga de la lista se traería varios MB al pedo.
const COLUMNAS_LISTA = `
  id, codigo, cedula, nombre, fnac, edad, telefono, total, sena, saldo, fecha_sena,
  origen, estado, fecha_agendada, hora_agendada, nota, es_recontrol, motivo,
  receta_nombre, receta_subida, receta_bajada, venta_id, creado_en, actualizado_en,
  (receta_foto IS NOT NULL) AS tiene_receta
`;

// Lo único que el consultorio puede tocar: coordinar el turno y anotar.
// Los datos del paciente (nombre, cédula, seña) son de la óptica, que es
// quien los tomó en el mostrador — el consultorio es un invitado acá.
const CAMPOS_CONSULTORIO = ['fecha_agendada', 'hora_agendada', 'estado', 'nota'];
// La óptica, desde la página, edita además los datos del paciente y puede
// marcar/desmarcar el recontrol con su motivo
const CAMPOS_OPTICA = [
  ...CAMPOS_CONSULTORIO,
  'nombre', 'cedula', 'telefono', 'fnac', 'edad', 'total', 'sena', 'saldo',
  'es_recontrol', 'motivo',
];
// El programa de escritorio, además, marca las recetas como bajadas
const CAMPOS_PROGRAMA = [...CAMPOS_OPTICA, 'receta_bajada'];

const ESTADOS = ['pendiente', 'agendado', 'atendido', 'cancelado', 'archivado'];

let columnasPagoListas = false;

/** Mantiene compatible el despliegue aunque /setup todavía no se haya corrido. */
async function asegurarColumnasPago() {
  if (columnasPagoListas) return;
  await medicoPool.query('ALTER TABLE medico_agenda ADD COLUMN IF NOT EXISTS total TEXT');
  await medicoPool.query('ALTER TABLE medico_agenda ADD COLUMN IF NOT EXISTS saldo TEXT');
  columnasPagoListas = true;
}

function importe(valor: unknown): number {
  return Number(String(valor || '').replace(/[^\d]/g, '')) || 0;
}

function estaPago(datos: any): boolean {
  return importe(datos?.total) > 0 && importe(datos?.saldo) <= 0;
}

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
    await asegurarColumnasPago();

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
 * Alta de un cliente en la agenda. Puede venir del programa de escritorio
 * después de una seña/pago, o del consultorio para reservarle un turno antes
 * de que pase por la óptica. Reintenta sin duplicar y la venta posterior adopta
 * el registro manual por cédula.
 */
export async function POST(request: NextRequest) {
  try {
    const esPrograma = esSyncDelPrograma(request);
    const sesion = esPrograma ? null : await sesionDesdeRequest(request);
    if (!esPrograma && !sesion) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    await asegurarColumnasPago();

    const b = await request.json();

    const esAltaConsultorio = sesion?.rol === 'consultorio';

    // El alta manual queda limitada al consultorio. El usuario de la óptica
    // sigue usando el programa de escritorio, que incluye los datos de pago.
    if (sesion && !esAltaConsultorio) {
      return NextResponse.json(
        { success: false, error: 'Las altas se realizan desde la óptica' },
        { status: 403 }
      );
    }

    if (esAltaConsultorio) {
      const nombre = String(b.nombre || '').trim().replace(/\s+/g, ' ').toUpperCase();
      const cedula = String(b.cedula || '').replace(/\D/g, '');
      const telefono = String(b.telefono || '').trim();
      const fecha = String(b.fecha_agendada || '').trim();
      const hora = String(b.hora_agendada || '').trim();

      if (!nombre) {
        return NextResponse.json({ success: false, error: 'Falta el nombre del paciente' }, { status: 400 });
      }
      if (cedula.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Ingresá una cédula válida para evitar duplicados' },
          { status: 400 }
        );
      }
      if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return NextResponse.json({ success: false, error: 'La fecha no es válida' }, { status: 400 });
      }
      if (hora && !/^\d{2}:\d{2}$/.test(hora)) {
        return NextResponse.json({ success: false, error: 'La hora no es válida' }, { status: 400 });
      }

      // No se aceptan importes ni datos de venta desde esta pantalla. Esos
      // campos los completa después el programa cuando el paciente deja seña.
      Object.assign(b, {
        nombre,
        cedula,
        telefono: telefono || null,
        total: null,
        sena: null,
        saldo: null,
        fecha_sena: null,
        origen: 'consultorio',
        venta_id: null,
        codigo: null,
        es_recontrol: false,
        motivo: null,
        fecha_agendada: fecha || null,
        hora_agendada: hora || null,
        nota: String(b.nota || '').trim().slice(0, 500) || null,
      });
    }

    if (!esAltaConsultorio && !b.es_recontrol && importe(b.sena) <= 0 && !estaPago(b)) {
      return NextResponse.json(
        { success: false, error: 'El paciente debe tener seña o pago registrado' },
        { status: 400 }
      );
    }

    const codigo = b.codigo || null;
    const ventaId = b.venta_id ?? null;
    const origen = b.origen || 'venta';
    const fechaSena = esAltaConsultorio ? null : (b.fecha_sena || new Date().toISOString());

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
        // Una nueva alta manual sólo reutiliza una cita todavía abierta. En
        // cambio, cuando llega la venta desde la óptica también puede adoptar
        // la consulta manual recién atendida: muchas personas dejan la seña al
        // salir del consultorio. El límite evita unir una venta nueva con una
        // consulta antigua de la misma persona.
        const condicionEstado = esAltaConsultorio
          ? "estado IN ('pendiente','agendado')"
          : `(estado IN ('pendiente','agendado') OR
              (origen = 'consultorio' AND estado = 'atendido'
               AND actualizado_en > NOW() - INTERVAL '90 days'))`;
        const r = await medicoPool.query(
          `SELECT id FROM medico_agenda
            WHERE regexp_replace(COALESCE(cedula,''), '[^0-9]', '', 'g') = $1
              AND venta_id IS NULL
              AND ${condicionEstado}
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
                total = COALESCE($3::text, total),
                sena = COALESCE($4::text, sena),
                saldo = COALESCE($5::text, saldo),
                fnac = COALESCE($6::text, fnac),
                edad = COALESCE($7::text, edad),
                codigo = COALESCE($8::text, codigo),
                -- Si la cita se adopta al dejar la seña, la marca de "recién
                -- llegó" es ahora: el médico tiene que verlo como reciente.
                fecha_sena = COALESCE($9::timestamptz, fecha_sena,
                                      CASE WHEN $10::int IS NOT NULL THEN NOW() END),
                venta_id = COALESCE($10::int, venta_id),
                -- Al adoptar una cita que estaba sin seña, pasa a ser una venta
                origen = CASE WHEN $10::int IS NOT NULL THEN 'venta' ELSE origen END,
                -- El día y la hora del consultorio mandan: solo se completan si
                -- estaban vacíos, nunca se pisa lo que ya cargó la secretaria.
                fecha_agendada = COALESCE(fecha_agendada, $11::date),
                hora_agendada  = COALESCE(hora_agendada, $12::text),
                estado = CASE WHEN estado = 'pendiente'
                               AND (COALESCE(fecha_agendada, $11::date) IS NOT NULL
                                 OR COALESCE(hora_agendada, $12::text) IS NOT NULL)
                              THEN 'agendado' ELSE estado END,
                actualizado_en = NOW()
          WHERE id = $13::int
        RETURNING ${COLUMNAS_LISTA}`,
        [b.nombre, b.telefono, b.total, b.sena, b.saldo, b.fnac, b.edad, codigo,
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
        (codigo, cedula, nombre, fnac, edad, telefono, total, sena, saldo, fecha_sena, origen,
         estado, venta_id, nota, fecha_agendada, hora_agendada, es_recontrol, motivo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11::text,$12::text,
               $13::int,$14::text,$15::date,$16::text,$17::boolean,$18::text)
       RETURNING ${COLUMNAS_LISTA}`,
      [
        codigo,
        b.cedula || null,
        b.nombre || null,
        b.fnac || null,
        b.edad || null,
        b.telefono || null,
        b.total || null,
        b.sena || null,
        b.saldo || null,
        fechaSena,
        origen,
        // Si ya viene con día u hora, nace agendado: no hay nada que coordinar
        b.fecha_agendada || b.hora_agendada ? 'agendado' : 'pendiente',
        ventaId,
        b.nota || null,
        b.fecha_agendada || null,
        b.hora_agendada || null,
        !!b.es_recontrol,
        b.motivo || null,
      ]
    );

    // Avisar al otro lado. El alta manual avisa a la óptica; las altas con
    // seña/pago y los recontroles del programa avisan al consultorio.
    const nombre = res.rows[0].nombre || 'Un paciente';
    const motivoTxt = b.motivo ? ' Motivo: ' + b.motivo + '.' : '';
    if (esAltaConsultorio) {
      await avisar('optica', {
        titulo: 'Paciente agregado por consultorio',
        cuerpo: nombre + ' fue anotado por la secretaria' +
                (b.fecha_agendada ? ' para el ' + b.fecha_agendada : '') +
                (b.hora_agendada ? ' a las ' + b.hora_agendada : '') + '.',
        tag: 'alta-consultorio',
        importante: true,
      });
    } else if (b.es_recontrol) {
      await avisar('consultorio', {
        titulo: '🔄 Re-control',
        cuerpo: nombre + ' viene a recontrolarse.' + motivoTxt + ' Falta darle día y hora.',
        tag: 'alta-optica',
        importante: true,
      });
    } else {
      const monto = importe(b.sena);
      const pagoCompleto = estaPago(b);
      await avisar('consultorio', {
        titulo: 'Paciente nuevo',
        cuerpo: nombre + (pagoCompleto
                  ? ' ya pagó y puede atenderse'
                  : ' dejó seña de $' + monto.toLocaleString('es-UY') + ' y puede atenderse') +
                '. Falta darle día y hora.',
        tag: 'alta-optica',
        importante: true,
      });
    }

    return NextResponse.json({ success: true, data: res.rows[0], nuevo: true });
  } catch (error) {
    console.error('Medico POST agenda error:', error);
    return NextResponse.json({ success: false, error: 'Error al crear el registro' }, { status: 500 });
  }
}

/**
 * Borra un registro de la agenda, con sus mensajes. Lo puede hacer el programa
 * o el usuario de la óptica desde la página. El consultorio no: puede marcar
 * "no vino / canceló", pero no borrar, para que no se pierda el registro de lo
 * que pasó.
 */
export async function DELETE(request: NextRequest) {
  try {
    const esPrograma = esSyncDelPrograma(request);
    const sesion = esPrograma ? null : await sesionDesdeRequest(request);
    if (!esPrograma && sesion?.rol !== 'optica') {
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
    await asegurarColumnasPago();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const permitidos = esPrograma
      ? CAMPOS_PROGRAMA
      : sesion?.rol === 'optica'
        ? CAMPOS_OPTICA
        : CAMPOS_CONSULTORIO;
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
