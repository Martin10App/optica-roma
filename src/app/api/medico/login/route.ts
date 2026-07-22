import { NextResponse } from 'next/server';
import { medicoPool, nuevoToken, DIAS_SESION } from '@/lib/medicoAuth';

export async function POST(request: Request) {
  try {
    const { usuario, password_hash } = await request.json();

    if (!usuario || !password_hash) {
      return NextResponse.json({ success: false, error: 'Faltan credenciales' }, { status: 400 });
    }

    const res = await medicoPool.query(
      `SELECT id, usuario, rol, nombre FROM medico_usuarios
        WHERE usuario = $1 AND password_hash = $2`,
      [String(usuario).trim().toLowerCase(), password_hash]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Sesión larga (se renueva sola mientras la usen): la agenda se abre desde
    // el celular varias veces al día y tener que escribir la contraseña cada
    // vez haría que dejen de usarla. Se corta cambiando la contraseña, que
    // borra el token y echa a todos los dispositivos.
    const token = nuevoToken();
    await medicoPool.query(
      `UPDATE medico_usuarios
          SET token = $1::text, token_exp = NOW() + INTERVAL '${DIAS_SESION} days'
        WHERE id = $2::int`,
      [token, res.rows[0].id]
    );

    return NextResponse.json({ success: true, data: { ...res.rows[0], token } });
  } catch (error) {
    console.error('Medico login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
