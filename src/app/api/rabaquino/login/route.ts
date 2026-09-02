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
    //
    // Una fila por dispositivo, NO una columna en el usuario: `rabaquino` es
    // una cuenta compartida por todo el laboratorio, así que entrar desde una
    // segunda computadora no puede echar a la primera.
    const token = nuevoToken();
    await rabaquinoPool.query(
      `INSERT INTO rabaquino_sesiones (token, usuario_id, exp)
       VALUES ($1, $2, NOW() + INTERVAL '${DIAS_SESION} days')`,
      [token, result.rows[0].id]
    );

    // Barrido de las vencidas, aprovechando que ya estamos escribiendo acá: la
    // tabla no crece para siempre y no hace falta una tarea aparte.
    rabaquinoPool
      .query('DELETE FROM rabaquino_sesiones WHERE exp < NOW()')
      .catch(() => {});

    return NextResponse.json({ success: true, data: { ...result.rows[0], token } });
  } catch (error) {
    console.error('Rabaquino login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
