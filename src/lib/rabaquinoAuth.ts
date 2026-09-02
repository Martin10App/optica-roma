import { Pool } from 'pg';
import { randomBytes } from 'crypto';

// Pool compartido por las rutas de /api/rabaquino que necesitan sesión.
export const rabaquinoPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export type RabaquinoSesion = {
  id: number;
  usuario: string;
  rol: string;
  sucursales: string;
};

export function nuevoToken(): string {
  return randomBytes(32).toString('hex');
}

export const DIAS_SESION = 90;

/**
 * Valida el header X-Rabaquino-Token contra rabaquino_usuarios.
 *
 * Hasta ahora el portal no tenía sesión de ninguna clase: el login devolvía la
 * fila del usuario y el navegador la guardaba en localStorage, así que las
 * rutas no tenían nada que verificar y cualquiera con la URL podía escribir.
 *
 * Mismo esquema que la agenda del médico (`medicoAuth.ts`): token aleatorio
 * guardado en la base, con vencimiento deslizante. La verificación de la
 * contraseña NO se toca — así nadie queda afuera por una migración.
 */
export async function sesionDesdeRequest(request: Request): Promise<RabaquinoSesion | null> {
  const token = request.headers.get('x-rabaquino-token');
  if (!token) return null;

  const res = await rabaquinoPool.query(
    `SELECT id, usuario, rol, sucursales, token_exp FROM rabaquino_usuarios
      WHERE token = $1::text AND token_exp > NOW()`,
    [token]
  );
  if (!res.rows.length) return null;

  // Sesión deslizante: mientras la usen se renueva sola y no los echa nunca.
  // Se renueva solo cuando falta poco, no en cada llamada: el portal consulta
  // cada 5 minutos y escribir siempre sería despertar Neon al pedo.
  const venceEn = new Date(res.rows[0].token_exp).getTime() - Date.now();
  if (venceEn < (DIAS_SESION - 5) * 86400000) {
    rabaquinoPool
      .query(
        `UPDATE rabaquino_usuarios SET token_exp = NOW() + INTERVAL '${DIAS_SESION} days'
          WHERE token = $1::text`,
        [token]
      )
      .catch(() => {});   // que no falle la petición por no poder renovar
  }

  const { id, usuario, rol, sucursales } = res.rows[0];
  return { id, usuario, rol, sucursales } as RabaquinoSesion;
}

/** El programa de escritorio se autentica con el mismo secreto que ya usa el sync. */
export function esSyncDelPrograma(request: Request): boolean {
  const secret = request.headers.get('x-sync-secret');
  return !!secret && secret === process.env.RABAQUINO_SYNC_SECRET;
}

/**
 * Portal con sesión válida O el programa con su secreto. Las rutas de
 * escritura las usan los dos, así que ninguna puede exigir solo una de las dos
 * vías sin romper a la otra.
 */
export async function autorizado(request: Request): Promise<boolean> {
  if (esSyncDelPrograma(request)) return true;
  return (await sesionDesdeRequest(request)) !== null;
}
