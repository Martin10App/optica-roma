import { NextResponse } from 'next/server';
import { rabaquinoPool, nuevoToken, DIAS_SESION } from '@/lib/rabaquinoAuth';

export async function POST(request: Request) {
  try {
    const { usuario, password_hash } = await request.json();

    if (!usuario || !password_hash) {
      return NextResponse.json({ success: false, error: 'Faltan credenciales' }, { status: 400 });
    }

    // La verificación de la contraseña queda EXACTAMENTE como estaba (el
    // navegador manda el SHA-256 y se compara contra la columna). Cambiarla a
    // bcrypt obligaría a migrar las contraseñas guardadas, y si eso sale mal
    // los usuarios quedan afuera. Es una mejora aparte, no de este cambio.
    const result = await rabaquinoPool.query(
      'SELECT id, usuario, rol, sucursales FROM rabaquino_usuarios WHERE usuario = $1 AND password_hash = $2',
      [usuario, password_hash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    // Lo nuevo: además de confirmar quién es, se emite un token de sesión. Sin
    // esto las rutas de escritura no tenían forma de saber si quien llama
    // había entrado alguna vez.
    const token = nuevoToken();
    await rabaquinoPool.query(
      `UPDATE rabaquino_usuarios
          SET token = $1, token_exp = NOW() + INTERVAL '${DIAS_SESION} days'
        WHERE id = $2`,
      [token, result.rows[0].id]
    );

    return NextResponse.json({ success: true, data: { ...result.rows[0], token } });
  } catch (error) {
    console.error('Rabaquino login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
