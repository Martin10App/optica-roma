import { NextRequest, NextResponse } from 'next/server';
import { medicoPool, sesionDesdeRequest } from '@/lib/medicoAuth';
import { avisar } from '@/lib/medicoPush';

/** La clave pública VAPID, que el navegador necesita para suscribirse. */
export async function GET(request: NextRequest) {
  const sesion = await sesionDesdeRequest(request);
  if (!sesion) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const clave = process.env.VAPID_PUBLIC_KEY || '';
  if (!clave) {
    return NextResponse.json(
      { success: false, error: 'Las notificaciones no están configuradas en el servidor' },
      { status: 503 }
    );
  }

  // ¿Este dispositivo ya está suscripto? Sirve para pintar bien el botón.
  const endpoint = new URL(request.url).searchParams.get('endpoint');
  let suscripto = false;
  if (endpoint) {
    const r = await medicoPool.query('SELECT 1 FROM medico_push WHERE endpoint = $1::text', [endpoint]);
    suscripto = !!r.rowCount;
  }

  return NextResponse.json({ success: true, clave, suscripto });
}

/** Alta del dispositivo. Se guarda con el rol del que inició sesión. */
export async function POST(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    if (!sesion) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { endpoint, keys, prueba } = await request.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ success: false, error: 'Suscripción incompleta' }, { status: 400 });
    }

    const rol = sesion.rol === 'optica' ? 'optica' : 'consultorio';

    // El mismo endpoint puede reaparecer si vuelven a activar: se actualiza,
    // porque las claves cambian cada vez que el navegador renueva la suscripción.
    await medicoPool.query(
      `INSERT INTO medico_push (endpoint, p256dh, auth, rol, usuario)
       VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)
       ON CONFLICT (endpoint) DO UPDATE
          SET p256dh = EXCLUDED.p256dh,
              auth = EXCLUDED.auth,
              rol = EXCLUDED.rol,
              usuario = EXCLUDED.usuario`,
      [endpoint, keys.p256dh, keys.auth, rol, sesion.usuario]
    );

    // Aviso de bienvenida, para que se vea en el momento que funciona
    if (prueba) {
      await avisar(rol, {
        titulo: 'Notificaciones activadas',
        cuerpo: 'Vas a recibir un aviso cuando llegue un paciente nuevo.',
        tag: 'bienvenida',
      }, endpoint);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medico POST push error:', error);
    return NextResponse.json({ success: false, error: 'No se pudo activar' }, { status: 500 });
  }
}

/** Baja del dispositivo (el usuario apaga las notificaciones). */
export async function DELETE(request: NextRequest) {
  try {
    const sesion = await sesionDesdeRequest(request);
    if (!sesion) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const endpoint = new URL(request.url).searchParams.get('endpoint');
    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'Falta endpoint' }, { status: 400 });
    }
    await medicoPool.query('DELETE FROM medico_push WHERE endpoint = $1::text', [endpoint]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medico DELETE push error:', error);
    return NextResponse.json({ success: false, error: 'No se pudo desactivar' }, { status: 500 });
  }
}
