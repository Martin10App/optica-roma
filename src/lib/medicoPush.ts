import webpush from 'web-push';
import { medicoPool } from './medicoAuth';

/**
 * Envío de notificaciones a los celulares donde la agenda está instalada
 * como aplicación.
 *
 * En iPhone las notificaciones web SOLO funcionan si la página fue agregada a
 * la pantalla de inicio desde Safari; en una pestaña común el navegador ni
 * siquiera ofrece el permiso. En Android/Chrome funciona instalada o no, pero
 * conviene instalarla igual para que el icono quede a mano.
 */

let configurado = false;

function configurar(): boolean {
  if (configurado) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;

  webpush.setVapidDetails('mailto:opticaroma@gmail.com', pub, priv);
  configurado = true;
  return true;
}

export type AvisoPush = {
  titulo: string;
  cuerpo: string;
  /** Agrupa avisos del mismo tipo para no apilar diez notificaciones. */
  tag?: string;
  /** true = la notificación queda hasta que la toquen (para lo urgente). */
  importante?: boolean;
  url?: string;
};

/**
 * Manda el aviso a todos los dispositivos de un rol.
 * Nunca lanza excepción: que falle una notificación no puede tumbar el alta de
 * un paciente ni el envío de un mensaje, que es lo que de verdad importa.
 */
export async function avisar(rol: 'optica' | 'consultorio', aviso: AvisoPush): Promise<number> {
  try {
    if (!configurar()) return 0;

    const subs = await medicoPool.query(
      'SELECT id, endpoint, p256dh, auth FROM medico_push WHERE rol = $1::text',
      [rol]
    );
    if (!subs.rowCount) return 0;

    const carga = JSON.stringify({
      titulo: aviso.titulo,
      cuerpo: aviso.cuerpo,
      tag: aviso.tag || 'agenda',
      importante: !!aviso.importante,
      url: aviso.url || '/agenda',
    });

    let enviados = 0;
    const muertas: number[] = [];

    await Promise.all(
      subs.rows.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            carga,
            { TTL: 3600 }
          );
          enviados++;
        } catch (e: any) {
          // 404/410 = el navegador dio de baja esa suscripción (desinstalaron
          // la app, limpiaron datos). Se borra para no reintentar por siempre.
          if (e?.statusCode === 404 || e?.statusCode === 410) muertas.push(s.id);
          else console.error('Push falló:', e?.statusCode, e?.body?.slice?.(0, 120));
        }
      })
    );

    if (muertas.length) {
      await medicoPool.query('DELETE FROM medico_push WHERE id = ANY($1::int[])', [muertas]);
    }
    if (enviados) {
      await medicoPool.query(
        'UPDATE medico_push SET ultimo_ok = NOW() WHERE rol = $1::text AND id <> ALL($2::int[])',
        [rol, muertas]
      );
    }
    return enviados;
  } catch (e) {
    console.error('avisar(): error inesperado', e);
    return 0;
  }
}
