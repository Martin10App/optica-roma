import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

// Ruta de un solo uso: crea las tablas de la agenda del médico en Neon.
// Se llama a mano una vez (con el mismo secreto que usa el sync del programa)
// y después queda inofensiva, porque todo es CREATE TABLE IF NOT EXISTS.
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sync-secret');
  if (!secret || secret !== process.env.RABAQUINO_SYNC_SECRET) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS medico_usuarios (
        id            SERIAL PRIMARY KEY,
        usuario       TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol           TEXT NOT NULL DEFAULT 'consultorio',
        nombre        TEXT,
        token         TEXT,
        token_exp     TIMESTAMPTZ
      )
    `);

    // Por si la tabla ya existía de una corrida anterior sin estas columnas
    await client.query('ALTER TABLE medico_usuarios ADD COLUMN IF NOT EXISTS token TEXT');
    await client.query('ALTER TABLE medico_usuarios ADD COLUMN IF NOT EXISTS token_exp TIMESTAMPTZ');
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_usuarios_token ON medico_usuarios(token)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS medico_agenda (
        id              SERIAL PRIMARY KEY,
        codigo          TEXT UNIQUE,
        cedula          TEXT,
        nombre          TEXT,
        fnac            TEXT,
        edad            TEXT,
        telefono        TEXT,
        sena            TEXT,
        fecha_sena      TIMESTAMPTZ,
        origen          TEXT NOT NULL DEFAULT 'venta',
        estado          TEXT NOT NULL DEFAULT 'pendiente',
        fecha_agendada  DATE,
        hora_agendada   TEXT,
        nota            TEXT,
        receta_foto     TEXT,
        receta_nombre   TEXT,
        receta_subida   TIMESTAMPTZ,
        receta_bajada   TIMESTAMPTZ,
        venta_id        INTEGER,
        creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS medico_mensajes (
        id                 SERIAL PRIMARY KEY,
        agenda_id          INTEGER,
        autor              TEXT NOT NULL,
        autor_nombre       TEXT,
        texto              TEXT NOT NULL,
        creado_en          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        leido_optica       BOOLEAN NOT NULL DEFAULT FALSE,
        leido_consultorio  BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);

    // Suscripciones a las notificaciones. Una fila por dispositivo: el médico
    // puede tener el celular y la tablet, y la secretaria el suyo.
    await client.query(`
      CREATE TABLE IF NOT EXISTS medico_push (
        id         SERIAL PRIMARY KEY,
        endpoint   TEXT UNIQUE NOT NULL,
        p256dh     TEXT NOT NULL,
        auth       TEXT NOT NULL,
        rol        TEXT NOT NULL DEFAULT 'consultorio',
        usuario    TEXT,
        creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ultimo_ok  TIMESTAMPTZ
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_push_rol ON medico_push(rol)');

    // Índices para las consultas que hace la página (por estado, por mes, por cédula)
    // Recontrol: cuando un cliente vuelve a controlarse (garantía, no ve bien,
    // etc.). No es una consulta normal, por eso va marcado y con el motivo a la
    // vista. Se agregan por separado por si la tabla ya existía.
    await client.query('ALTER TABLE medico_agenda ADD COLUMN IF NOT EXISTS es_recontrol BOOLEAN NOT NULL DEFAULT FALSE');
    await client.query('ALTER TABLE medico_agenda ADD COLUMN IF NOT EXISTS motivo TEXT');

    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_agenda_estado ON medico_agenda(estado)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_agenda_fecha ON medico_agenda(fecha_sena DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_agenda_cedula ON medico_agenda(cedula)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_agenda_venta ON medico_agenda(venta_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_medico_mensajes_agenda ON medico_mensajes(agenda_id, creado_en)');

    // Alta/actualización de usuarios. Los hashes se mandan en la llamada, no
    // van escritos acá, para que las contraseñas no queden en el repositorio.
    let usuarios: any[] = [];
    try {
      const body = await request.json();
      usuarios = Array.isArray(body?.usuarios) ? body.usuarios : [];
    } catch {
      usuarios = [];
    }

    const creados: string[] = [];
    for (const u of usuarios) {
      const nombreUsuario = String(u?.usuario || '').trim().toLowerCase();
      const hash = String(u?.password_hash || '').trim();
      if (!nombreUsuario || !/^[a-f0-9]{64}$/.test(hash)) continue;

      await client.query(
        `INSERT INTO medico_usuarios (usuario, password_hash, rol, nombre)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (usuario) DO UPDATE
            SET password_hash = EXCLUDED.password_hash,
                rol = EXCLUDED.rol,
                nombre = EXCLUDED.nombre,
                token = NULL, token_exp = NULL`,
        [nombreUsuario, hash, u?.rol === 'optica' ? 'optica' : 'consultorio', u?.nombre || null]
      );
      creados.push(nombreUsuario);
    }

    const tablas = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'medico_%'
      ORDER BY table_name
    `);

    return NextResponse.json({
      success: true,
      tablas: tablas.rows.map((r) => r.table_name),
      usuarios: creados,
    });
  } catch (error) {
    console.error('Medico setup error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  } finally {
    client.release();
  }
}
