import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { autorizado } from '@/lib/rabaquinoAuth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

let columnasAditivasPromise: Promise<void> | null = null;

async function asegurarColumnasAditivas() {
  if (!columnasAditivasPromise) {
    columnasAditivasPromise = (async () => {
      const existentes = await pool.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'rabaquino_pedidos'
            AND column_name = ANY($1::text[])`,
        [['notas', 'numero_boleta']]
      );
      const columnas = new Set(existentes.rows.map((row) => row.column_name));
      if (!columnas.has('notas') || !columnas.has('numero_boleta')) {
        await pool.query(
          `ALTER TABLE rabaquino_pedidos
             ADD COLUMN IF NOT EXISTS notas TEXT,
             ADD COLUMN IF NOT EXISTS numero_boleta TEXT`
        );
      }
    })().catch((error) => {
      columnasAditivasPromise = null;
      throw error;
    });
  }
  await columnasAditivasPromise;
}

// Columnas permitidas para insertar/actualizar (evita inyección vía nombres de campo arbitrarios)
const CAMPOS_PEDIDO = [
  'sucursal', 'cliente', 'cedula', 'telefono', 'fecha_venta',
  'numero_trabajo', 'numero_trabajo2', 'numero_trabajo3',
  'lej_od_eje', 'lej_od_cil', 'lej_od_esf', 'lej_oi_eje', 'lej_oi_cil', 'lej_oi_esf',
  'add_val',
  'cer_od_eje', 'cer_od_cil', 'cer_od_esf', 'cer_oi_eje', 'cer_oi_cil', 'cer_oi_esf',
  'dist_od', 'dist_oi', 'alt_od', 'alt_oi',
  'k', 'a', 'd', 'p', 'k2', 'a2', 'd2', 'p2',
  'c1_material', 'c1_tipo', 'c1_color', 'c1_trat',
  'c2_material', 'c2_tipo', 'c2_color', 'c2_trat',
  'c3_material', 'c3_tipo', 'c3_color', 'c3_trat',
  'armazones', 'armazones2', 'armazones3',
  'precio', 'sena', 'forma_pago', 'saldo', 'tarjeta', 'cuotas',
  'medico', 'archivo_excel', 'tipo_pedido', 'estado',
  'fecha_procesado', 'direccion', 'email', 'fecha_nacimiento',
  'notas', 'numero_boleta',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursal = searchParams.get('sucursal');

    // Modo liviano para las tildes verdes del programa: consulta cada 5 minutos
    // pero solo necesita saber qué archivo quedó procesado. Traer las ~60
    // columnas de los 680 pedidos para leer dos campos eran ~400 KB por vuelta:
    // eso, junto con el polling del portal, agotó la cuota de Neon el
    // 22/07/2026. Así son ~5 KB.
    const soloProcesados = searchParams.get('solo_procesados') === '1';
    if (soloProcesados) {
      const res = await pool.query(
        `SELECT archivo_excel, estado FROM rabaquino_pedidos
          WHERE estado = 'procesado' AND archivo_excel IS NOT NULL AND archivo_excel <> ''
          ORDER BY fecha_subida DESC LIMIT 5000`
      );
      return NextResponse.json({ success: true, data: res.rows });
    }

    // De acá para abajo la respuesta trae TODO el pedido: nombre, cédula,
    // teléfono, dirección, email y la graduación del cliente. Hasta ahora se lo
    // devolvía a cualquiera que supiera la URL. La usa solo el portal, que
    // manda el token de sesión, así que exigirlo no le cambia nada a nadie.
    //
    // La variante liviana de arriba (solo_procesados=1) sigue abierta a
    // propósito: la consume el programa de escritorio, y hasta que la versión
    // nueva no esté corriendo en las dos PCs, cerrarla dejaría sin tildes
    // verdes a la que todavía tenga el programa abierto con el código viejo.
    if (!(await autorizado(request))) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    let query = 'SELECT * FROM rabaquino_pedidos';
    const params: any[] = [];
    if (sucursal && sucursal !== 'todas') {
      query += ' WHERE sucursal = $1';
      params.push(sucursal);
    }
    query += ' ORDER BY fecha_subida DESC LIMIT 10000';

    const result = await pool.query(query, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Rabaquino GET pedidos error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Hasta ahora esta ruta aceptaba escrituras de cualquiera con la URL.
    // `autorizado` deja pasar al portal con sesion iniciada o al programa de
    // escritorio con su X-Sync-Secret; los dos la usan.
    if (!(await autorizado(request))) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // La migración es aditiva e idempotente. Se ejecuta solo antes de una
    // escritura; las lecturas del portal nunca dependen de permisos DDL.
    await asegurarColumnasAditivas();
    const body = await request.json();
    const campos = Object.keys(body).filter((k) => CAMPOS_PEDIDO.includes(k));

    if (campos.length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos' }, { status: 400 });
    }

    const columnas = campos.join(', ');
    const marcadores = campos.map((_, i) => `$${i + 1}`).join(', ');
    const valores = campos.map((c) => body[c]);

    const result = await pool.query(
      `INSERT INTO rabaquino_pedidos (${columnas}) VALUES (${marcadores}) RETURNING *`,
      valores
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino POST pedidos error:', error);
    return NextResponse.json({ success: false, error: 'Error al crear pedido' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Hasta ahora esta ruta aceptaba escrituras de cualquiera con la URL.
    // `autorizado` deja pasar al portal con sesion iniciada o al programa de
    // escritorio con su X-Sync-Secret; los dos la usan.
    if (!(await autorizado(request))) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    await asegurarColumnasAditivas();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const body = await request.json();
    const campos = Object.keys(body).filter((k) => CAMPOS_PEDIDO.includes(k));
    if (campos.length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos' }, { status: 400 });
    }

    const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const valores = campos.map((c) => body[c]);
    valores.push(id);

    const result = await pool.query(
      `UPDATE rabaquino_pedidos SET ${sets} WHERE id = $${valores.length} RETURNING *`,
      valores
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino PATCH pedidos error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Hasta ahora esta ruta aceptaba escrituras de cualquiera con la URL.
    // `autorizado` deja pasar al portal con sesion iniciada o al programa de
    // escritorio con su X-Sync-Secret; los dos la usan.
    if (!(await autorizado(request))) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const usuarioActual = searchParams.get('usuario_actual');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }
    if (usuarioActual !== 'martin') {
      return NextResponse.json({ success: false, error: 'No autorizado para eliminar' }, { status: 403 });
    }

    const result = await pool.query('DELETE FROM rabaquino_pedidos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rabaquino DELETE pedidos error:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar pedido' }, { status: 500 });
  }
}
