import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function POST(request: Request) {
  try {
    const { usuario, password_hash } = await request.json();

    if (!usuario || !password_hash) {
      return NextResponse.json({ success: false, error: 'Faltan credenciales' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT id, usuario, rol, sucursales FROM rabaquino_usuarios WHERE usuario = $1 AND password_hash = $2',
      [usuario, password_hash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
